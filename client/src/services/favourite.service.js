import { favouriteAPI } from "./api";

export const addFavourite = async (hotelId) => {
    try {
        const response = await favouriteAPI.addFavourite(hotelId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const removeFavourite = async (hotelId) => {
    try {
        const response = await favouriteAPI.removeFavourite(hotelId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getMyFavourites = async (page = 1, limit = 10) => {
    try {
        const response = await favouriteAPI.getMyFavourites(page, limit);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const checkIsFavourited = async (hotelId) => {
    try {
        const response = await favouriteAPI.checkIsFavourited(hotelId);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getFavouriteCount = async () => {
    try {
        const response = await favouriteAPI.getFavouriteCount();
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};
