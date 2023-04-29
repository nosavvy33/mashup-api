const { getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./spotify");
const { processArtists, getRandomTracks } = require("./artistProcessor");
const defaultPlaylistName = "Random Tracks from Artists";
const logger = require('../logger/logger');

async function manageCreatePlaylist(artistNames, playlistName, accessToken, refreshToken) {
    const artists = artistNames.map(artist => artist.trim());

    // If the user didn't provide a playlist name, create a default name
    const artistString = artists.join(', ');
    const defaultPlaylistName = `MashUp: ${artistString}`;
    const finalPlaylistName = playlistName || defaultPlaylistName;

    logger.info(`Starting to process playlist for ${artistString}`);

    const updatedAccessToken = await getAccessTokenFromRefreshToken(refreshToken);

    const topTracks = await processArtists(artists, updatedAccessToken);

    logger.debug(`About to randomize ${topTracks.length} tracks`)
    logger.debug(`Tracks ${topTracks}`);

    logger.info(`Total hearted tracks from given artists ${topTracks.length}, creating playlist...`);

    const randomTracks = getRandomTracks(topTracks, 10 * artists.length);

    logger.debug(`Creating playlist with uris ${randomTracks}`);

    const userId = await getUserId(updatedAccessToken);
    await createPlaylist(userId, accessToken, finalPlaylistName, randomTracks.map((track) => track.uri));
}

module.exports = { manageCreatePlaylist }