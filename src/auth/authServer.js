const axios = require("axios");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require('../logger/logger');
require("dotenv").config();

const { GetRefreshedTokenRequest, GetAuthTokenFromCallbackRequest, GetLoginUrl } = require("../spotify/spotify-api-templates");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = `${process.env.CALLBACK_URL}/callback`;

const app = express();
app.use(cookieParser());


const { manageCreatePlaylist } = require("../playlist/playlistManager");
const path = require('path');
const { body, validationResult } = require('express-validator');
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

const defaultPlaylistName = "MashUp Playlist: ";
var playlistName = "";
var artists = [];

app.post('/generatePlaylist',
    // Validation middleware
    [
        body('playlistName').isLength({ max: 50 }).withMessage('Playlist name must be at most 50 characters long.'),
        body('artist1').isLength({ max: 50 }).not().contains(',').withMessage('Artist names must be at most 50 characters long and cannot contain commas.'),
        body('artist2').optional().isLength({ max: 50 }).not().contains(',').withMessage('Artist names must be at most 50 characters long and cannot contain commas.'),
        body('artist3').optional().isLength({ max: 50 }).not().contains(',').withMessage('Artist names must be at most 50 characters long and cannot contain commas.'),
        body('artist4').optional().isLength({ max: 50 }).not().contains(',').withMessage('Artist names must be at most 50 characters long and cannot contain commas.'),
        body('artist5').optional().isLength({ max: 50 }).not().contains(',').withMessage('Artist names must be at most 50 characters long and cannot contain commas.'),
    ],
    (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        artists.push(req.body.artist1, req.body.artist2 || null, req.body.artist3 || null, req.body.artist4 || null, req.body.artist5 || null);
        artists = artists.filter(x => x != null);
        playlistName = req.body.playlistName.length > 0 ? req.body.playlistName : `${defaultPlaylistNameParser(artists)}`;

        // res.send(`Data received. ${artists}`);
        const state = generateRandomString(16);
        res.cookie("spotify_auth_state", state);

        const scope = "user-top-read user-library-read playlist-modify-public playlist-modify-private";

        res.redirect(GetLoginUrl(scope, redirectUri, state, clientId));
    }
);

app.get("/login", (req, res) => {
    const state = generateRandomString(16);
    res.cookie("spotify_auth_state", state);

    const scope = "user-top-read user-library-read playlist-modify-public playlist-modify-private";

    res.redirect(GetLoginUrl(scope, redirectUri, state, clientId));
});

app.get("/callback", async (req, res) => {
    let code = req.query.code || null;
    let state = req.query.state || null;
    let storedState = req.cookies ? req.cookies.spotify_auth_state : null;

    if (state === null || state !== storedState) {
        res.redirect("/#/error/state_mismatch");
    } else {
        res.clearCookie("spotify_auth_state");

        try {
            let authResponse = await axios(GetAuthTokenFromCallbackRequest(code, redirectUri, clientId, clientSecret));

            let accessToken = authResponse.data.access_token;
            let refreshToken = authResponse.data.refresh_token;

            // Resolve the promise with the access token and refresh token
            // resolve({ accessToken, refreshToken });

            // res.send(`Access and refresh tokens fetched successfully. You can close this window. ${accessToken}`);

            await manageCreatePlaylist(artists, playlistName, accessToken);

            res.sendFile(path.join(__dirname, '/success.html'));

        } catch (error) {
            logger.error(`Error fetching access token:, ${error.message}`);
            // res.redirect("/#/error/invalid_token");
            res.sendFile(path.join(__dirname, '/failure.html'));
        } finally {
            cleanUp();
        }
    }
});
const fs = require('fs/promises');
const logsFilePath = path.join(__dirname, '..', '..', 'logs.txt');

app.get('/logs', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(logsFilePath), 'utf-8');
        res.send(`<pre>${data}</pre>`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error reading logs.');
    }
});

app.get("/flushLogs", async (req, res) => {
    await flushLogs();
});

app.get("/callback-old", async (req, res) => {
    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies.spotify_auth_state : null;

    if (state === null || state !== storedState) {
        res.redirect("/#/error/state_mismatch");
    } else {
        res.clearCookie("spotify_auth_state");

        try {
            const authResponse = await axios(GetAuthTokenFromCallbackRequest(code, redirectUri, clientId, clientSecret));

            const accessToken = authResponse.data.access_token;
            const refreshToken = authResponse.data.refresh_token;

            // Resolve the promise with the access token and refresh token
            // resolve({ accessToken, refreshToken });

            // res.send(`Access and refresh tokens fetched successfully. You can close this window. ${accessToken}`);

            await manageCreatePlaylist(["kanye west", "kendrick lamar"], "test", accessToken);

            res.send(`Playlist created`);

        } catch (error) {
            logger.error(`Error fetching access token:, ${error.message}`);
            res.redirect("/#/error/invalid_token");
        }
    }
});

function cleanUp() {
    playlistName = "";
    artists = [];
}

async function flushLogs() {
    try {
        await fs.writeFile(logsFilePath, '');
        console.log('Logs flushed successfully');
    } catch (error) {
        console.error('Error occurred while flushing logs: ', error);
    }
}

function defaultPlaylistNameParser(artistNames) {
    const artists = artistNames.map(artist => artist.trim());
    const artistString = artists.join(', ');
    return `MashUp: ${artistString}`;
}

const generateRandomString = (length) => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

function startAuthProcess() {
    return new Promise((resolve) => {
        app.get("/callback", async (req, res) => {
            const code = req.query.code || null;
            const state = req.query.state || null;
            const storedState = req.cookies ? req.cookies.spotify_auth_state : null;

            if (state === null || state !== storedState) {
                res.redirect("/#/error/state_mismatch");
            } else {
                res.clearCookie("spotify_auth_state");

                try {
                    const authResponse = await axios(GetAuthTokenFromCallbackRequest(code, redirectUri, clientId, clientSecret));

                    const accessToken = authResponse.data.access_token;
                    const refreshToken = authResponse.data.refresh_token;

                    // Resolve the promise with the access token and refresh token
                    resolve({ accessToken, refreshToken });

                    res.send('Access and refresh tokens fetched successfully. You can close this window.');
                } catch (error) {
                    logger.error(`Error fetching access token:, ${error.message}`);
                    res.redirect("/#/error/invalid_token");
                }
            }
        });
    });
}

const getAccessToken = async (refreshToken) => {
    try {
        const response = await axios(GetRefreshedTokenRequest(refreshToken, clientId, clientSecret));

        if (response.status === 200 && response.data.access_token) {
            logger.info(`Retrieved accessToken with result ${response.status}`);
            return response.data.access_token;
        } else {
            throw new Error("Failed to get access token from refresh token.");
        }
    } catch (error) {
        logger.error(`Error fetching access token:, ${error.message}`);
        throw error;
    }
};

app.listen(3000, async () => {
    logger.debug("Server is running on port 3000");
});

module.exports = {
    getAccessToken,
    startAuthProcess
};
