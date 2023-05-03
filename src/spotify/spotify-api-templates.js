const BASE_URL = "https://api.spotify.com/v1"

const GetUserRequest = {
    method: "get",
    url: `${BASE_URL}/me`
};

const GetArtistRequest = (artistName) => ({
    method: "get",
    url: `${BASE_URL}/search`,
    params: {
        q: artistName,
        type: "artist",
        limit: 1,
    }
})

const GetLikedTracksRequest = (limit, offset) => ({
    method: "get",
    url: `${BASE_URL}/me/tracks`,
    params: {
        limit,
        offset,
    }
})

const CreatePlaylistRequest = (userId, playlistName) => ({
    method: "post",
    url: `${BASE_URL}/users/${userId}/playlists`,
    data: { name: playlistName }
})

const AddTracksToPlaylistRequest = (playlistId, trackUris) => ({
    method: "post",
    url: `${BASE_URL}/playlists/${playlistId}/tracks`,
    data: { uris: trackUris }
})

module.exports = { GetUserRequest, GetArtistRequest, GetLikedTracksRequest, CreatePlaylistRequest, AddTracksToPlaylistRequest } 
