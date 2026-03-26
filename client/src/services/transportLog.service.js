import { transportLogAPI } from "./api";

export const createTransportLog = async (data) => {
  try {
    const response = await transportLogAPI.createLog(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyTransportLogs = async (page = 1, limit = 10) => {
  try {
    const response = await transportLogAPI.getMyLogs(page, limit);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateTransportLog = async (logId, data) => {
  try {
    const response = await transportLogAPI.updateLog(logId, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTransportLog = async (logId) => {
  try {
    const response = await transportLogAPI.deleteLog(logId);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
