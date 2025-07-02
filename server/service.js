async function getAllUserPlaylists(spotify, meId, allowedPlaylists, offset = 0, limit = 50) {
    let playlists = {};
    while (true) {
        const response = await spotify.getUserPlaylists(meId, options={offset, limit});
        response.body.items.forEach(playlist => {
            if (playlist && allowedPlaylists.has(playlist.name)) {
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
        response.body.items.forEach(item => {
            songs.push({
                id: item.track.id,
                name: item.track.name,
                artist: item.track.artists[0].name
            });
        })
        if (!response.body.next) {
            break;
        }
        offset += limit;
    }
    return songs;
}

async function getLikedSongs(spotify, offset = 0, isDev = false, limit = 200) {
    if (isDev) {
        // https://open.spotify.com/track/5lTTysbUb81Cn2MJQ9m1FC
        const devSongIds = [ "5lTTysbUb81Cn2MJQ9m1FC", "6DLbBlGIOjjEj0dNN25zhZ", "3zyqphgXvgHe436IMKeey3", "14XWxMtz3iJ0vmy5tNebyB", "2EWnKuspetOzgfBtmaNZvJ"];
        // For dev mode, we need to fetch the actual track details to get names and artists
        const tracksResponse = await spotify.getTracks(devSongIds);
        const devSongs = tracksResponse.body.tracks.map(track => ({
            id: track.id,
            name: track.name,
            artist: track.artists[0].name
        }));
        return { songs: devSongs, offset, complete: true, total: devSongs.length };
    } else {
        let songs = [];
        let count = 0;
        let complete = false;
        let total = 0;
        while (limit === undefined || count < limit) {
            const response = await spotify.getMySavedTracks(options = { offset, limit: 50 });
            total = response.body.total;
            response.body.items.forEach(item => {
                songs.push({
                    id: item.track.id,
                    name: item.track.name,
                    artist: item.track.artists[0].name
                });
            });
            if (!response.body.next) {
                complete = true;
                break;
            }
            offset += 50;
            count += 50;
        }
        return { songs, offset, complete, total };
    }
}

async function removeFromLikedSongs(spotify, songId, songName) {
    await spotify.removeFromMySavedTracks([songId])
    console.log("Removed " + songName + " from liked songs");
}

async function addToPlaylist(spotify, playlistId, playlistName, songId, allowDuplicates) {
    const songUri = `spotify:track:${songId}`
    let playlistSongs = await getAllPlaylistSongs(spotify, playlistId);
    const songExists = playlistSongs.some(song => song.id === songId);
    if (songExists) {
        if (!allowDuplicates) {
            return "Playlist " + playlistName + " already has song!";
        }
        return ""
    }
    await spotify.addTracksToPlaylist(playlistId, [songUri])
    playlistSongs = await getAllPlaylistSongs(spotify, playlistId);
    const songAdded = playlistSongs.some(song => song.id === songId);
    if (!songAdded) {
        return "Song was not successfully added to " + playlistName;
    }
    return ""
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

async function clearPlaylist(spotify, playlistId) {
    const songs = await getAllPlaylistSongs(spotify, playlistId);
    if (songs.length === 0) {
        return;
    }
    const trackUris = songs.map(song => ({ uri: `spotify:track:${song.id}` }));
    for (let i = 0; i < trackUris.length; i += 100) {
        const chunk = trackUris.slice(i, i + 100);
        await spotify.removeTracksFromPlaylist(playlistId, chunk);
    }
}

module.exports = { getAllUserPlaylists,
    getAllPlaylistSongs,
    getLikedSongs,
    addToPlaylist,
    addToQueue,
    getSongName,
    removeFromLikedSongs,
    clearPlaylist};