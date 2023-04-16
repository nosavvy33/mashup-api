const axios = require("axios");
const express = require("express");
const cookieParser = require("cookie-parser");
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

app.get("/login", (req, res) => {
    const state = generateRandomString(16);
    res.cookie("spotify_auth_state", state);

    const scope = "user-top-read user-library-read";

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

            res.redirect(
                "/#/success/" +
                encodeURIComponent(accessToken) +
                "/" +
                encodeURIComponent(refreshToken)
            );
        } catch (error) {
            console.error("Error fetching access token:", error.message);
            res.redirect("/#/error/invalid_token");
        }
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

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
        console.error("Error fetching access token:", error.message);
        throw error;
    }
};

module.exports = {
    getAccessToken,
};
