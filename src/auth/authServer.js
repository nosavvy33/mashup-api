const axios = require("axios");
const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require('../logger/logger');
require("dotenv").config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = "http://localhost:3000/callback";

const app = express();
app.use(cookieParser());

const generateRandomString = (length) => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
};

function generateAuthUrl(res) {
    const state = generateRandomString(16);
    res.cookie("spotify_auth_state", state);

    const scope = "user-top-read user-library-read playlist-modify-public playlist-modify-private";

    return "https://accounts.spotify.com/authorize?" +
        "response_type=code&" +
        "client_id=" +
        clientId +
        "&" +
        "scope=" +
        encodeURIComponent(scope) +
        "&" +
        "redirect_uri=" +
        encodeURIComponent(redirectUri) +
        "&" +
        "state=" +
        state
}

app.get("/login", (req, res) => {
    const state = generateRandomString(16);
    res.cookie("spotify_auth_state", state);

    const scope = "user-top-read user-library-read playlist-modify-public playlist-modify-private";

    res.redirect(
        "https://accounts.spotify.com/authorize?" +
        "response_type=code&" +
        "client_id=" +
        clientId +
        "&" +
        "scope=" +
        encodeURIComponent(scope) +
        "&" +
        "redirect_uri=" +
        encodeURIComponent(redirectUri) +
        "&" +
        "state=" +
        state
    );
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
                    const authResponse = await axios({
                        method: "post",
                        url: "https://accounts.spotify.com/api/token",
                        params: {
                            code: code,
                            redirect_uri: redirectUri,
                            grant_type: "authorization_code",
                        },
                        headers: {
                            Authorization:
                                "Basic " +
                                Buffer.from(clientId + ":" + clientSecret).toString("base64"),
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    });

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
        const response = await axios({
            method: "post",
            url: "https://accounts.spotify.com/api/token",
            params: {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
            },
            headers: {
                Authorization:
                    "Basic " +
                    Buffer.from(clientId + ":" + clientSecret).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });

        if (response.status === 200 && response.data.access_token) {
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
    startAuthProcess,
    generateAuthUrl
};
