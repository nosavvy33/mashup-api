const logger = require('./logger/logger');
const { playlistCreationPrompt } = require("./prompts/userPrompts");
const { loopPrompt } = require("./prompts/systemPrompts");
const { getTokens } = require('./auth/token-manager');
const { manageCreatePlaylist } = require("./playlist/playlistManager");

// add command to spice up with recommended tracks (most listened that are not hearted)
// make playlist tracks length an args, default to 10 x artist 
// make playlist duration an args

(async () => {
    let shouldContinue = true;

    while (shouldContinue) {
        try {
            const { accessToken, refreshToken } = await getTokens();

            const { artistNames, playlistName } = await playlistCreationPrompt();

            await manageCreatePlaylist(artistNames, playlistName, refreshToken);
        } catch (error) {
            logger.error(`Error in main function: ${error.message}`);
        }
    }

    shouldContinue = await loopPrompt();
})();

