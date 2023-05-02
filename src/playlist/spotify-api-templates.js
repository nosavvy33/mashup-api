function GetUser() {
    return {
        method: "get",
        url: "/me"
    }
}

function GetArtist(artistName) {
    return {
        method: "get",
        url: "/search",
        params: {
            q: artistName,
            type: "artist",
            limit: 1,
        }
    }
}

function GetLikedTracks() {
    return {
        method: "get",
        url: "/me/tracks",
        params: {
            limit,
            offset,
        }
    }
}

function CreatePlaylist(userId, playlistName) {
    return {
        method: "post",
        url: `/users/${userId}/playlists`,
        data: { name: playlistName }
    }
}

function AddTracksToPlaylist(playlistId, trackUris) {
    return {
        method: "post",
        url: `/playlists/${playlistId}/tracks`,
        data: { uris: trackUris }
    }
}

module.exports = { GetUser, GetArtist, GetLikedTracks, CreatePlaylist, AddTracksToPlaylist } 
