const express = require('express')
const auth = require('./auth')
const backend = require('./backend')

const port = 5005
var app = express();

app.get('/auth/login', auth.login);
app.get('/auth/callback', auth.callback)
app.get('/auth/token', auth.token)

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
