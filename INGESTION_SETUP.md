# Content Ingestion Setup

Your portfolio content is automatically ingested into the RAG system using GitHub Actions.

## How It Works

1. **Trigger:** Pushes to `main` that modify blog posts or projects
2. **Process:** GitHub Action runs `scripts/ingest-portfolio-content.ts`
3. **Result:** Content is chunked, embedded, and stored in PostgreSQL with pgvector

## What Gets Ingested

### ✅ Blog Posts
- **Location:** `apps/web/src/content/blog/**/*.md[x]`
- **Metadata:** Title, description, category, tags, pubDate
- **Skips:** Posts with `publish: false` in frontmatter

### ✅ Projects
- **Location:** `apps/web/src/content/projects/**/*.md[x]`
- **Metadata:** Title, description, tech stack, metrics
- **Includes:** Project descriptions, achievements, tech used

### ❌ Not Ingested
- Travel logs (for now - can add later)
- Draft/unpublished content
- UI code/components

## Setup Instructions

### 1. Set up PostgreSQL with pgvector

```bash
# Option A: Local PostgreSQL
# Install pgvector extension
CREATE EXTENSION vector;

# Create index (script handles this automatically)
```

Or use a hosted provider:
- **Neon** (recommended) - Free tier with pgvector
- **Supabase** - Built-in pgvector support
- **Railway** - PostgreSQL with extensions

### 2. Add GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions

Add these secrets:

```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
OPENROUTER_API_KEY=sk-or-v1-...
```

**Getting OpenRouter API Key:**
1. Go to https://openrouter.ai/
2. Sign up/login
3. Go to Keys → Create Key
4. Copy the key (starts with `sk-or-v1-`)

### 3. Test Locally First

```bash
# Set environment variables
export DATABASE_URL="postgresql://..."
export OPENROUTER_API_KEY="sk-or-v1-..."

# Run ingestion
pnpm ingest
```

Expected output:
```
🚀 Starting portfolio content ingestion...

📝 Processing blog posts...
  Found 5 published blog posts
  ✍️  Processing: Complete Typesafe REST APIs with TS-rest
  📊 Embedding 5 chunks...
  ✅ Ingested 5 chunks

🚀 Processing projects...
  Found 4 projects
  🛠️  Processing: Andronix
  📊 Embedding 4 chunks...
  ✅ Ingested 4 chunks

🎉 Ingestion complete!
📊 Summary:
   - Blog posts: 5
   - Projects: 4
   - Total chunks: 59
   - Vector index: portfolio_knowledge
```

### 4. Push to GitHub

The GitHub Action will run automatically on push to main:

```bash
git add .
git commit -m "Add content ingestion"
git push
```

Check the Actions tab to see it run!

### 5. Manual Trigger (Optional)

You can also trigger ingestion manually:
1. Go to Actions → "Ingest Portfolio Content"
2. Click "Run workflow"
3. Select branch and run

## Ingestion Details

### Chunking Strategy
- **Size:** 512 tokens per chunk
- **Overlap:** 50 tokens (for context continuity)
- **Separators:** `\n\n`, `\n`, ` ` (prioritizes paragraphs)

### Embedding Model
- **Model:** OpenAI `text-embedding-3-small` via OpenRouter
- **Dimension:** 1536
- **Cost:** ~$0.02 per 1M tokens (very cheap!)

### Vector Storage
- **Database:** PostgreSQL with pgvector
- **Index:** `portfolio_knowledge`
- **Metadata:** Each chunk includes:
  ```json
  {
    "type": "blog" | "project",
    "title": "Post title",
    "category": "Tutorials",
    "tags": ["TypeScript", "Backend"],
    "source": "filename.mdx",
    "url": "/blog/post-slug",
    "chunkIndex": 0,
    "totalChunks": 5
  }
  ```

## Updating Content

Just edit your blog posts or projects and push to main!

```bash
# Edit a blog post
vim apps/web/src/content/blog/my-post.mdx

# Commit and push
git add .
git commit -m "Update blog post"
git push

# GitHub Action will automatically re-ingest! ✨
```

## Troubleshooting

### "DATABASE_URL not found"
- Make sure you added it to GitHub Secrets
- For local testing, export it in your terminal

### "OPENROUTER_API_KEY not found"
- Add to GitHub Secrets
- Get one from https://openrouter.ai/

### "No chunks ingested"
- Check that blog posts have `publish: true` (or remove the field)
- Verify files are in correct location
- Check GitHub Actions logs for errors

### "Vector dimension mismatch"
- Drop and recreate the vector index
- Ensure using `text-embedding-3-small` (1536 dimensions)

## Costs

**Free tier is enough to get started:**

- **Database:** Neon free tier (3GB, 0.5GB pgvector)
- **Embeddings:** ~$0.02 per run (assuming 50 blog posts)
- **GitHub Actions:** 2,000 minutes/month free

**Estimated monthly cost:** $0 (stays in free tiers!)

## Next Steps

After ingestion is set up:

1. **Test the chat agent** - Ask questions about your content
2. **Add more content** - Travel logs, about page
3. **Optimize chunks** - Adjust size/overlap if needed
4. **Add metadata** - Enrich with more context

---

**Questions?** Check the logs in GitHub Actions or run locally with `pnpm ingest` to debug!
