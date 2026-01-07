#!/usr/bin/env tsx
/**
 * Ingests portfolio content (blog posts, projects, travel, experience) into the RAG system
 *
 * Usage:
 *   pnpm tsx scripts/ingest-portfolio-content.ts
 *
 * Environment variables required:
 *   - DATABASE_URL: PostgreSQL connection string
 *   - OPENROUTER_API_KEY: OpenRouter API key for embeddings
 */

import 'dotenv/config'; // Load .env file
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import { MDocument } from '@mastra/rag';
import { PgVector } from '@mastra/pg';
import { createOpenAI } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { experience } from '../apps/web/src/data/experience';

// Testimonials data
const testimonials = [
  {
    name: "Jakob Erikstad",
    role: "CEO @ Yobr",
    company: "Yobr",
    relationship: "Jakob managed Prakhar directly",
    date: "January 4, 2026",
    linkedinUrl: "https://www.linkedin.com/in/jakob-erikstad",
    content: "I have worked with Prakhar for about a year, and he is one of the best developers I know. Despite his young age, he consistently performs at a level well above many more senior developers, combining strong technical understanding, rapid execution, and clear initiative. It has been a pleasure working with him, and I hope to do so again in the future."
  },
  {
    name: "Raman Gupta",
    role: "Training better and more doctors with CaseCraft, the AI Training Simulator for Medicine | CS + Bioinformatics @ NUS",
    company: "CaseCraft",
    relationship: "Raman managed Prakhar directly",
    date: "January 5, 2026",
    linkedinUrl: "https://www.linkedin.com/in/raman-gupta-9a40441aa",
    content: "I had the pleasure of working with Prakhar at CaseCraft, where he was a key contributor to our medical AI platform as a full-stack engineer.\n\nPrakhar built our entire frontend using React and TanStack Router and designed a robust TypeScript backend with true end-to-end type safety, which became the foundation of the product. He also led our migration from JavaScript to TypeScript across the codebase, significantly improving reliability and reducing application errors.\n\nWhat really sets Prakhar apart is his speed of development and ownership mindset. His ability to move fast without sacrificing quality is exceptional. Beyond execution, he consistently suggested and led important architectural and infrastructure improvements, making thoughtful decisions that scaled well with the product's growth. He also led our entire deployment and setup process, taking full responsibility for shipping and maintaining a production-ready system.\n\nPrakhar implemented our AI pipelines using OpenAI and demonstrated strong technical judgment paired with solid product intuition. He deeply understands the problem, aligns with expectations quickly, and delivers solutions that are often better than initially envisioned.\n\nHe works extremely independently, has a clear can-do attitude, communicates exceptionally well, and is someone you can trust to take ambiguous problems and turn them into high-quality outcomes. Every time he took on a task, he delivered a phenomenal job.\n\nPrakhar is a real asset to any team, and I would happily work with him again. I strongly recommend him to any team looking for a fast, reliable, and thoughtful engineer."
  },
  {
    name: "Harsh Agrawal",
    role: "Founder techkareer.com | ZFellow | Ex Avalara",
    company: "TechKareer",
    relationship: "Prakhar was Harsh's client",
    date: "January 5, 2026",
    linkedinUrl: "https://www.linkedin.com/in/itsharshag",
    content: "Prakhar is one of the most exceptional engineers I have come across. Great technical skills, communication skills, and initiative. Has a portfolio of stunning projects especially an Android app with millions of installs that he built almost single-handedly.\n\nWe got connected when he sent one of the most impressive cold DMs to explore a role at TechKareer. We were not hiring for ourselves at that time but luckily one of our hiring partners were. It was a pleasure him to refer him to them. They were also impressed by his experience and performance on the deliverables.\n\nPost that he has gone on many more amazing stints. He will be an invaluable asset to whichever org he decides to join. Godspeed!"
  }
];

// Initialize OpenAI SDK with OpenRouter endpoint
const openrouter = createOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
});

// Configuration
const CONTENT_DIRS = {
  blog: join(process.cwd(), 'apps/web/src/content/blog'),
  project: join(process.cwd(), 'apps/web/src/content/project'),
  travel: join(process.cwd(), 'apps/web/src/content/travel'),
};

