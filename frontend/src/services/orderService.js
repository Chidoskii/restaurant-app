import api from "./api";

export async function createOrder(order) {
  const response = await api.post("/orders", order);

  return response.data;
}

export async function getOrderById(orderId) {
  const response = await api.get(`/orders/${orderId}`);

  return response.data;
}
