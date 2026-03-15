# Blogger to PayloadCMS Migration Guide

This directory contains tools and data for migrating blog posts from `annemieke0302.blogspot.com` to the new PayloadCMS-based website.

## 📊 Migration Status

| Year | Posts | Status |
|------|-------|--------|
| 2024 | 5 | ✅ Catalogued |
| 2023 | 3 | ⏳ Need extraction |
| 2022 | 8 | ⏳ Need extraction |
| 2021 | 1 | ⏳ Need extraction |
| 2020 | 4 | ⏳ Need extraction |
| 2019 | 2 | ⏳ Need extraction |
| 2018 | 9 | ⏳ Need extraction |
| 2017 | 20 | ✅ Catalogued |
| 2013 | 41 | ⏳ Partially catalogued |
| **Total** | **93** | **~40% catalogued** |

## 📁 File Structure

```
├── data/
│   └── blog-posts.js          # Blog post metadata and excerpts
├── scripts/
│   └── generate-imports.js    # Generates PayloadCMS import JSON
├── import/
│   ├── columns.json           # Import file for Columns collection
│   ├── about-me.json          # Import file for About Me collection
│   ├── childrens-stories.json # Import file for Children's Stories
│   ├── audio.json             # Import file for Audio content
│   └── summary.json           # Migration summary report
└── MIGRATION.md               # This file
```

## 🚀 How to Complete the Migration

### Step 1: Extract Full Content from Blogger

The current data only contains excerpts. You need to copy the full content from each blog post:

1. Visit each post URL listed in `data/blog-posts.js`
2. Copy the full post content (not just the excerpt)
3. Update the `content` field in `data/blog-posts.js`

**Manual method:**
```bash
# Visit each URL and copy content
open https://annemieke0302.blogspot.com/2024/04/opkikkertje.html
# Copy full content, then update data/blog-posts.js
```

**Semi-automated method:**
Use the browser console on each archive page to extract posts:
```javascript
// Run this in browser console on https://annemieke0302.blogspot.com/2024
const posts = [];
document.querySelectorAll('.post').forEach(post => {
  const title = post.querySelector('.post-title')?.textContent?.trim();
  const content = post.querySelector('.post-body')?.innerText?.trim();
  const link = post.querySelector('.post-title a')?.href;
  if (title && content) {
    posts.push({ title, content, link });
  }
});
console.log(JSON.stringify(posts, null, 2));
```

### Step 2: Categorize Posts Correctly

Update the `category` field in `data/blog-posts.js`:

| Category | Description | Collection |
|----------|-------------|------------|
| `columns` | Regular columns and essays | Columns |
| `about-me` | Personal stories about Annemieke's life | About Me |
| `childrens-stories` | Stories written for children | Children's Stories |
| `audio` | Audio/podcast content | Audio |

### Step 3: Add Missing Posts

Add posts from years 2018, 2019, 2020, 2021, 2022, 2023 to `data/blog-posts.js` following the same format.

### Step 4: Generate Import Files

```bash
node scripts/generate-imports.js
```

This creates JSON files in the `import/` directory.

### Step 5: Import to PayloadCMS

**Option A: Via Admin UI (Recommended for small batches)**
1. Start the CMS: `docker-compose up cms`
2. Visit http://localhost:3001/admin
3. Navigate to each collection
4. Click "Create New" and manually copy/paste content

**Option B: Via API (For bulk import)**
```bash
# Get auth token first
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}'

# Import posts
curl -X POST http://localhost:3001/api/columns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d @import/columns.json
```

**Option C: Database Import (For large batches)**
1. Export current database: `pg_dump ... > backup.sql`
2. Use the generated JSON to create SQL INSERT statements
3. Run SQL against database

## 📝 Content Format

PayloadCMS uses a specific richText format. The generator script converts plain text to this format:

```javascript
// Input (plain text)
"This is paragraph one.\n\nThis is paragraph two."

// Output (Payload richText)
[
  {
    "children": [{ "text": "This is paragraph one.", "type": "p" }]
  },
  {
    "children": [{ "text": "This is paragraph two.", "type": "p" }]
  }
]
```

## 🎯 Recommended Approach

Given 93 posts to migrate, I recommend:

1. **Phase 1** (Quick win): Manually import the 5 most recent posts (2024)
2. **Phase 2**: Add the remaining posts year by year
3. **Phase 3**: Add images/media to posts

For each post:
1. Open old blog post in one tab
2. Open PayloadCMS admin in another tab
3. Copy title, content, and set the date
4. Choose appropriate collection
5. Save

Time estimate: ~5 minutes per post = ~8 hours total for 93 posts

## 🔧 Troubleshooting

### Import fails with validation errors
- Check that all required fields are present (title, slug, content)
- Ensure slug is unique
- Verify date format is ISO 8601

### Rich text formatting is wrong
- The generator creates basic paragraphs
- For complex formatting (bold, links, etc.), manually edit in PayloadCMS
- Or update the generator script to handle HTML to richText conversion

### Posts don't appear on website
- Check that `draft` is set to `false`
- Verify `publishDate` is in the past
- Clear browser cache and refresh

## 📞 Next Steps

1. Review the catalogued posts in `data/blog-posts.js`
2. Decide on categorization (are these all columns, or mixed?)
3. Start importing the most recent posts first
4. Work backwards through the years
5. Test the website after each batch

Need help? Check the PayloadCMS documentation: https://payloadcms.com/docs