const CHUNK_CONFIG = {
  chunkSize: 512,
  chunkOverlap: 50,
  separators: ['\n\n', '\n', ' '],
};

const VECTOR_TABLE = 'portfolio_knowledge';

interface FrontMatter {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  pubDate?: string;
  publish?: boolean;
  heroImage?: string;
}

interface ContentFile {
  path: string;
  type: 'blog' | 'project' | 'travel' | 'experience' | 'page' | 'testimonial';
  frontmatter: FrontMatter;
  content: string;
}

// Initialize vector store
const vectorStore = new PgVector({
  connectionString: process.env.DATABASE_URL!,
});

async function initializeVectorTable() {
  console.log(`📋 Initializing vector table: ${VECTOR_TABLE}`);

  try {
    // Create index (table) - this will create it if it doesn't exist
    await vectorStore.createIndex({
      indexName: VECTOR_TABLE,
      dimension: 1536, // text-embedding-3-small dimension
    });
    console.log(`✅ Vector table initialized\n`);
  } catch (error) {
    // Ignore error if table already exists
    if (error instanceof Error && error.message?.includes('already exists')) {
      console.log(`✅ Vector table already exists\n`);
    } else {
      throw error;
    }
  }
}

async function readMarkdownFiles(dir: string, type: 'blog' | 'project' | 'travel'): Promise<ContentFile[]> {
  try {
    const files = await readdir(dir);
    const markdownFiles = files.filter(f => f.endsWith('.md') || f.endsWith('.mdx'));

    const contentFiles: ContentFile[] = [];

    for (const file of markdownFiles) {
      const filePath = join(dir, file);
      const fileContent = await readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      // Skip unpublished content
      if (data.publish === false) {
        console.log(`⏭️  Skipping unpublished: ${file}`);
        continue;
      }

      contentFiles.push({
        path: file,
        type,
        frontmatter: data as FrontMatter,
        content,
      });
    }

    return contentFiles;
  } catch (error) {
    console.error(`Error reading ${type} files:`, error);
    return [];
  }
}

function createExperienceContent(): ContentFile[] {
  return experience.map((exp, idx) => ({
    path: `experience-${idx}.json`,
    type: 'experience' as const,
    frontmatter: {
      title: `${exp.designation} at ${exp.company}`,
      description: `${exp.type} position - ${exp.date}`,
      category: 'work-experience',
      tags: ['experience', 'work', exp.type.toLowerCase()],
      pubDate: exp.date,
    },
    content: `
# ${exp.designation} at ${exp.company}

**Type**: ${exp.type}
**Duration**: ${exp.date}

## Key Contributions and Achievements:

${exp.details.map(detail => `- ${detail}`).join('\n')}
    `.trim(),
  }));
}

