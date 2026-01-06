# Database Setup Guide

## Quick Start with Docker (Recommended)

### 1. Start the database

```bash
cd packages/db
pnpm db:start
```

This starts PostgreSQL 16 with pgvector extension:
- Container: `prakhar-codes-chat-postgres`
- Database: `prakhar_chat`
- Port: `localhost:5434`
- User: `postgres`
- Password: `password`

### 2. Create environment file

Create `.env` in the **root** directory:

```bash
cp .env.example .env
```

Then edit `.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5434/prakhar_chat"

# Get your OpenRouter API key from https://openrouter.ai
OPENROUTER_API_KEY="sk-or-v1-..."
```

### 3. Run content ingestion

This will create the vector tables and ingest your blog posts/projects:

```bash
pnpm ingest
```

You should see:
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
```

### 4. Verify it worked

Connect to the database:

```bash
docker exec -it prakhar-codes-chat-postgres psql -U postgres -d prakhar_chat
```

Check the vector table:

```sql
-- List all tables
\dt

-- Should see: portfolio_knowledge (created by Mastra)

-- Check ingested content
SELECT COUNT(*) FROM portfolio_knowledge;

-- See a sample chunk
SELECT
  metadata->>'title' as title,
  metadata->>'type' as type,
  LEFT(text, 100) as preview
FROM portfolio_knowledge
LIMIT 5;

-- Exit
\q
```

---

## Database Management

All commands from root directory:

```bash
# Start database (background)
pnpm db:start

# Watch logs
pnpm db:watch

# Stop database (keeps data)
pnpm db:stop

# Stop and remove all data
pnpm db:down

# Push Drizzle schema changes (optional)
pnpm db:push

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

---

## What Gets Created

### Mastra Vector Table (auto-created by ingestion)

**portfolio_knowledge** - Your RAG vector store
- `id` - Unique chunk ID
- `vector` - 1536-dimension embedding (pgvector)
- `text` - The actual content chunk
- `metadata` - JSON with:
  ```json
  {
    "type": "blog" | "project",
    "title": "Post/project title",
    "category": "Tutorials",
    "tags": ["TypeScript", "Backend"],
    "url": "/blog/post-slug",
    "chunkIndex": 0,
    "totalChunks": 5
  }
  ```

### Optional Drizzle Tables (for document tracking)

**ingested_documents** - Tracks uploaded documents (not used for portfolio)
**sync_metadata** - Tracks sync runs

These are from the old R2-based system and can be ignored for your markdown-based portfolio.

---

## Alternative: Hosted Database

If you don't want to use Docker, use a hosted provider:

### Neon (Recommended - Free tier)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
   ```

### Supabase

1. Go to https://supabase.com
2. Create new project (pgvector already enabled)
3. Copy connection string from Settings → Database
4. Update `.env`

### Railway

1. Go to https://railway.app
2. Add PostgreSQL service
3. Add pgvector extension
4. Copy connection string

---

## Troubleshooting

### Port 5434 already in use

Change port in `packages/db/docker-compose.yml`:
```yaml
ports:
  - "5435:5432"  # Change 5434 to any free port
```

Then update `DATABASE_URL` in `.env` to match.

### Connection refused

Make sure Docker is running:
```bash
docker ps  # Should show prakhar-codes-chat-postgres
```

If not running:
```bash
cd packages/db
pnpm db:start
```

### No content ingested

Check:
1. ✅ Blog posts exist in `apps/web/src/content/blog/`
2. ✅ Posts don't have `publish: false` in frontmatter
3. ✅ `DATABASE_URL` is correct in `.env`
4. ✅ `OPENROUTER_API_KEY` is valid
5. ✅ Running from root: `pnpm ingest`

### pgvector extension not found

The `pgvector/pgvector:pg16` Docker image already has the extension.

If using hosted database, enable it:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Next Steps

✅ **Database running** (you just did this!)
⏭️ **Run ingestion** - `pnpm ingest`
⏭️ **Set up Mastra agent** in `packages/api`
⏭️ **Connect chat UI** to agent
⏭️ **Test and deploy!**
