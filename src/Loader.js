import React, {useEffect, useState} from 'react';
import { ThreeCircles } from  'react-loader-spinner'
import {toast} from "react-toastify";
import shuffle from "shuffle-array";
import JsonContainer from "./JsonContainer";

const Loader = (props) => {
    // refers to the loading of the actual spotify data
    const [loadingMessage, setLoadingMessage] = useState('');

    // refers to the loading of the playlist configuration, which happens before user clicks load button
    const [preloaded, setPreloaded] = useState(false)

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

    const toastError = (message) => {
        toast.error(message, {
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

    useEffect(() => {

        //TODO: NEED TO RUN THIS AGAIN WHEN LOADING IS STARTED, SO THAT
        //FILE VALUES ARE FETCHED BEFORE LOADING SONGS
        async function preload() {
            let response = await fetch('/api/playlistConfig');
            const playlistConfig = await response.json();
            if (Object.keys(playlistConfig).length === 0) {
                toastError("Could not load playlists because config is invalid!")
                throw new Error("Could not load playlists because config is invalid!")
            }
            props.setPlaylistConfig(playlistConfig)

            const playlistStructureResponse = await fetch('/api/playlistStructure')
            const playlistStructure = await playlistStructureResponse.json()
            props.setPlaylistStructure(playlistStructure)

            toastMessage(`Found ${playlistStructure.length} playlist categories`)
            setPreloaded(true)
        }
        preload()
    }, [])

    const getAllPlaylistSongs = async () => {
        let playlistLoadedCount = 0;
        let allPlaylistSongs = new Set()

        const playlistsCount = Object.keys(props.playlistConfig).length
        setLoadingMessage(`Fetching Songs from Playlists...(${playlistLoadedCount}/${playlistsCount})`);

        for (const playlistName of Object.keys(props.playlistConfig)) {
            playlistLoadedCount += 1
            setLoadingMessage(`Fetching Songs from Playlists...(${playlistLoadedCount}/${playlistsCount})`);
            const playlistSongsResponse = await fetch('/api/playlistSongs?playlistId=' + props.playlistConfig[playlistName])
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

    if (!preloaded) {
        return (<div className="App">
            <header className="App-header">
                {loader}
            </header>
        </div>)
    }

    return (
        <div className="App">
            <div className="App-wrapper">
                <header className="App-header">
                    {loadingMessage !== '' ? loader : <a className="btn-spotify" onClick={handleClick}>Let's Start Processing!</a>}
                    <div className="spacer">{loadingMessage}</div>
                </header>
                <div className="json-wrapper">
                        <JsonContainer
                            playlistConfig={Object.keys(props.playlistConfig)}
                            playlistStructure={props.playlistStructure}
                        />
                </div>
            </div>
        </div>
    );
};

export default Loader;
