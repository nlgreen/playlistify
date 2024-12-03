const express = require('express')
const auth = require('./auth')
const backend = require('./backend')

const port = 5005
var app = express();

app.get('/auth/login', auth.login);
app.get('/auth/callback', auth.callback)
// this is a "bootstrap" token method that won't try to refresh the token, causing a cycle
app.get('/auth/token', auth.token)

// this method will update the token if needed before returning it.
// it's used by the frontend to recycle the token when the user steps away for a long time (and so the backend
// hasn't had a chance to refresh it on its own)
app.get('/api/tokenCache', backend.tokenCache)
app.get('/api/queue', backend.queue)
app.get('/api/addToPlaylist', backend.addToPlaylist)
app.get('/api/playlistConfig', backend.playlistConfig)
app.get('/api/likedSongs', backend.likedSongs);
app.get('/api/removeFromLiked', backend.removeFromLiked)
app.get('/api/playlistSongs', backend.playlistSongs)
app.get('/api/playlistStructure', backend.playlistStructure)

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
