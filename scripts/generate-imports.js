#!/usr/bin/env node
/**
 * PayloadCMS Import Generator
 * 
 * This script converts blog post metadata into PayloadCMS-compatible import JSON
 * 
 * Usage:
 *   node scripts/generate-imports.js
 * 
 * Output:
 *   - import/columns.json
 *   - import/about-me.json  
 *   - import/childrens-stories.json
 *   - import/audio.json
 */

import { allBlogPosts } from '../data/blog-posts.js';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'import');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Convert plain text to Payload richText format
function textToRichText(text) {
  if (!text) return [{ children: [{ text: '' }] }];
  
  // Split by paragraphs and convert to Payload format
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  return paragraphs.map(para => ({
    children: [
      {
        text: para.trim().replace(/\n/g, ' ')
      }
    ],
    type: 'p'
  }));
}

// Generate Columns import JSON
function generateColumnsImport(posts) {
  return posts.map(post => ({
    title: post.title,
    slug: post.slug,
    content: textToRichText(post.excerpt),
    draft: false,
    publishDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
  }));
}

// Generate AboutMe import JSON  
function generateAboutMeImport(posts) {
  const categoryMap = {
    'kinderen': 'kinderen',
    'huwelijk': 'huwelijk', 
    'werk': 'carriere',
    'vakantie': 'reizen',
    'familie': 'huidig'
  };
  
  return posts.map((post, index) => ({
    chapterTitle: post.title,
    slug: post.slug,
    category: 'huidig', // Default - should be reviewed
    content: textToRichText(post.excerpt),
    order: (index + 1) * 10,
    draft: false,
    publishDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
  }));
}

// Generate Children's Stories import JSON
function generateChildrensStoriesImport(posts) {
  return posts.map(post => ({
    title: post.title,
    slug: post.slug,
    content: textToRichText(post.excerpt),
    ageGroup: '6-8', // Default - should be reviewed
    readingTime: 5, // Default estimate
    draft: false,
    publishDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
  }));
}

// Generate Audio import JSON
function generateAudioImport(posts) {
  return posts.map(post => ({
    title: post.title,
    slug: post.slug,
    description: post.excerpt,
    // audioFile would need to be uploaded separately
    duration: 0, // Would need to be determined
    draft: true, // Default to draft since audio file needs to be added
    publishDate: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
  }));
}

// Main execution
console.log('📝 Generating PayloadCMS import files...\n');

// Group posts by category
const columns = allBlogPosts.filter(p => p.category === 'columns');
const aboutMe = allBlogPosts.filter(p => p.category === 'about-me');
const childrens = allBlogPosts.filter(p => p.category === 'childrens-stories');
const audio = allBlogPosts.filter(p => p.category === 'audio');

console.log(`📊 Post breakdown:`);
console.log(`   - Columns: ${columns.length}`);
console.log(`   - About Me: ${aboutMe.length}`);
console.log(`   - Children's Stories: ${childrens.length}`);
console.log(`   - Audio: ${audio.length}`);
console.log(`   - Total: ${allBlogPosts.length}\n`);

// Generate import files
if (columns.length > 0) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'columns.json'),
    JSON.stringify(generateColumnsImport(columns), null, 2)
  );
  console.log('✅ Generated: import/columns.json');
}

if (aboutMe.length > 0) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'about-me.json'),
    JSON.stringify(generateAboutMeImport(aboutMe), null, 2)
  );
  console.log('✅ Generated: import/about-me.json');
}

if (childrens.length > 0) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'childrens-stories.json'),
    JSON.stringify(generateChildrensStoriesImport(childrens), null, 2)
  );
  console.log('✅ Generated: import/childrens-stories.json');
}

if (audio.length > 0) {
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'audio.json'),
    JSON.stringify(generateAudioImport(audio), null, 2)
  );
  console.log('✅ Generated: import/audio.json');
}

// Generate summary report
const summary = {
  totalPosts: allBlogPosts.length,
  generatedAt: new Date().toISOString(),
  categories: {
    columns: columns.length,
    aboutMe: aboutMe.length,
    childrensStories: childrens.length,
    audio: audio.length
  },
  posts: allBlogPosts.map(p => ({
    title: p.title,
    category: p.category,
    date: p.date,
    slug: p.slug
  }))
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'summary.json'),
  JSON.stringify(summary, null, 2)
);

console.log('\n📄 Generated: import/summary.json');
console.log('\n⚠️  IMPORTANT:');
console.log('   1. Review the generated JSON files');
console.log('   2. Update categories as needed');
console.log('   3. The excerpts need to be replaced with full content');
console.log('   4. For audio posts, audio files need to be uploaded separately');
console.log('\n🎯 Next steps:');
console.log('   1. Fetch full blog post content from Blogger');
console.log('   2. Update the data/blog-posts.js file with full content');
console.log('   3. Run this script again to regenerate imports');
console.log('   4. Import via PayloadCMS admin or API');
