#!/usr/bin/env node
/**
 * Blogger to PayloadCMS Migration Script
 * 
 * Scrapes posts from annemieke0302.blogspot.com
 * and formats them for PayloadCMS import
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Years to scrape (based on archive)
const YEARS = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2013];

// Store all posts
const allPosts = [];

/**
 * Fetch a URL and return HTML content
 */
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

/**
 * Extract posts from a year's archive page HTML
 */
function extractPostsFromHtml(html, year) {
  const posts = [];
  
  // Match blog post entries
  // Blogger format: <h3 class="post-title"> or similar structures
  const postRegex = /<h3[^>]*class="[^"]*post-title[^"]*"[^>]*>.*?<a href="([^"]+)"[^>]*>([^<]+)<\/a>.*?<\/h3>/gi;
  
  let match;
  while ((match = postRegex.exec(html)) !== null) {
    const url = match[1];
    const title = match[2].trim();
    
    // Extract date from URL (Blogger format: /YYYY/MM/DD/slug.html)
    const dateMatch = url.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    let date = null;
    if (dateMatch) {
      date = `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    
    posts.push({
      title,
      url,
      date,
      year,
      slug: url.split('/').pop().replace('.html', ''),
    });
  }
  
  return posts;
}

/**
 * Extract full content from a single post page
 */
function extractPostContent(html) {
  // Try to find the main post content
  // Blogger typically has a div with class "post-body" or similar
  const bodyMatch = html.match(/<div[^>]*class="[^"]*post-body[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div[^>]*class="[^"]*post-footer|<div[^>]*class="[^"]*comments|<\/article>)/i);
  
  if (bodyMatch) {
    let content = bodyMatch[1];
    
    // Clean up HTML
    content = content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
    
    return content;
  }
  
  return null;
}

/**
 * Categorize posts based on title and content
 */
function categorizePost(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = content?.toLowerCase() || '';
  
  // Children's stories keywords
  if (titleLower.includes('verhaal') || 
      titleLower.includes('sprookje') ||
      titleLower.includes('kinder') ||
      contentLower.includes('er was eens')) {
    return 'childrens-stories';
  }
  
  // Audio content
  if (titleLower.includes('hardop') ||
      titleLower.includes('audio') ||
      titleLower.includes('podcast')) {
    return 'audio';
  }
  
  // Personal/about me stories
  if (titleLower.includes('over mij') ||
      titleLower.includes('mijn') ||
      contentLower.includes('manlief') ||
      contentLower.includes('mijn moeder') ||
      contentLower.includes('mijn vader') ||
      contentLower.includes('adolescent') ||
      contentLower.includes('grote puber') ||
      contentLower.includes('jongste zoon') ||
      contentLower.includes('oudste zoon')) {
    return 'about-me';
  }
  
  // Default to columns
  return 'columns';
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('🚀 Starting Blogger to PayloadCMS migration...\n');
  
  // Create output directory
  const outputDir = path.join(__dirname, 'migration-output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Fetch all year archive pages
  for (const year of YEARS) {
    const url = `https://annemieke0302.blogspot.com/${year}`;
    console.log(`📅 Fetching ${year}...`);
    
    try {
      const html = await fetchUrl(url);
      const posts = extractPostsFromHtml(html, year);
      console.log(`   Found ${posts.length} posts`);
      allPosts.push(...posts);
    } catch (err) {
      console.error(`   Error fetching ${year}:`, err.message);
    }
  }
  
  console.log(`\n📊 Total posts found: ${allPosts.length}\n`);
  
  // Now fetch full content for each post
  console.log('📝 Fetching full post contents...');
  
  for (let i = 0; i < allPosts.length; i++) {
    const post = allPosts[i];
    process.stdout.write(`   [${i + 1}/${allPosts.length}] ${post.title.substring(0, 50)}... `);
    
    try {
      // Add delay to be respectful to the server
      await new Promise(r => setTimeout(r, 500));
      
      const html = await fetchUrl(post.url);
      const content = extractPostContent(html);
      
      if (content) {
        post.fullContent = content;
        post.category = categorizePost(post.title, content);
        console.log('✓');
      } else {
        console.log('⚠ (no content)');
        post.category = 'columns'; // default
      }
    } catch (err) {
      console.log(`✗ (${err.message})`);
      post.category = 'columns'; // default
    }
  }
  
  console.log('\n📁 Generating import files...\n');
  
  // Group by category
  const columns = allPosts.filter(p => p.category === 'columns');
  const aboutMe = allPosts.filter(p => p.category === 'about-me');
  const childrens = allPosts.filter(p => p.category === 'childrens-stories');
  const audio = allPosts.filter(p => p.category === 'audio');
  
  // Generate JSON files for each collection
  const generateImportJson = (posts, collection) => {
    return posts.map(post => {
      const base = {
        title: post.title,
        slug: post.slug,
        content: post.fullContent || post.title,
        draft: false,
        publishDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
      };
      
      if (collection === 'about-me') {
        return {
          ...base,
          chapterTitle: post.title,
          category: 'huidig', // Default category
          order: 10,
        };
      }
      
      return base;
    });
  };
  
  // Save JSON files
  fs.writeFileSync(
    path.join(outputDir, 'columns-import.json'),
    JSON.stringify(generateImportJson(columns, 'columns'), null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'about-me-import.json'),
    JSON.stringify(generateImportJson(aboutMe, 'about-me'), null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'childrens-stories-import.json'),
    JSON.stringify(generateImportJson(childrens, 'childrens-stories'), null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'audio-import.json'),
    JSON.stringify(generateImportJson(audio, 'audio'), null, 2)
  );
  
  // Save summary report
  const summary = {
    totalPosts: allPosts.length,
    byCategory: {
      columns: columns.length,
      'about-me': aboutMe.length,
      'childrens-stories': childrens.length,
      audio: audio.length,
    },
    posts: allPosts.map(p => ({
      title: p.title,
      category: p.category,
      date: p.date,
      slug: p.slug,
    })),
  };
  
  fs.writeFileSync(
    path.join(outputDir, 'migration-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  console.log('✅ Migration complete!');
  console.log('\n📂 Output files:');
  console.log(`   - ${outputDir}/columns-import.json (${columns.length} posts)`);
  console.log(`   - ${outputDir}/about-me-import.json (${aboutMe.length} posts)`);
  console.log(`   - ${outputDir}/childrens-stories-import.json (${childrens.length} posts)`);
  console.log(`   - ${outputDir}/audio-import.json (${audio.length} posts)`);
  console.log(`   - ${outputDir}/migration-summary.json (overview)`);
  console.log('\n⚠️  Note: Review and adjust categories before importing!');
}

// Run migration
migrate().catch(console.error);
