import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import Loader from './Loader'
import './App.css';
import {ToastContainer} from "react-toastify";

const ALLOWED_PLAYLISTS = ["Afrobeats", "Biking", "Brass", "Build Up", "Bumpy", "Chillax (Electric)", "Chillax (Quiet)", "Chillax (Relax)", "Country", "Dance Free", "Download", "Duet", "Favorites", "Feel It", "Folky", "Foreign", "Funky", "Go Hard", "Happy", "Hip Hop", "House-Electric Party", "Instrumental", "Jazz", "Light Rap", "Mashup", "Not Love", "NoPlaylist", "Pop (Boy)", "Pop (Gen)", "Pop (Girl)", "Pump Up", "Rap", "RnB Style", "Road Trip", "Rock (Misc)", "Singalong", "Summer", "Vibe", "Whistle"];

const STATIC_PLAYLISTS = [
  { "name": "Positive Energy", "playlists": ["Bumpy", "Dance Free", "Go Hard", "Happy", "House-Electric Party", "Pop (Boy)", "Pop (Gen)", "Pop (Girl)", "Singalong", "Summer", "Vibe"] },
  { "name": "Instrumentation", "playlists": ["Brass", "Instrumental", "Whistle"] },
  { "name": "Genre", "playlists": ["Afrobeats", "Chillax (Electric)", "Country", "Folky", "Funky", "Hip Hop", "House-Electric Party", "Jazz", "Light Rap", "Mashup", "Pop (Boy)", "Pop (Gen)", "Pop (Girl)", "RnB Style", "Rap", "Rock (Misc)"] },
  { "name": "Activity", "playlists": ["Biking", "Dance Free", "Go Hard", "Not Love", "Pump Up", "Road Trip", "Singalong"] },
  { "name": "Composition", "playlists": ["Build Up", "Duet", "Foreign", "Mashup"] },
  { "name": "Lowkey", "playlists": ["Chillax (Quiet)", "Chillax (Relax)", "Feel It", "Folky", "Jazz"] },
  { "name": "Misc", "playlists": ["Download", "Favorites", "NoPlaylist"] }
]
function App() {

  const [token, setToken] = useState('');
  const [state, setState] = useState('UNAUTHENTICATED')
  const [songsToPlay, setSongsToPlay] = useState([])

    async function getToken() {
      const response = await fetch('/auth/token');
      const json = await response.json();
      setToken(json.access_token);
      if (json.access_token) {
        setState('LOAD')
      }
    }

    let innerContent;
    if (state === 'UNAUTHENTICATED') {
      getToken();
      innerContent = <Login/>
    } else if (state === 'LOAD') {
      innerContent = <Loader setSongsToPlay={setSongsToPlay} setState={setState} playlists={ALLOWED_PLAYLISTS}/>
    } else {
      innerContent = <WebPlayback token={token} songsToPlay={songsToPlay} playlists={STATIC_PLAYLISTS}/>
    }
    return (
        <>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
      />
          {innerContent}
    </>)
}


export default App;
