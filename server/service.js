const {all} = require("express/lib/application");

async function getAllUserPlaylists(spotify, meId, allowedPlaylists, offset = 0, limit = 50) {
    let playlists = {};
    while (true) {
        const response = await spotify.getUserPlaylists(meId, options={offset, limit});
        response.body.items.forEach(playlist => {
            //todo : remove first statement
            if (allowedPlaylists.has(playlist.name)) {
                if (playlist.name in playlists) {
                    throw new Error(`Can't add playlist ${playlist.name} as it is a duplicate`)
                }
                playlists[playlist.name] = playlist.id
            }
        });
        if (!response.body.next) {
            break;
        }
        offset += limit;
    }
    return playlists;
}

async function getAllPlaylistSongs(spotify, playlistId, offset= 0, limit = 50) {
    let songs = [];
    while (true) {
        const response = await spotify.getPlaylistTracks(playlistId, options={offset, limit});
        response.body.items.forEach(song => {
            songs.push(song.track.id);
        })
        if (!response.body.next) {
            break;
        }
        offset += limit;
    }
    return songs;
}

async function getAllLikedSongs(spotify, offset = 0, limit = 50) {
    let songs = []
    while (true) {
        if (offset % 250 === 0) {
            console.log("iteration " + offset)
        }
        const response = await spotify.getMySavedTracks(options={offset, limit});
        response.body.items.forEach(song => {
            songs.push(song.track.id);
        })
        // for testing
        // if (offset === 250) break;
        if (!response.body.next) {
            break;
        }
        offset += limit;
    }
    return songs;
}

async function addToPlaylist(spotify, playlistId, songId) {
    console.log(playlistId)
    console.log(songId)
    const songUri = `spotify:track:${songId}`
    await spotify.addTracksToPlaylist(playlistId, [songUri])
}

async function addToQueue(spotify, songId) {
    const songUri = `spotify:track:${songId}`
    await spotify.addToQueue(songUri)
}

async function getSongName(spotify, songId) {
    const response = await spotify.getTrack(songId);
    return response.body.name;
}

module.exports = { getAllUserPlaylists,
    getAllPlaylistSongs,
    getAllLikedSongs,
    addToPlaylist,
    addToQueue,
    getSongName};