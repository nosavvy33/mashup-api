const { logger } = require("../logger/logger");
const axios = require('axios');

// The singleton axios instance
let apiClient;
const BASE_URL = "https://api.spotify.com/v1"

// Function to initialize the axios instance with the bearer token
function initApiClient(bearerToken) {
    if (!apiClient) {
        apiClient = axios.create({
            baseURL: BASE_URL,
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            },
        });

        apiClient.interceptors.request.use(request => {
            logger.debug('Starting Request:', request.method, request.url);
            logger.debug('Request Data:', request.data);
            return request;
        });

        apiClient.interceptors.response.use(response => {
            logger.debug('Response:', response.status, response.statusText);
            logger.debug('Response Data:', response.data);
            return response;
        }, error => {
            logger.error('Error:', error.response.status, error.response.statusText);
            logger.error('Error Data:', error.response.data);
            return Promise.reject(error);
        });
    }
}

// Function to get the singleton axios instance
function getApiClient() {
    if (!apiClient) {
        throw new Error('API client not initialized. Call initApiClient() first.');
    }

    return apiClient;
}

module.exports = { initApiClient, getApiClient };
