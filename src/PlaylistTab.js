import React from 'react';
import { toast } from 'react-toastify';

function PlaylistTab(props) {
    const playlists = props.playlists;
    const usedPlaylists = props.usedPlaylists;
    const setUsedPlaylists = props.setUsedPlaylists;
    const currentTrackRef = props.currentTrackRef;
    const playlistConfig = props.playlistConfig

    const addToPlaylistBackendAPI = async (playlistName) => {
        const response = await fetch(`/api/addToPlaylist?songId=${currentTrackRef.current.id}&playlistName=${playlistName}&playlistId=${playlistConfig[playlistName]}`);
        return await response.json();
    };

    const removeFromPlaylistBackendAPI = async (playlistName) => {
        const response = await fetch(`/api/removeFromPlaylist?songId=${currentTrackRef.current.id}&playlistName=${playlistName}&playlistId=${playlistConfig[playlistName]}`);
        return await response.json();
    };

    const addToPlaylist = async (playlistName) => {
        if (usedPlaylists.includes(playlistName)) {
            const message = await removeFromPlaylistBackendAPI(playlistName);
            if (message !== '') {
                const song = currentTrackRef.current.name;
                toast.error(`Did not remove ${song} from ${playlistName}: ${message}`, { position: "top-right", autoClose: 5000, hideProgressBar: true, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark" });
            } else {
                const newUsedPlaylists = usedPlaylists.filter(p => p !== playlistName);
                setUsedPlaylists(newUsedPlaylists);
            }
        } else {
            // have to copy the array to force a new reference so that child will rerender
            const newUsedPlaylists = [...usedPlaylists, playlistName];
            setUsedPlaylists(newUsedPlaylists);
            const message = await addToPlaylistBackendAPI(playlistName);
            if (message !== '') {
                const song = currentTrackRef.current.name;
                toast.error(`Did not add ${song} to ${playlistName}: ${message}`, { position: "top-right", autoClose: 5000, hideProgressBar: true, closeOnClick: true, pauseOnHover: true, draggable: true, progress: undefined, theme: "dark" });
            }
        }
    };

    return (
        <>
            {playlists.map((playlist) => {
                const isInPlaylist = usedPlaylists.includes(playlist);
                return (<button
                            onClick={() => addToPlaylist(playlist)}
                            key={playlist}
                            className={isInPlaylist ? "btn-disabled" : "btn-playlist"}
                        >
                            {playlist}
                        </button>);
            })}
        </>
    );
}

export default PlaylistTab;

