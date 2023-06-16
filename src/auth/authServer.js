const axios = require("axios");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require('../logger/logger');
require("dotenv").config();

const { GetRefreshedTokenRequest, GetAuthTokenFromCallbackRequest, GetLoginUrl } = require("../spotify/spotify-api-templates");

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
// const redirectUri = "http://localhost:3000/callback";
const redirectUri = `${process.env.CALLBACK_URL}/callback`;

const app = express();
app.use(cookieParser());


const { manageCreatePlaylist } = require("../playlist/playlistManager");
const path = require('path');
const { body, validationResult } = require('express-validator');
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

app.get('/test', function (req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

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

        // If validation passed, retrieve values and save in variables
        const playlistName = req.body.playlistName;
        const artist1 = req.body.artist1;
        const artist2 = req.body.artist2 || null;
        const artist3 = req.body.artist3 || null;
        const artist4 = req.body.artist4 || null;
        const artist5 = req.body.artist5 || null;

        // ... continue processing the data

        res.send(`Data received. ${playlistName} ${artist1} ${artist5}`);
    }
);




const generateRandomString = (length) => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

app.get("/", (req, res) => {
    res.send(`<h1>Hello </h1><a href="/login">Login</button>`);
});

app.get("/login", (req, res) => {
    const state = generateRandomString(16);
    res.cookie("spotify_auth_state", state);

    const scope = "user-top-read user-library-read playlist-modify-public playlist-modify-private";

    res.redirect(GetLoginUrl(scope, redirectUri, state, clientId));
});

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

app.listen(3000, () => {
    logger.debug("Server is running on port 3000");
});

module.exports = {
    getAccessToken,
    startAuthProcess
};
