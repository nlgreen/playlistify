import React, { useState } from 'react';
import { ThreeCircles } from  'react-loader-spinner'
import {toast} from "react-toastify";


const Loader = (props) => {
    const [loadingMessage, setLoadingMessage] = useState('');

    const toastMessage = (message) => {
        toast.info(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
        });
    }

    const handleClick = async () => {
        setLoadingMessage("Fetching Playlist Songs...");
        try {
            let response = await fetch('/api/playlistSongs?allowedPlaylists=' + JSON.stringify(props.playlists));

            const playlistSongs = await response.json();
            toastMessage(`Found ${playlistSongs.length} playlist songs`)

            setLoadingMessage("Fetching Liked Songs...");
            const newResponse = await fetch('/api/songsToProcess?playlistSongs=' + JSON.stringify(playlistSongs))
            const songsToProcess = await newResponse.json()

            toastMessage(`Found ${songsToProcess.length} songs to process`)

            props.setSongsToPlay(songsToProcess)
            props.setState("READY");
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const loader = <ThreeCircles
        height="50"
        width="50"
        color="#44c767"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        ariaLabel="three-circles-rotating"
        outerCircleColor=""
        innerCircleColor=""
        middleCircleColor=""
    />

    return (
        <div className="App">
            <header className="App-header">
                {loadingMessage !== '' ? loader : <a className="btn-spotify" onClick={handleClick}>Let's Start Processing!</a>}
                <div className="spacer">
                    {loadingMessage}
                </div>
            </header>
        </div>
    );
};

export default Loader;
