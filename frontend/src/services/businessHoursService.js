import api from "./api";

export async function getBusinessHours() {
  const response = await api.get("/business-hours");
  return response.data;
}

export async function getPickupAvailability(date) {
  const response = await api.get("/business-hours/availability", {
    params: {
      date,
    },
  });

  return response.data;
}