interface ChunkWithMetadata {
  text: string;
  metadata: {
    type: 'blog' | 'project' | 'travel' | 'experience' | 'page' | 'testimonial';
    title: string;
    description?: string;
    category?: string;
    tags: string[];
    pubDate?: string;
    source: string;
    url: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

async function chunkDocument(file: ContentFile): Promise<ChunkWithMetadata[]> {
  // Combine frontmatter and content for better context
  const fullContent = `# ${file.frontmatter.title}\n\n${file.frontmatter.description || ''}\n\n${file.content}`;

  // Use Mastra's document chunking
  const doc = MDocument.fromText(fullContent, {
    strategy: 'recursive',
    size: CHUNK_CONFIG.chunkSize,
    overlap: CHUNK_CONFIG.chunkOverlap,
    separators: CHUNK_CONFIG.separators,
  });

  // Get chunks using the public method
  const docChunks = await doc.chunk();

  const chunks: ChunkWithMetadata[] = docChunks.map((chunk, idx) => ({
    text: chunk.text,
    metadata: {
      type: file.type,
      title: file.frontmatter.title,
      description: file.frontmatter.description,
      category: file.frontmatter.category,
      tags: file.frontmatter.tags || [],
      pubDate: file.frontmatter.pubDate,
      source: file.path,
      url: `/${file.type}/${file.path.replace(/\.(md|mdx)$/, '')}`,
      chunkIndex: idx,
      totalChunks: docChunks.length,
    },
  }));

  return chunks;
}

async function embedChunks(chunks: ChunkWithMetadata[]): Promise<void> {
  console.log(`  📊 Embedding ${chunks.length} chunks...`);

  // Generate embeddings for all chunks at once using AI SDK's embedMany
  const { embeddings } = await embedMany({
    model: openrouter.embedding('text-embedding-3-small'),
    values: chunks.map(chunk => chunk.text),
  });

  // Upsert all chunks to vector store
  await vectorStore.upsert({
    indexName: VECTOR_TABLE,
    vectors: embeddings,
    metadata: chunks.map(chunk => ({
      ...chunk.metadata,
      text: chunk.text,
    })),
    ids: chunks.map(chunk => `${chunk.metadata.source}-${chunk.metadata.chunkIndex}`),
  });
}

function createHomepageContent(): ContentFile {
  return {
    path: 'index.astro',
    type: 'page',
    frontmatter: {
      title: 'Prakhar Shukla - Portfolio Homepage',
      description: 'Serial founder and software engineer exploring new opportunities',
      category: 'about',
      tags: ['about', 'hiring', 'profile', 'career'],
    },
    content: `
# About Prakhar Shukla

Prakhar Shukla is a serial founder and software engineer who just wrapped up as a Founding Engineer at Yobr in Norway.

## Professional Background

- **Current Status**: Exploring new opportunities and available for hire
- **Previous Role**: Founding Engineer at Yobr (Norway)
- **Products**: Built Andronix and Lumoflo
- **Achievements**:
  - 2.5M+ downloads across products
  - $140K+ in revenue generated
- **Active Projects**: Currently building Lumoflo and Andronix

## Job Availability

**Prakhar is actively exploring new opportunities and available for hire.**

### What He's Looking For:
- **Role**: Full-stack Engineer or Founding Engineer positions
- **Tech Stack**: TypeScript, React, Node.js, AI/ML
- **Location**: Remote (based in India) or willing to relocate
- **Availability**: Immediate - can start right away

## Technical Skills

### Core Technologies:
- **Languages**: TypeScript, Python, Kotlin, JavaScript
- **Frontend**: React, Next.js, Astro
- **Backend**: Node.js, PostgreSQL, Docker
- **AI/ML**: Vercel AI SDK, Mastra, LangGraph
- **DevOps**: Trigger.dev, Docker, PostgreSQL

### Expertise Areas:
- Web development (full-stack)
- Server-side development
- Mobile development
- AI agents and automation

## Products and Projects

### Andronix
- Mobile application
- 2.5M+ downloads
- Significant revenue generation

### Lumoflo
- Currently in active development
- Modern web application

## Contact and Availability

Prakhar is **immediately available** for new opportunities. He is open to:
- Full-time positions
- Founding engineer roles
- Remote work
- Relocation opportunities

His preferred tech stack includes TypeScript, React, Node.js, and AI/ML technologies, but he is adaptable and quick to learn new technologies.
`,
  };
}

function createTestimonialsContent(): ContentFile[] {
  return testimonials.map((testimonial, idx) => ({
    path: `testimonial-${idx}.json`,
    type: 'testimonial' as const,
    frontmatter: {
      title: `Testimonial from ${testimonial.name}`,
      description: `${testimonial.role}`,
      category: 'testimonial',
      tags: ['testimonial', 'recommendation', testimonial.company.toLowerCase()],
      pubDate: testimonial.date,
    },
    content: `
# Testimonial from ${testimonial.name}

**Role**: ${testimonial.role}
**Company**: ${testimonial.company}
**Relationship**: ${testimonial.relationship}
**Date**: ${testimonial.date}
**LinkedIn**: ${testimonial.linkedinUrl}

## Recommendation:

${testimonial.content}
    `.trim(),
  }));
}

async function main() {
  console.log('🚀 Starting portfolio content ingestion...\n');

  // Check environment variables
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is required');
  }

  // Initialize vector table
  await initializeVectorTable();

  let totalChunks = 0;
  let counts = { blog: 0, project: 0, travel: 0, experience: 0, page: 0, testimonial: 0 };

  // Ingest blog posts
  console.log('📝 Processing blog posts...');
  const blogFiles = await readMarkdownFiles(CONTENT_DIRS.blog, 'blog');
  console.log(`  Found ${blogFiles.length} published blog posts`);

  for (const file of blogFiles) {
    console.log(`  ✍️  Processing: ${file.frontmatter.title}`);
    const chunks = await chunkDocument(file);
    await embedChunks(chunks);
    totalChunks += chunks.length;
    counts.blog++;
    console.log(`  ✅ Ingested ${chunks.length} chunks\n`);
  }

  // Ingest projects
  console.log('🚀 Processing projects...');
  const projectFiles = await readMarkdownFiles(CONTENT_DIRS.project, 'project');
  console.log(`  Found ${projectFiles.length} projects`);

  for (const file of projectFiles) {
    console.log(`  🛠️  Processing: ${file.frontmatter.title}`);
    const chunks = await chunkDocument(file);
    await embedChunks(chunks);
    totalChunks += chunks.length;
    counts.project++;
    console.log(`  ✅ Ingested ${chunks.length} chunks\n`);
  }

  // Ingest travel posts
  console.log('✈️  Processing travel posts...');
  const travelFiles = await readMarkdownFiles(CONTENT_DIRS.travel, 'travel');
  console.log(`  Found ${travelFiles.length} travel posts`);

  for (const file of travelFiles) {
    console.log(`  🗺️  Processing: ${file.frontmatter.title}`);
    const chunks = await chunkDocument(file);
    await embedChunks(chunks);
    totalChunks += chunks.length;
    counts.travel++;
    console.log(`  ✅ Ingested ${chunks.length} chunks\n`);
  }

  // Ingest work experience
  console.log('💼 Processing work experience...');
  const experienceFiles = createExperienceContent();
  console.log(`  Found ${experienceFiles.length} experience entries`);

  for (const file of experienceFiles) {
    console.log(`  📋 Processing: ${file.frontmatter.title}`);
    const chunks = await chunkDocument(file);
    await embedChunks(chunks);
    totalChunks += chunks.length;
    counts.experience++;
    console.log(`  ✅ Ingested ${chunks.length} chunks\n`);
  }

  // Ingest homepage content
  console.log('🏠 Processing homepage...');
  const homepage = createHomepageContent();
  console.log(`  📄 Processing: ${homepage.frontmatter.title}`);
  const homepageChunks = await chunkDocument(homepage);
  await embedChunks(homepageChunks);
  totalChunks += homepageChunks.length;
  counts.page++;
  console.log(`  ✅ Ingested ${homepageChunks.length} chunks\n`);

  // Ingest testimonials
  console.log('💬 Processing testimonials...');
  const testimonialFiles = createTestimonialsContent();
  console.log(`  Found ${testimonialFiles.length} testimonials`);

  for (const file of testimonialFiles) {
    console.log(`  ⭐ Processing: ${file.frontmatter.title}`);
    const chunks = await chunkDocument(file);
    await embedChunks(chunks);
    totalChunks += chunks.length;
    counts.testimonial++;
    console.log(`  ✅ Ingested ${chunks.length} chunks\n`);
  }

  console.log('\n🎉 Ingestion complete!');
  console.log(`📊 Summary:`);
  console.log(`   - Blog posts: ${counts.blog}`);
  console.log(`   - Projects: ${counts.project}`);
  console.log(`   - Travel posts: ${counts.travel}`);
  console.log(`   - Work experience: ${counts.experience}`);
  console.log(`   - Testimonials: ${counts.testimonial}`);
  console.log(`   - Pages: ${counts.page} (homepage)`);
  console.log(`   - Total chunks: ${totalChunks}`);
  console.log(`   - Vector table: ${VECTOR_TABLE}`);
}

main().catch(error => {
  console.error('❌ Ingestion failed:', error);
  process.exit(1);
});
