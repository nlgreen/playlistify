import React, { useState, useEffect } from 'react';
import WebPlayback from './WebPlayback'
import Login from './Login'
import Loader from './Loader'
import './App.css';
import {ToastContainer} from "react-toastify";

function App() {

  const [token, setToken] = useState('');
  const [state, setState] = useState('UNAUTHENTICATED')
  const [songsToPlay, setSongsToPlay] = useState([])
  const [playlistConfig, setPlaylistConfig] = useState({})
  const [playlistStructure, setPlaylistStructure] = useState([])

    useEffect(() => {
      document.title = "Playlistify"
    }, []);

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
      innerContent = <Loader setSongsToPlay={setSongsToPlay}
                             setState={setState}
                             setPlaylistConfig={setPlaylistConfig}
                             setPlaylistStructure={setPlaylistStructure}/>
    } else {
      innerContent = <WebPlayback token={token}
                                  songsToPlay={songsToPlay}
                                  playlistConfig={playlistConfig}
                                  playlistStructure={playlistStructure}/>
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
