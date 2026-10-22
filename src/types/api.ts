import type { z } from "zod";
import type * as schemas from "@/lib/api/schemas";

export type AuthorResponse = z.infer<typeof schemas.AuthorResponseSchema>;
export type ClassificationResponse = z.infer<
  typeof schemas.ClassificationResponseSchema
>;
export type CategoryResponse = z.infer<typeof schemas.CategoryResponseSchema>;
export type ArticleSummary = z.infer<typeof schemas.ArticleSummarySchema>;
export type ArticleResponse = z.infer<typeof schemas.ArticleResponseSchema>;
export type Meta = z.infer<typeof schemas.MetaSchema>;
export type ErrorDetail = z.infer<typeof schemas.ErrorDetailSchema>;
export type ErrorResponse = z.infer<typeof schemas.ErrorResponseSchema>;
export type RequestCreate = z.infer<typeof schemas.RequestCreateSchema>;
export type SubmissionResponse = z.infer<
  typeof schemas.SubmissionResponseSchema
>;

export type Page<T> = { data: T[]; meta: Meta };
export type Collection = "categories" | "tags" | "article-types";
export type ArticleFilters = {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  tag?: string;
  article_type?: string;
  sort?: string;
  is_featured?: boolean;
};
