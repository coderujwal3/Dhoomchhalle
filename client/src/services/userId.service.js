import apiClient from "../lib/apiClient";

export async function getUser() {
    const response = await apiClient.get("/auth/user");
    return response.data?.data ?? [];
}

export async function getUserById(id) {
    if (!id) {
        throw new Error("User ID is required");
    }
    const response = await apiClient.get(`/auth/user/${id}`);
    return response.data?.data ?? null;
}

// export async function getSession() {
//     const response = await apiClient.get("/auth/me");
//     return response.data;
// }