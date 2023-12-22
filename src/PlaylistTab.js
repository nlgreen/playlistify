import React from 'react';
import { toast } from 'react-toastify';

function PlaylistTab(props) {
    const playlists = props.playlists;
    const usedPlaylists = props.usedPlaylists;
    const setUsedPlaylists = props.setUsedPlaylists;
    const currentTrackRef = props.currentTrackRef;
    const playlistConfig = props.playlistConfig

    const addToPlaylist = async (playlistName) => {
        // have to copy the array to force a new reference so that child will rerender
        const newUsedPlaylists = [...usedPlaylists];
        newUsedPlaylists.push(playlistName)
        setUsedPlaylists(newUsedPlaylists);
        const success = await addToPlaylistBackendAPI(playlistName);
        if (!success) {
            const song = currentTrackRef.current.name
            toast.error(`Did not add ${song} to ${playlistName} because it's already there!`, {
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
    };

    const addToPlaylistBackendAPI = async (playlistName) => {
        const response = await fetch(`/api/addToPlaylist?songId=${currentTrackRef.current.id}&playlistName=${playlistName}&playlistId=${playlistConfig[playlistName]}`);
        return await response.json();
    };

    return (
        <>
            {playlists.map((playlist) => {
                const isInPlaylist = usedPlaylists.includes(playlist);
                return (<button onClick={() => addToPlaylist(playlist)}
                                key={playlist}
                                className={isInPlaylist ? "btn-disabled" : "btn-playlist"}
                                disabled={isInPlaylist}>
                    {playlist}
                </button>)
            })}
        </>
    );
}

export default PlaylistTab;

