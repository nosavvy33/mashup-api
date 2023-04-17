const { getArtistTopTracks, getAccessTokenFromRefreshToken, getUserId, createPlaylist } = require("./spotify");
const { processArtists, getRandomTracks } = require("./artistProcessor");
const playlistName = "Random Tracks from Artists";

(async () => {
    try {
        const [accessToken, refreshToken, ...artistNames] = process.argv.slice(2);
        if (!accessToken || !refreshToken || artistNames.length === 0) {
            console.error("Please provide access token, refresh token, and artist name as arguments.");
            process.exit(1);
        }

        const updatedAccessToken = await getAccessTokenFromRefreshToken(refreshToken);

        const topTracks = await processArtists(artistNames, updatedAccessToken);

        console.log(`About to randomize ${topTracks.length} tracks`)
        console.log(`Tracks ${topTracks}`);

        const randomTracks = getRandomTracks(topTracks, 10 * artistNames.length);

        console.log(`Creating playlist with uris ${randomTracks}`);

        const userId = await getUserId(updatedAccessToken);
        await createPlaylist(userId, accessToken, playlistName, randomTracks.map((track) => track.uri));

    } catch (error) {
        console.error("Error in main function:", error.message);
    }
})();

