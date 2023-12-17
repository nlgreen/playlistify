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

    const getAllPlaylistSongs = async () => {
        let playlistCount = 0;
        setLoadingMessage(`Fetching Songs from Playlists...(${playlistCount}/${props.playlists.length})`);
        let allPlaylistSongs = new Set()
        let response = await fetch('/api/playlistConfig?allowedPlaylists=' + JSON.stringify(props.playlists));

        const playlistConfig = await response.json();
        props.setPlaylistConfig(playlistConfig)
        for (const playlist of props.playlists) {
            playlistCount += 1
            setLoadingMessage(`Fetching Songs from Playlists...(${playlistCount}/${props.playlists.length})`);
            const playlistSongsResponse = await fetch('/api/playlistSongs?playlistId=' + playlistConfig[playlist])
            const playlistSongs = await playlistSongsResponse.json()
            playlistSongs.forEach(item => allPlaylistSongs.add(item))
        }
        return Array.from(allPlaylistSongs);
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
        const allPlaylistSongs = await getAllPlaylistSongs()

        toastMessage(`Found ${allPlaylistSongs.length} playlist songs`)
        setLoadingMessage("Fetching Liked Songs...");

        const likedSongs = await getAllLikedSongs();
        const songsToProcess = likedSongs.filter(x => !allPlaylistSongs.includes(x));
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
                {loadingMessage !== '' ? loader : <a className="btn-spotify" onClick={handleClick}>Let's Start Processing!</a>}
                <div className="spacer">
                    {loadingMessage}
                </div>
            </header>
        </div>
    );
};

export default Loader;
