const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('../logger/logger');
const { startAuthProcess } = require('./authServer');

const TOKEN_FILE_PATH = path.join(__dirname, 'token.json');

function readTokenFile() {
    try {
        const data = fs.readFileSync(TOKEN_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return null;
    }
}

function writeTokenFile(tokenData) {
    fs.writeFileSync(TOKEN_FILE_PATH, JSON.stringify(tokenData));
}

// can be replaced with spotify-api.getUserId
async function isTokenValid(accessToken) {
    try {
        const response = await axios.get('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        logger.info(`Stored token validation resulted in ${response.status}`)
        return response.status === 200;
    } catch (error) {
        logger.info("Current token is invalid, need to re-login")
        return false;
    }
}

async function getTokens() {
    let tokenData = readTokenFile();
    logger.info(`Token data ${tokenData.refreshToken}`)
    logger.info(`Token validation ${await isTokenValid(tokenData.accessToken)}`)

    if (!(await isTokenValid(tokenData.accessToken))) {
        logger.info('Please open http://localhost:3000/login in your browser to start the authorization process.');
        tokenData = await startAuthProcess();
        writeTokenFile(tokenData);
    }

    return { accessToken: tokenData.accessToken, refreshToken: tokenData.refreshToken };
}

module.exports = { getTokens };
