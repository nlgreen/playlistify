const service = require('./service')
var shuffle = require('shuffle-array')
const auth = require("./auth");
const SpotifyWebApi = require("spotify-web-api-node");
const dotenv = require("dotenv");

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify = new SpotifyWebApi({
    clientId: spotify_client_id,
    clientSecret: spotify_client_secret,
    redirectUri: 'http://www.example.com/callback'
});

function setDifference(a, b) {
    return new Set(Array.from(a).filter(item => !b.has(item)));
}

async function getPlaylistSongs(spotify, allowedPlaylists) {
    let meId = await spotify.getMe();
    meId = meId.body.id
    const playlists = await service.getAllUserPlaylists(spotify, meId, allowedPlaylists);
    console.log(JSON.stringify(playlists))
    console.log(JSON.stringify(Array.from(allowedPlaylists)))
    console.log(playlists.length)
    console.log(allowedPlaylists.size)
    if (playlists.length !== allowedPlaylists.size) {
        throw new Error("Not all playlists could be found");
    }
    const playlistSongs = new Set();

    for (const playlist of playlists) {
        const tmpSongs = await service.getAllPlaylistSongs(spotify, playlist.id);
        tmpSongs.forEach(item => playlistSongs.add(item))
    }
    return Array.from(playlistSongs)
}

async function getSongsToProcess(spotify, playlistSongs) {
    let likedSongs = await service.getAllLikedSongs(spotify);
    likedSongs = new Set(likedSongs);

    const songsToProcess = Array.from(setDifference(likedSongs, new Set(playlistSongs)));
    shuffle(songsToProcess);
    return songsToProcess;
}

async function getPlaylistByName(spotify, playlistName) {
    let meId = await spotify.getMe();
    meId = meId.body.id
    const playlists = await service.getAllUserPlaylists(spotify, meId, new Set());
    for (const playlist of playlists) {
        if (playlist.name === playlistName) {
            return playlist.id;
        }
    }
    throw new Error("Playlist not found! " + playlistName)
}

exports.queue = async function(req, res) {
    const songId = req.query.songId;
    await service.addToQueue(spotify, songId)
    const songName = await service.getSongName(spotify, songId);
    console.log("Added to queue: " + songName)
    res.send(songName)
}

//todo : only add if not present in playlist
exports.addToPlaylist = async function(req, res) {
    const songId = req.query.songId;
    const songName = await service.getSongName(spotify, songId);
    const playlistName = req.query.playlistName;
    const playlistId = await getPlaylistByName(spotify, playlistName);
    await service.addToPlaylist(spotify, playlistId, songId);
    console.log("added " + songName + " to " + playlistName);
}

exports.playlistSongs = async function(req, res) {
    spotify.setAccessToken(auth.bare_token.token);
    const allowedPlaylistList = JSON.parse(req.query.allowedPlaylists);
    const allowedPlaylists = new Set(allowedPlaylistList);
    res.json(await getPlaylistSongs(spotify, allowedPlaylists));
}

exports.songsToProcess = async function(req, res) {
    const playlistSongs = JSON.parse(req.query.playlistSongs);
    const songsToProcess = await getSongsToProcess(spotify, playlistSongs)
    res.json(songsToProcess);
}
