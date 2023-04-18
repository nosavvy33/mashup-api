const prompts = require('prompts');
const { getArtistTopTracks, getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./spotify");
const { startAuthProcess } = require('./auth');
const { processArtists, getRandomTracks } = require("./artistProcessor");
const playlistName = "Random Tracks from Artists";

// add command to spice up with recommended tracks (most listened that are not hearted)
// make playlist tracks length an args, default to 10 x artist 
// make playlist duration an args

(async () => {
    try {
        console.log('Please open http://localhost:3000/login in your browser to start the authorization process.');

        // Call startAuthProcess to start the server and wait for the access token and refresh token
        const { accessToken, refreshToken } = await startAuthProcess();

        const questions = [
            {
                type: 'list',
                name: 'artistNames',
                message: 'Enter the artist names (comma-separated):',
                separator: ','
            },
            {
                type: 'text',
                name: 'playlistName',
                message: 'Enter the playlist name (leave empty for a default name):',
            },
        ];

        const { artistNames, playlistName } = await prompts(questions);

        const artists = artistNames.map(artist => artist.trim());

        // If the user didn't provide a playlist name, create a default name
        const defaultPlaylistName = `MashUp: ${artists.join(', ')}`;
        const finalPlaylistName = playlistName || defaultPlaylistName;

        const updatedAccessToken = await getAccessTokenFromRefreshToken(refreshToken);

        const topTracks = await processArtists(artists, updatedAccessToken);

        console.log(`About to randomize ${topTracks.length} tracks`)
        console.log(`Tracks ${topTracks}`);

        const randomTracks = getRandomTracks(topTracks, 10 * artists.length);

        console.log(`Creating playlist with uris ${randomTracks}`);

        const userId = await getUserId(updatedAccessToken);
        await createPlaylist(userId, accessToken, finalPlaylistName, randomTracks.map((track) => track.uri));

    } catch (error) {
        console.error("Error in main function:", error.message);
    }
})();

