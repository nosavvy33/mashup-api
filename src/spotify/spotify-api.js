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

const createPlaylist = async (userId, playlistName, trackUris) => {
    logger.debug(`About to create playtlist with ${userId}, name ${playlistName} and trackUris ${trackUris}`);

    const apiClient = getApiClient();
    const createPlaylistResponse = await apiClient(CreatePlaylistRequest(userId, playlistName));

    const playlistId = createPlaylistResponse.data.id;

    logger.debug(`playListCreated ${playlistId}`);

    await apiClient(AddTracksToPlaylistRequest(playlistId, trackUris));

    logger.info(`Playlist "${playlistName}" created with ${trackUris.length} tracks.`);
}

module.exports = {
    getAccessTokenFromRefreshToken,
    createPlaylist,
    getArtistId,
    getAllLikedTracks,
    getUserId
};
