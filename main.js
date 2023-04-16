const { getArtistTopTracks, getAccessTokenFromRefreshToken } = require("./spotify");

const getArguments = () => {
    const args = process.argv.slice(2);
    const accessToken = args[0];
    const refreshToken = args[1];
    const artistName = args.slice(2).join(' ');

    return { accessToken, refreshToken, artistName };
};

const { accessToken, refreshToken, artistName } = getArguments();

if (!accessToken || !refreshToken || !artistName) {
    console.error("Please provide access token, refresh token, and artist name as arguments.");
    process.exit(1);
}

const fetchArtistTopTracks = async () => {
    const freshAccessToken = await getAccessTokenFromRefreshToken(refreshToken);
    getArtistTopTracks(artistName, freshAccessToken);
};

fetchArtistTopTracks();


