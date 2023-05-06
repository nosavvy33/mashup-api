const logger = require("../logger/logger");
const axios = require('axios');

let apiClient;

function initApiClient(bearerToken) {
    if (!apiClient) {
        apiClient = axios.create({
            baseUrl: "https://api.spotify.com/v1",
            headers: {
                Authorization: `Bearer ${bearerToken}`,
            },
        });

        apiClient.interceptors.request.use(request => {
            logger.debug(`Starting Request: ${request.method} ${request.url}`);
            logger.debug(`Request Data: ${request.data}`);
            return request;
        });

        apiClient.interceptors.response.use(response => {
            logger.debug(`Response: ${response.status} ${response.statusText}`);
            logger.debug(`Response Data: ${response.data}`);
            return response;
        }, error => {
            logger.error(`Error: ${error.response.status} ${error.response.statusText}`);
            logger.error(`Error Data: ${error.response.data}`);
            return Promise.reject(error);
        });

        logger.info("Initialized api client successfully");
    }
}

function getApiClient() {
    if (!apiClient) {
        throw new Error('API client not initialized. Call initApiClient() first.');
    }

    return apiClient;
}

module.exports = { initApiClient, getApiClient };
