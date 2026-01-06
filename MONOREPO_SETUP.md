# Monorepo Setup Complete! 🎉

## Structure

```
prakhar.codes/
├── apps/
│   ├── web/              # Astro portfolio site (@prakhar/web)
│   └── chat/             # Next.js RAG chat app (@prakhar/chat)
├── packages/
│   ├── ui/               # Shared UI components (@prakhar/ui)
│   ├── api/              # Mastra agents & tools (@prakhar/api)
│   └── db/               # Drizzle DB schemas (@prakhar/db)
├── package.json          # Root workspace config
├── pnpm-workspace.yaml   # pnpm workspaces
└── turbo.json            # Turborepo config
```

## Available Scripts

### Development
```bash
# Run all apps
pnpm dev

# Run portfolio only
pnpm dev:web

# Run chat app only
pnpm dev:chat
```

### Build
```bash
# Build all apps
pnpm build

# Type check
pnpm check-types
```

### Database
```bash
# Generate migrations
pnpm db:generate

# Push to database
pnpm db:push

# Open Drizzle Studio
pnpm db:studio
```

## Next Steps

### 1. Set up Environment Variables

Create `.env` file in root:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# OpenRouter (for LLMs)
OPENROUTER_API_KEY=your_key_here

# Cloudflare R2 (for document storage)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=your_bucket
R2_ENDPOINT=your_endpoint

# Unstructured API (for PDF/DOCX processing)
UNSTRUCTURED_API_KEY=your_key
UNSTRUCTURED_API_URL=https://api.unstructured.io

# Optional: Rate limiting
UPSTASH_REDIS_REST_URL=your_url
UPSTASH_REDIS_REST_TOKEN=your_token
```

### 2. Initialize Database

```bash
# Set up PostgreSQL with pgvector
pnpm --filter @prakhar/db db:push
```

### 3. Add AI Elements to Chat App

```bash
cd apps/chat

# Install AI-specific components
npx ai-elements@latest add chat-messages
npx ai-elements@latest add chat-input
npx ai-elements@latest add streaming-text
```

### 4. Ingest Your Blog Posts

Upload your blog markdown files to R2, then:

```bash
# Trigger ingestion (once you set up the cron route)
curl -X POST http://localhost:3001/api/cron/sync-r2
```

### 5. Update Import Paths in Chat App

Replace UI component imports in `apps/chat/src/`:

```tsx
// OLD (from reference repo)
import { Button } from "@/components/ui/button"

// NEW (using shared package)
import { Button } from "@prakhar/ui"
```

## Package Dependencies

- **@prakhar/web** → uses @prakhar/ui
- **@prakhar/chat** → uses @prakhar/ui, @prakhar/api, @prakhar/db
- **@prakhar/api** → uses @prakhar/db
- **@prakhar/ui** → standalone (shared across all apps)
- **@prakhar/db** → standalone

## Notes

- Portfolio site (Astro) uses React 18
- Chat app (Next.js) uses React 19
- UI package supports both React 18 & 19
- All peer dependency warnings are safe to ignore

## Deployment

### Vercel

```bash
# Deploy portfolio
vercel --cwd apps/web

# Deploy chat
vercel --cwd apps/chat
```

Both will use Turborepo caching automatically!

---

**Built with:** Turborepo · pnpm workspaces · Mastra · Next.js · Astro · Drizzle
