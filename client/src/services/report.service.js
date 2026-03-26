import { reportAPI } from "./api";

export const createReport = async (data) => {
  try {
    const response = await reportAPI.createReport(data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyReports = async (page = 1, limit = 10) => {
  try {
    const response = await reportAPI.getMyReports(page, limit);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
