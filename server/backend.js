const service = require('./service')
const auth = require("./auth");
const SpotifyWebApi = require("spotify-web-api-node");
const dotenv = require("dotenv");
const JsonDataManager = require("./JsonDataManager");

dotenv.config();
const REACT_APP_ENV = process.env.REACT_APP_ENV || "prod";

var spotify_client_id = process.env.SPOTIFY_CLIENT_ID
var spotify_client_secret = process.env.SPOTIFY_CLIENT_SECRET

var spotify = new SpotifyWebApi({
    clientId: spotify_client_id,
    clientSecret: spotify_client_secret,
    redirectUri: 'http://www.example.com/callback'
});

let processedPlaylist = {id: null}

const structureFile = (REACT_APP_ENV === "dev") ? './resources/playlist_structure_dev.json' : './resources/playlist_structure.json';
const playlistStructureManager = new JsonDataManager(structureFile, JsonDataManager.PLAYLIST_STRUCTURE)

async function init() {
    if (!spotify.getAccessToken()) {
        spotify.setRefreshToken(auth.refresh_token.token)
        spotify.setAccessToken(auth.bare_token.token)
    }
    if (auth.shouldRefresh()) {
        console.log("Access token needs to be refreshed.")
        spotify.refreshAccessToken().then(
            function(data) {
                const token = data.body['access_token'];
                auth.bare_token.token = token;
                auth.expires_in.time = Math.floor(Date.now() / 1000) + data.body['expires_in'];
                spotify.setAccessToken(token);
                console.log('The access token has been refreshed!');
            },
            function(err) {
                console.log('Could not refresh access token', err);
            }
        );
    }
    // the advantage of the processed folder over combining songs from the individual playlist folders is that
    // you can still add songs without using the application to individual playlists and they will be "fully"
    // processed at a later date.
    if (processedPlaylist.id == null) {
        if (REACT_APP_ENV === "dev") {
            const res = await getPlaylistConfig(spotify, new Set(["Processed-dev", "Dev1", "Dev2"]));
            processedPlaylist.id = res["Processed-dev"];
            const devPlaylists = [
                res["Processed-dev"],
                res["Dev1"],
                res["Dev2"]
            ];
            for (const playlistId of devPlaylists) {
                await service.clearPlaylist(spotify, playlistId);
            }
        } else {
            const res = await getPlaylistConfig(spotify, new Set(["Processed"]));
            processedPlaylist.id = res["Processed"];
        }
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

async function removeFromPlaylist(songId, playlistName, playlistId) {
  try {
    // Remove the song (using an array of one track object) from the playlist.
    await spotify.removeTracksFromPlaylist(playlistId, [{ uri: "spotify:track:" + songId }]);
    return "";
  } catch (e) {
    console.error("Error removing song from playlist:", e);
    return e.message || "Error removing song from playlist.";
  }
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
    if (playlistName !== "Processed" && playlistName !== "Processed-dev") {
        const processedPlaylistName = (REACT_APP_ENV === "dev") ? "Processed-dev" : "Processed";
        message = await service.addToPlaylist(spotify, processedPlaylist.id, processedPlaylistName, songId, true)
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
    init();
    const isDev = (REACT_APP_ENV === "dev");
    const likedSongs = await service.getLikedSongs(spotify, parseInt(req.query.offset), isDev);
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

exports.tokenCache = function(req, res){
    init()
    res.json({ access_token: auth.bare_token.token})
};

exports.removeFromPlaylist = async (req, res) => {
  const { songId, playlistName, playlistId } = req.query;
  if (!songId || !playlistName || !playlistId) {
    res.status(400).json("Missing required query parameters (songId, playlistName, playlistId)");
    return;
  }
  const message = await removeFromPlaylist(songId, playlistName, playlistId);
  res.json(message);
};