// Public response contracts derived from the supplied FastAPI OpenAPI schema.
import { z } from "zod";

export const AuthorResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ClassificationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.union([z.string(), z.null()]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.union([z.string(), z.null()]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  parent_id: z.union([z.string(), z.null()]),
});

export const ArticleSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.union([z.string(), z.null()]),
  featured_image: z.union([z.string(), z.null()]),
  featured_image_alt: z.union([z.string(), z.null()]),
  author: z.union([AuthorResponseSchema, z.null()]),
  article_type: z.union([ClassificationResponseSchema, z.null()]),
  categories: z.array(CategoryResponseSchema),
  tags: z.array(ClassificationResponseSchema),
  is_featured: z.boolean(),
  view_count: z.number().int(),
  published_at: z.union([z.string(), z.null()]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ArticleResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.union([z.string(), z.null()]),
  featured_image: z.union([z.string(), z.null()]),
  featured_image_alt: z.union([z.string(), z.null()]),
  author: z.union([AuthorResponseSchema, z.null()]),
  article_type: z.union([ClassificationResponseSchema, z.null()]),
  categories: z.array(CategoryResponseSchema),
  tags: z.array(ClassificationResponseSchema),
  is_featured: z.boolean(),
  view_count: z.number().int(),
  published_at: z.union([z.string(), z.null()]),
  created_at: z.string(),
  updated_at: z.string(),
  content_html: z.string(),
  meta_title: z.union([z.string(), z.null()]),
  meta_description: z.union([z.string(), z.null()]),
  schema: z.union([z.record(z.string(), z.unknown()), z.null()]),
});

export const MetaSchema = z.object({
  page: z.number().int(),
  page_size: z.number().int(),
  total: z.number().int(),
  pages: z.number().int(),
});

export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  request_id: z.string(),
});

export const ErrorResponseSchema = z.object({ error: ErrorDetailSchema });

export const RequestCreateSchema = z.object({
  topic: z.string().min(1).max(300),
  description: z.union([z.string().max(10000), z.null()]).optional(),
  name: z.union([z.string().max(150), z.null()]).optional(),
  email: z.union([z.string().max(255).email(), z.null()]).optional(),
  website: z.string().max(2048).optional(),
});

export const SubmissionResponseSchema = z.object({
  message: z.string().optional(),
});
