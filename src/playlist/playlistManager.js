const { getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./spotify-api");
const { getTracksForPlaylist } = require("./artistProcessor");
const defaultPlaylistName = "Random Tracks from Artists";
const logger = require('../logger/logger');

async function manageCreatePlaylist(artistNames, playlistName, accessToken, refreshToken) {
    const finalPlaylistName = playlistName || defaultPlaylistNameParser(artistNames);

    logger.info(`Starting to process playlist ${finalPlaylistName}`);

    // refactor use of accessToken and refreshToken like in a spotify-api-manager
    const updatedAccessToken = await getAccessTokenFromRefreshToken(refreshToken);
    const userId = await getUserId(updatedAccessToken);

    var randomTracks = await getTracksForPlaylist(artistNames, updatedAccessToken);
    logger.debug(`Creating playlist with uris ${randomTracks}`);
    logger.info(`Creating playlist with ${randomTracks.length} tracks`);

    await createPlaylist(userId, updatedAccessToken, finalPlaylistName, randomTracks.map((track) => track.uri));
}

function defaultPlaylistNameParser(artistNames) {
    const artists = artistNames.map(artist => artist.trim());

    // If the user didn't provide a playlist name, create a default name
    const artistString = artists.join(', ');
    return `MashUp: ${artistString}`;
}

module.exports = { manageCreatePlaylist }