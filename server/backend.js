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

const playlistStructureManager = new JsonDataManager('./resources/playlist_structure.json', JsonDataManager.PLAYLIST_STRUCTURE)

function init() {
    if (!spotify.getAccessToken()) {
        spotify.setAccessToken(auth.bare_token.token)
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
    const success = await service.addToPlaylist(spotify, playlistId, songId);
    if (success) {
        console.log("Added " + songName + " to " + playlistName);
    }
    res.json(success)
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