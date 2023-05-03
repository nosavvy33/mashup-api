require("dotenv").config();
const { getAccessToken } = require("../auth/authServer");
const logger = require('../logger/logger');
const { GetUserRequest, GetArtistRequest, GetLikedTracksRequest, CreatePlaylistRequest, AddTracksToPlaylistRequest } = require("./spotify-api-templates");
const { getApiClient } = require("./apiClient");

const getAccessTokenFromRefreshToken = async (refreshToken) => {
    try {
        const accessToken = await getAccessToken(refreshToken);
        return accessToken;
    } catch (error) {
        logger.error(`Error fetching access token:, ${error.message}`);
    }
};

const getUserId = async () => {
    const apiClient = getApiClient();
    const request = GetUserRequest;
    const userResponse = await apiClient(request);
    return userResponse.data.id;
};

const getArtistId = async (artistName) => {
    try {
        const apiClient = getApiClient();
        const response = await apiClient(GetArtistRequest(artistName));

        if (response.data.artists.items.length > 0) {
            const artistId = response.data.artists.items[0].id;
            const artistName = response.data.artists.items[0].name;

            logger.debug(`Artist ID for ${artistName}: ${artistId}`);

            return artistId;
        } else {
            logger.error(`Could not find artist with name "${artistName}"`);
            process.exit(1);
        }
    } catch (error) {
        logger.error(`Error fetching artist ID:, ${error.message}`);
    }
};

const getAllLikedTracks = async (offset = 0, limit = 50, allTracks = []) => {
    try {
        const apiClient = getApiClient();
        const response = await apiClient(GetLikedTracksRequest(limit, offset));

        const likedTracks = response.data.items;
        allTracks.push(...likedTracks);

        if (response.data.next) {
            return getAllLikedTracks(offset + limit, limit, allTracks);
        } else {
            return allTracks;
        }
    } catch (error) {
        logger.error(`Error fetching liked tracks:, ${error.message}`);
        return [];
    }
};

async function createPlaylist(userId, playlistName, trackUris) {
    logger.debug(`About to create playtlist with ${userId}, name ${playlistName} and trackUris ${trackUris}`);

    const apiClient = getApiClient();
    const createPlaylistResponse = await apiClient(CreatePlaylistRequest(userId, playlistName));

    const playlistId = createPlaylistResponse.data.id;

    logger.debug(`playListCreated ${playlistId}`);

    await apiClient(AddTracksToPlaylistRequest(playlistId, trackUris));

    logger.info(`Playlist "${playlistName}" created with ${trackUris.length} tracks.`);
}

const getTopTracks = async (artistId) => {
    try {
        const likedTracks = await getAllLikedTracks();
        logger.debug(`Total liked tracks: ${likedTracks.length}`);

        const artistTopTracks = likedTracks
            .filter((item) => item.track.artists.some((artist) => artist.id === artistId))
            .map((item) => item.track);

        logger.debug(`Filtered tracks for artist ID ${artistId}: ${artistTopTracks.length}`);
        return artistTopTracks;
    } catch (error) {
        logger.error(`Error fetching top tracks:, ${error.message}`);
    }
};

const getArtistTopTracks = async (artistName) => {
    try {
        const artistId = await getArtistId(artistName);

        if (!artistId) {
            logger.debug(`Artist "${artistName}" not found.`);
            return [];
        }

        const topTracks = await getTopTracks(artistId);

        logger.debug(`Top tracks by ${artistName}:`);
        topTracks.forEach((track, index) => {
            logger.debug(`${index + 1}. ${track.name}`);
        });

        return topTracks;
    } catch (error) {
        logger.error(`Error fetching top tracks: ${error.message}`);
    }
};

module.exports = {
    getArtistTopTracks,
    getAccessTokenFromRefreshToken,
    createPlaylist,
    getUserId
};
