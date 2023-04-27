const prompts = require('prompts');
const { getArtistTopTracks, getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./spotify");
const { startAuthProcess } = require('./auth');
const { processArtists, getRandomTracks } = require("./artistProcessor");
const defaultPlaylistName = "Random Tracks from Artists";
const logger = require('./logger');
const { readTokenFile, writeTokenFile, isTokenValid } = require('./token-manager');
const { playlistCreationPrompt } = require("./prompts/userPrompts");
const { loopPrompt } = require("./prompts/systemPrompts");


// add command to spice up with recommended tracks (most listened that are not hearted)
// make playlist tracks length an args, default to 10 x artist 
// make playlist duration an args

(async () => {
    let shouldContinue = true;

    while (shouldContinue) {
        try {
            let tokenData = readTokenFile();
            logger.info(`Token data ${tokenData.refreshToken}`)
            logger.info(`Token validation ${await isTokenValid(tokenData.access_token)}`)

            if (!tokenData || !(await isTokenValid(tokenData.accessToken))) {
                logger.info('Please open http://localhost:3000/login in your browser to start the authorization process.');
                // Start the authentication flow and update the token data
                tokenData = await startAuthProcess();
                writeTokenFile(tokenData);
            }

            const accessToken = tokenData.accessToken;
            const refreshToken = tokenData.refreshToken;

            // const questions = [
            //     {
            //         type: 'list',
            //         name: 'artistNames',
            //         message: 'Enter the artist names (comma-separated):',
            //         separator: ','
            //     },
            //     {
            //         type: 'text',
            //         name: 'playlistName',
            //         message: 'Enter the playlist name (leave empty for a default name):',
            //     },
            // ];

            // const { artistNames, playlistName } = await prompts(questions);
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

    // After creating a playlist, ask the user if they want to create another one
    // const response = await prompts({
    //     type: 'confirm',
    //     name: 'continue',
    //     message: 'Do you want to create another playlist?',
    // });

    // shouldContinue = response.continue;
    shouldContinue = await loopPrompt();
})();

