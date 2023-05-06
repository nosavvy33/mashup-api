const BASE_URL = "https://api.spotify.com/v1"

const GetUserRequest = {
    method: "get",
    url: `${BASE_URL}/me`
};

const GetRefreshedTokenRequest = (refreshToken, clientId, clientSecret) => ({
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
})

const GetAuthTokenFromCallbackRequest = (code, redirectUri, clientId, clientSecret) => ({
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

const GetLoginUrl = (scope, redirectUri, state, clientId) => "https://accounts.spotify.com/authorize?" +
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
    state;

const GetArtistRequest = (artistName) => ({
    method: "get",
    url: `${BASE_URL}/search`,
    params: {
        q: artistName,
        type: "artist",
        limit: 1,
    }
})

const GetLikedTracksRequest = (limit, offset) => ({
    method: "get",
    url: `${BASE_URL}/me/tracks`,
    params: {
        limit,
        offset,
    }
})

const CreatePlaylistRequest = (userId, playlistName) => ({
    method: "post",
    url: `${BASE_URL}/users/${userId}/playlists`,
    data: { name: playlistName }
})

const AddTracksToPlaylistRequest = (playlistId, trackUris) => ({
    method: "post",
    url: `${BASE_URL}/playlists/${playlistId}/tracks`,
    data: { uris: trackUris }
})

module.exports = { GetUserRequest, GetArtistRequest, GetLikedTracksRequest, CreatePlaylistRequest, AddTracksToPlaylistRequest, GetRefreshedTokenRequest, GetAuthTokenFromCallbackRequest, GetLoginUrl } 
