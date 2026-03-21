import apiClient from "../lib/apiClient";

export async function getHotels() {
  const response = await apiClient.get("/hotels");
  return response.data?.data ?? [];
}

export async function getHotelById(id) {
  const response = await apiClient.get(`/hotels/${id}`);
  return response.data?.data ?? null;
}
