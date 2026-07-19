import api from "./api";

export async function getCategories() {
  const response = await api.get("/categories");
  return response.data;
}

export async function getCategoryItems(categoryId) {
  const response = await api.get(`/categories/${categoryId}/items`);
  return response.data;
}