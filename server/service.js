async function getAllUserPlaylists(spotify, meId, allowedPlaylists, offset = 0, limit = 50) {
    let playlists = {};
    while (true) {
        const response = await spotify.getUserPlaylists(meId, options={offset, limit});
        response.body.items.forEach(playlist => {
            if (allowedPlaylists.has(playlist.name)) {
                if (playlist.name in playlists && playlist.id !== playlists[playlist.name]) {
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

async function getLikedSongs(spotify, offset = 0, limit = 200) {
    let songs = []
    let count = 0
    let complete = false;
    let total = 0;
    while (count < limit) {
        const response = await spotify.getMySavedTracks(options = {offset, limit: 50});
        total = response.body.total
        response.body.items.forEach(song => {
            songs.push(song.track.id);
        })
        // for testing
        // if (offset > 250){
        // break; complete = true;
        // }
        if (!response.body.next) {
            complete = true;
            break;
        }
        offset += 50;
        count += 50;
    }
    return {songs, offset, complete, total};
}

async function removeFromLikedSongs(spotify, songId, songName) {
    await spotify.removeFromMySavedTracks([songId])
    console.log("Removed " + songName + " from liked songs");
}

async function addToPlaylist(spotify, playlistId, playlistName, songId, allowDuplicates) {
    const songUri = `spotify:track:${songId}`
    let playlistSongs = await getAllPlaylistSongs(spotify, playlistId);
    if (playlistSongs.includes(songId)) {
        if (!allowDuplicates) {
            return "Playlist " + playlistName + " already has song!";
        }
        return ""
    }
    await spotify.addTracksToPlaylist(playlistId, [songUri])
    playlistSongs = await getAllPlaylistSongs(spotify, playlistId);
    if (!playlistSongs.includes(songId)) {
        return "Song was not successfully added to " + playlistName;
    }
    return "";
}

async function addToQueue(spotify, songId) {
    const songUri = `spotify:track:${songId}`
    // some sort of race condition...without this, songs are often not actually added to the queue
    // hopefully it doesn't affect other endpoints like adding songs?
    //todo : fetch songs for playlist remotely after adding to confirm presence
    await new Promise(r => setTimeout(r, 750));
    await spotify.addToQueue(songUri)
}

async function getSongName(spotify, songId) {
    const response = await spotify.getTrack(songId);
    return response.body.name;
}

module.exports = { getAllUserPlaylists,
    getAllPlaylistSongs,
    getLikedSongs,
    addToPlaylist,
    addToQueue,
    getSongName,
    removeFromLikedSongs};