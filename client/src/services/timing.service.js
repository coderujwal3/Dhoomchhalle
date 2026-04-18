import { timingAPI } from "./api";

export const getTimings = async (params = {}) => {
  try {
    const response = await timingAPI.getTimings(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
