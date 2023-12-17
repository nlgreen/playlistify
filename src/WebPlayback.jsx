import React, { useState, useEffect } from 'react';
import PlaylistContainer from "./PlaylistContainer";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const track = {
    name: "",
    album: {
        images: [
            { url: "" }
        ]
    },
    artists: [
        { name: "" }
    ]
}

function WebPlayback(props) {

    const [is_paused, setPaused] = useState(false);
    const [is_active, setActive] = useState(false);
    const [player, setPlayer] = useState(undefined);
    const [current_track, setTrack] = useState(track);
    const [songIndex, setSongIndex] = useState(0);
    const [usedPlaylists, setUsedPlaylists] = useState([])

    // the listener will never update with the initial (empty) track state,
    /// so use this to get a reference to it that updates instead
    const currentTrackRef = React.useRef(current_track);
    const setCurrentTrackRef = data => {
        currentTrackRef.current = data;
        setTrack(data);
    };

    const songIndexRef = React.useRef(songIndex);
    const setSongIndexRef = data => {
        songIndexRef.current = data;
        setSongIndex(data);
    };

    const usedPlaylistsRef = React.useRef(usedPlaylists);
    const setUsedPlaylistsRef = data => {
        usedPlaylistsRef.current = data;
        setUsedPlaylists(data);
    };

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {

            const player = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb(props.token); },
                volume: 0.5
            });

            setPlayer(player);

            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.addListener('player_state_changed', ( state => {
                if (!state) {
                    return;
                }

                if (currentTrackRef.current.name && (currentTrackRef.current.name !== state.track_window.current_track.name)) {
                    fetch('/api/queue?songId=' + props.songsToPlay[songIndexRef.current]).then((response) => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.text()
                    }).then(songName => {
                        toast.success(`Added ${songName} to queue`, {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: true,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            theme: "dark",
                        });
                    });
                    setSongIndexRef(songIndexRef.current += 1)
                    setUsedPlaylistsRef([])

                }
                setCurrentTrackRef(state.track_window.current_track);

                setPaused(state.paused);

                player.getCurrentState().then( state => { 
                    (!state)? setActive(false) : setActive(true) 
                });

            }));

            player.connect();

        };
    }, []);

    if (!is_active) { 
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">
                        <b> Instance not active. Transfer your playback using your Spotify app </b>
                    </div>
                </div>
            </>)
    } else {
        return (
            <>
                <div className="container">
                    <div className="main-wrapper">

                        <img src={current_track.album.images[0].url} className="now-playing__cover" alt="" />

                        <div className="now-playing__side">
                            <div className="now-playing__name">{current_track.name}</div>
                            <div className="now-playing__artist">{current_track.artists[0].name}</div>

                            <button className="btn-spotify" onClick={() => { player.previousTrack() }} >
                                &lt;&lt;
                            </button>

                            <button className="btn-spotify" onClick={() => { player.togglePlay() }} >
                                { is_paused ? "PLAY" : "PAUSE" }
                            </button>

                            <button className="btn-spotify" onClick={() => { player.nextTrack() }} >
                                &gt;&gt;
                            </button>
                        </div>
                    </div>
                    <PlaylistContainer playlists={props.playlists}
                                       usedPlaylists={usedPlaylists}
                                       setUsedPlaylists={setUsedPlaylistsRef}
                                       playlistConfig={props.playlistConfig}
                                       currentTrackRef={currentTrackRef} />
                </div>
            </>
        );
    }
}

export default WebPlayback
