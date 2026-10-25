// Public response contracts derived from the supplied FastAPI OpenAPI schema.
import { z } from "zod";
const identity = z.string().min(1).max(128);
const slug = (max: number) =>
  z
    .string()
    .min(1)
    .max(max)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const AuthorResponseSchema = z.object({
  id: identity,
  name: z.string().min(1).max(150),
});

export const ClassificationResponseSchema = z.object({
  id: identity,
  name: z.string().min(1).max(150),
  slug: slug(180),
  description: z.union([z.string().max(10000), z.null()]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CategoryResponseSchema = z.object({
  id: identity,
  name: z.string().min(1).max(150),
  slug: slug(180),
  description: z.union([z.string().max(10000), z.null()]),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
  parent_id: z.union([z.string(), z.null()]),
});

export const ArticleSummarySchema = z.object({
  id: identity,
  title: z.string().min(1).max(300),
  slug: slug(350),
  excerpt: z.union([z.string().max(10000), z.null()]),
  featured_image: z.union([z.string().max(2048), z.null()]),
  featured_image_alt: z.union([z.string().max(300), z.null()]),
  author: z.union([AuthorResponseSchema, z.null()]),
  article_type: z.union([ClassificationResponseSchema, z.null()]),
  categories: z.array(CategoryResponseSchema).max(100),
  tags: z.array(ClassificationResponseSchema).max(100),
  is_featured: z.boolean(),
  view_count: z.number().int().nonnegative(),
  published_at: z.union([z.string(), z.null()]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const ArticleResponseSchema = z.object({
  id: identity,
  title: z.string().min(1).max(300),
  slug: slug(350),
  excerpt: z.union([z.string().max(10000), z.null()]),
  featured_image: z.union([z.string().max(2048), z.null()]),
  featured_image_alt: z.union([z.string().max(300), z.null()]),
  author: z.union([AuthorResponseSchema, z.null()]),
  article_type: z.union([ClassificationResponseSchema, z.null()]),
  categories: z.array(CategoryResponseSchema).max(100),
  tags: z.array(ClassificationResponseSchema).max(100),
  is_featured: z.boolean(),
  view_count: z.number().int().nonnegative(),
  published_at: z.union([z.string(), z.null()]),
  created_at: z.string(),
  updated_at: z.string(),
  content_html: z.string().max(1000000),
  meta_title: z.union([z.string().max(300), z.null()]),
  meta_description: z.union([z.string().max(10000), z.null()]),
  schema: z.union([z.record(z.string(), z.unknown()), z.null()]),
});

export const MetaSchema = z.object({
  page: z.number().int().min(1).max(100000),
  page_size: z.number().int().min(1).max(100),
  total: z.number().int().nonnegative(),
  pages: z.number().int().nonnegative(),
});

export const ErrorDetailSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
  request_id: identity,
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
