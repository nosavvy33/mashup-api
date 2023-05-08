const { lastValueFrom, forkJoin } = require("rxjs");
const { getArtistId, getLikedTracks } = require("../spotify/spotify-api");
const logger = require('../logger/logger');

const getTracksByArtists = async (artistNames) => {
    const likedTracks = await fetchAllLikedTracks();

    const artistsTopTracks$ = artistNames.map(async (artistName) => {
        logger.debug(`Fetching top tracks for ${artistName}:`);
        const topTracks = await getArtistTopTracks(likedTracks, artistName);
        return topTracks;
    });

    const allTopTracks = await lastValueFrom(forkJoin(artistsTopTracks$));
    return allTopTracks.flat();
}

const fetchAllLikedTracks = async () => {
    try {
        const likedTracks = await getLikedTracks();
        logger.debug(`Total liked tracks: ${likedTracks.length}`);
        return likedTracks;
    } catch (error) {
        logger.error(`Error fetching top tracks:, ${error.message}`);
    }
}

const getArtistTopTracks = async (likedTracks, artistName) => {
    const artistId = await getArtistId(artistName);

    if (!artistId) {
        logger.debug(`Artist "${artistName}" not found.`);
        return [];
    }

    const artistTopTracks = likedTracks
        .filter((item) => item.track.artists.some((artist) => artist.id === artistId))
        .map((item) => item.track);

    logger.debug(`Filtered tracks for artist ID ${artistId}: ${artistTopTracks.length}`);
    return artistTopTracks;
};

const getRandomTracks = (tracks, limit = 10) => {
    const shuffledTracks = tracks.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, limit);
}

const getTracksForPlaylist = async (artistNames) => {
    const topTracks = await getTracksByArtists(artistNames);

    logger.debug(`About to randomize ${topTracks.length} tracks`)
    logger.debug(`Tracks ${topTracks}`);

    logger.info(`Total hearted tracks from given artists ${topTracks.length}`);

    return getRandomTracks(topTracks, 10 * artistNames.length);
}

module.exports = {
    getTracksForPlaylist
};
