import { apiClient } from "./client";
import { Category, CategoryType } from "../types/models";

export function listCategories(type?: CategoryType) {
  return apiClient.get<Category[]>("/categories", { params: type ? { type } : undefined }).then((r) => r.data);
}

export function createCategory(input: { name: string; type: CategoryType; color?: string; icon?: string }) {
  return apiClient.post<Category>("/categories", input).then((r) => r.data);
}

export function deleteCategory(id: string) {
  return apiClient.delete(`/categories/${id}`);
}
