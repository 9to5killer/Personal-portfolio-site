import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title:    z.string(),
    num:      z.string(),
    tags:     z.array(z.string()),
    status:   z.enum(['Live', 'In development', 'Planned']),
    featured: z.boolean().default(false),
    summary:  z.string(),
  }),
});

const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title:   z.string(),
    num:     z.string(),
    status:  z.enum(['Published', 'First draft', 'Outlined', 'Researching']),
    tags:    z.array(z.string()),
    summary: z.string(),
    publishedDate: z.date().optional(),
  }),
});

export const collections = { projects, writing };
