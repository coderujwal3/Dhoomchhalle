import { transportAPI } from "./api";

export const getTransportTypes = async () => {
  try {
    const response = await transportAPI.getTransportTypes();
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTransportPrices = async (params = {}) => {
  try {
    const response = await transportAPI.getTransportPrices(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reportTransportIssue = async (data) => {
  try {
    const response = await transportAPI.reportTransportIssue(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
