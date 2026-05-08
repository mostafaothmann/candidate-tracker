import axios from "axios";

/**
 * Axios instance configured for the backend API.
 *
 * Base URL points to the Fastify server.
 * Used as the shared HTTP client across the frontend.
 */
export const api = axios.create({
    baseURL: "http://192.168.1.102:3001",
});