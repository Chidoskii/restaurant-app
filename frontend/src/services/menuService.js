import api from "./api";

export async function getMenu() {
  const response = await api.get("/menu");
  return response.data;
}

export async function getTodaysMenu() {
  const response = await api.get("/menu/today");
  return response.data;
}

export async function getFeaturedItems() {
  const response = await api.get("/menu/featured");
  return response.data;
}

export async function getMenuItemById(id) {
  const response = await api.get(`/menu/${id}`);
  return response.data;
}