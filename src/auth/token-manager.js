const fs = require('fs');
const path = require('path');
const axios = require('axios');
const logger = require('./logger');

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
        return false;
    }
}

module.exports = { readTokenFile, writeTokenFile, isTokenValid };
