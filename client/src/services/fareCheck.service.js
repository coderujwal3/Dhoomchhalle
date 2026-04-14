import { fareCheckAPI } from "./api";

export const evaluateFareCheck = async (data) => {
  try {
    const response = await fareCheckAPI.evaluateFare(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const reportFareCheck = async (data) => {
  try {
    const response = await fareCheckAPI.reportFareCheck(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getFareRiskHotspots = async (params = {}) => {
  try {
    const response = await fareCheckAPI.getFareHotspots(params);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
