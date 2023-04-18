const axios = require("axios");
require("dotenv").config();

const { getAccessToken } = require("./auth");

const getAccessTokenFromRefreshToken = async (refreshToken) => {
    try {
        const accessToken = await getAccessToken(refreshToken);
        return accessToken;
    } catch (error) {
        console.error("Error fetching access token:", error.message);
    }
};

const getUserId = async (accessToken) => {
    const userResponse = await axios({
        method: "get",
        url: "https://api.spotify.com/v1/me",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    return userResponse.data.id;
};

const getArtistId = async (accessToken, artistName) => {
    try {
        const response = await axios({
            method: "get",
            url: "https://api.spotify.com/v1/search",
            params: {
                q: artistName,
                type: "artist",
                limit: 1,
            },
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        if (response.data.artists.items.length > 0) {
            const artistId = response.data.artists.items[0].id;
            console.log(`Artist ID for ${artistName}: ${artistId}`);
            return artistId;
        } else {
            console.error(`Could not find artist with name "${artistName}"`);
            process.exit(1);
        }
    } catch (error) {
        console.error("Error fetching artist ID:", error.message);
    }
};

const getAllLikedTracks = async (accessToken, offset = 0, limit = 50, allTracks = []) => {
    try {
        const response = await axios({
            method: "get",
            url: "https://api.spotify.com/v1/me/tracks",
            params: {
                limit,
                offset,
            },
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        const likedTracks = response.data.items;
        allTracks.push(...likedTracks);

        if (response.data.next) {
            return getAllLikedTracks(accessToken, offset + limit, limit, allTracks);
        } else {
            return allTracks;
        }
    } catch (error) {
        console.error("Error fetching liked tracks:", error.message);
        return [];
    }
};

const getTopTracks = async (accessToken, artistId) => {
    try {
        const likedTracks = await getAllLikedTracks(accessToken);
        console.log(`Total liked tracks: ${likedTracks.length}`);

        const artistTopTracks = likedTracks
            .filter((item) => item.track.artists.some((artist) => artist.id === artistId))
            .map((item) => item.track);

        console.log(`Filtered tracks for artist ID ${artistId}: ${artistTopTracks.length}`);
        return artistTopTracks;
    } catch (error) {
        console.error("Error fetching top tracks:", error.message);
    }
};

const getArtistTopTracks = async (artistName, accessToken) => {
    try {
        const artistId = await getArtistId(accessToken, artistName);

        if (!artistId) {
            console.log(`Artist "${artistName}" not found.`);
            return [];
        }

        const topTracks = await getTopTracks(accessToken, artistId);

        console.log(`Top tracks by ${artistName}:`);
        topTracks.forEach((track, index) => {
            console.log(`${index + 1}. ${track.name}`);
        });

        return topTracks;
    } catch (error) {
        console.error("Error fetching top tracks:", error.message);
    }
};

async function createPlaylist(userId, accessToken, playlistName, trackUris) {
    console.log(`About to create playtlist with ${userId}, token ${accessToken}, name ${playlistName} and trackUris ${trackUris}`);

    // Create a new playlist
    const createPlaylistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        { name: playlistName },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const playlistId = createPlaylistResponse.data.id;

    console.log(`playListCreated ${playlistId}`);

    // Add tracks to the new playlist
    await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: trackUris },
        { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    console.log(`Playlist "${playlistName}" created with ${trackUris.length} tracks.`);
}



module.exports = {
    getArtistTopTracks,
    getAccessTokenFromRefreshToken,
    createPlaylist,
    getUserId
};