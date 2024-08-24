const service = require('./service')
const auth = require("./auth");
const SpotifyWebApi = require("spotify-web-api-node");
const dotenv = require("dotenv");
const JsonDataManager = require("./JsonDataManager");

dotenv.config()

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify = new SpotifyWebApi({
    clientId: spotify_client_id,
    clientSecret: spotify_client_secret,
    redirectUri: 'http://www.example.com/callback'
});

let processedPlaylist = {id: null}

const playlistStructureManager = new JsonDataManager('./resources/playlist_structure.json', JsonDataManager.PLAYLIST_STRUCTURE)

async function init() {
    if (!spotify.getAccessToken()) {
        spotify.setAccessToken(auth.bare_token.token)
    }
    // the advantage of the processed folder over combining songs from the individual playlist folders is that
    // you can still add songs without using the application to individual playlists and they will be "fully"
    // processed at a later date.
    if (processedPlaylist.id == null) {
        const res = await getPlaylistConfig(spotify, new Set(["Processed"]))
        processedPlaylist.id = res["Processed"]
    }
}

async function getPlaylistConfig(spotify, allowedPlaylists) {
    let meId = await spotify.getMe();
    meId = meId.body.id
    const playlists = await service.getAllUserPlaylists(spotify, meId, allowedPlaylists);
    if (Object.keys(playlists).length !== allowedPlaylists.size) {
        throw new Error("Not all playlists could be found");
    }
    return playlists;
}

exports.queue = async function(req, res) {
    init()
    const songId = req.query.songId;
    await service.addToQueue(spotify, songId)
    const songName = await service.getSongName(spotify, songId);
    console.log("Added to queue: " + songName)
    res.send(songName)
}

exports.addToPlaylist = async function(req, res) {
    init()
    const songId = req.query.songId;
    const songName = await service.getSongName(spotify, songId);
    const playlistName = req.query.playlistName;
    const playlistId = req.query.playlistId;
    let message = await service.addToPlaylist(spotify, playlistId, playlistName, songId, false);
    if (message === '') {
        console.log("Added " + songName + " to " + playlistName);
    } else {
        res.json(message);
        return;
    }
    if (playlistName !== "Processed") {
        message = await service.addToPlaylist(spotify, processedPlaylist.id, "Processed", songId, true)
    }
    res.json(message)
}

exports.playlistConfig = async function(req, res) {
    init()
    const playlistStructure = playlistStructureManager.get();
    let uniquePlaylists = [];
    playlistStructure.forEach(item => {
        uniquePlaylists.push(...item.playlists);
    });
    uniquePlaylists = new Set(uniquePlaylists.sort());
    res.json(await getPlaylistConfig(spotify, uniquePlaylists));
}

exports.likedSongs = async function(req, res) {
    init()
    const likedSongs = await service.getLikedSongs(spotify, parseInt(req.query.offset));
    res.json(likedSongs);
}

exports.removeFromLiked = async function(req, res) {
    init()
    await service.removeFromLikedSongs(spotify, req.query.songId, req.query.songName)
    res.send(true)
}

exports.playlistSongs = async function(req, res) {
    init()
    const playlistId = req.query.playlistId
    const playlistSongs = await service.getAllPlaylistSongs(spotify, playlistId)
    res.json(playlistSongs)
}

exports.playlistStructure = async function(req, res) {
    init()
    const playlistStructure = playlistStructureManager.get();
    res.json(playlistStructure)
}