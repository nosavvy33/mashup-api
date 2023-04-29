const { getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./playlist/spotify");
const { processArtists, getRandomTracks } = require("./playlist/artistProcessor");
const defaultPlaylistName = "Random Tracks from Artists";
const logger = require('./logger/logger');
const { playlistCreationPrompt } = require("./prompts/userPrompts");
const { loopPrompt } = require("./prompts/systemPrompts");
const { getTokens } = require('./auth/token-manager');

// add command to spice up with recommended tracks (most listened that are not hearted)
// make playlist tracks length an args, default to 10 x artist 
// make playlist duration an args

(async () => {
    let shouldContinue = true;

    while (shouldContinue) {
        try {
            const { accessToken, refreshToken } = await getTokens();

            const { artistNames, playlistName } = await playlistCreationPrompt();

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

        } catch (error) {
            logger.error(`Error in main function: ${error.message}`);
        }
    }

    shouldContinue = await loopPrompt();
})();

