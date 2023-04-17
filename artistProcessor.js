const { from, lastValueFrom, forkJoin } = require("rxjs");
// const { forkJoin } = require("rxjs/operators");
const { getArtistTopTracks } = require("./spotify");

// const processArtists = async (artistNames, accessToken) => {
//     const observables = artistNames.map((artistName) => {
//         console.log(`\nFetching top tracks for ${artistName}:`);
//         return from(getArtistTopTracks(artistName, accessToken));
//     });

//     await forkJoin(observables).toPromise();
// };

// async function processArtists(artistNames, accessToken) {
//     const allTopTracks = [];

//     for (const artist of artistNames) { console.log(`About to fetch data for ${artist}`) }

//     for (const artistName of artistNames) {
//         console.log(`\nFetching top tracks for ${artistName}:`);
//         const topTracks = await getArtistTopTracks(artistName, accessToken);
//         allTopTracks.push(...topTracks);
//     }

//     console.log(`All top tracks length ${allTopTracks.length}`);

//     return allTopTracks;
// }

async function processArtists(artistNames, accessToken) {
    const artistsTopTracks$ = artistNames.map(async (artistName) => {
        console.log(`\nFetching top tracks for ${artistName}:`);
        const topTracks = await getArtistTopTracks(artistName, accessToken);
        return topTracks;
    });

    const allTopTracks = await lastValueFrom(forkJoin(artistsTopTracks$));
    return allTopTracks.flat();
}


const getRandomTracks = (tracks, limit = 10) => {
    const shuffledTracks = tracks.sort(() => 0.5 - Math.random());
    return shuffledTracks.slice(0, limit);
}

module.exports = {
    processArtists,
    getRandomTracks
};
