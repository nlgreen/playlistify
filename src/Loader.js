import React, { useState } from 'react';
import { ThreeCircles } from  'react-loader-spinner'
import {toast} from "react-toastify";
import shuffle from "shuffle-array";

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

    const getProcessedSongs = async () => {
        let response = await fetch('/api/playlistConfig');
        const playlistConfig = await response.json()
        setLoadingMessage(`Fetching songs from Processed playlist...`);
        props.setPlaylistConfig(playlistConfig)
        const playlistSongsResponse = await fetch('/api/playlistSongs?playlistId=' + playlistConfig["Processed"])
        return await playlistSongsResponse.json()
    }

    const getAllLikedSongs = async () => {
        let offset = 0;
        let complete = false;
        let likedSongs = []
        while (!complete) {
            const likedSongsResponseObj = await fetch('/api/likedSongs?offset=' + offset)
            const likedSongsResponse = await likedSongsResponseObj.json()
            likedSongsResponse.songs.forEach(song => {
                likedSongs.push(song);
            })
            offset = likedSongsResponse.offset
            complete = likedSongsResponse.complete
            const total = likedSongsResponse.total
            setLoadingMessage(`Fetching Liked Songs...(${offset}/${total})`);
        }
        return likedSongs;
    }

    const handleClick = async () => {
        const playlistStructureResponse = await fetch('/api/playlistStructure')
        const playlistStructure = await playlistStructureResponse.json()
        props.setPlaylistStructure(playlistStructure)
        toastMessage(`Found ${playlistStructure.length} playlist categories`)

        const processedSongs = await getProcessedSongs()
        toastMessage(`Found ${processedSongs.length} processed songs`)

        setLoadingMessage("Fetching Liked Songs...");
        const likedSongs = await getAllLikedSongs();
        const songsToProcess = likedSongs.filter(x => !processedSongs.includes(x));
        shuffle(songsToProcess);
        toastMessage(`Found ${songsToProcess.length} songs to process in total`)

        props.setSongsToPlay(songsToProcess)
        props.setState("READY");
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
                {loadingMessage !== '' ? loader : <a className="btn-spotify" onClick={handleClick}>Start Processing!</a>}
                <div className="spacer">
                    {loadingMessage}
                </div>
            </header>
        </div>
    );
};

export default Loader;
