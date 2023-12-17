import React from 'react';

function PlaylistTab(props) {
    const playlists = props.playlists;
    const usedPlaylists = props.usedPlaylists;
    const setUsedPlaylists = props.setUsedPlaylists;
    const currentTrackRef = props.currentTrackRef;
    const playlistConfig = props.playlistConfig

    const addToPlaylist = (playlistName) => {
        // have to copy the array to force a new reference so that child will rerender
        const newUsedPlaylists = [...usedPlaylists];
        newUsedPlaylists.push(playlistName)
        setUsedPlaylists(newUsedPlaylists);
        addToPlaylistBackendAPI(playlistName);
    };

    const addToPlaylistBackendAPI = (playlistName) => {
        fetch(`/api/addToPlaylist?songId=${currentTrackRef.current.id}&playlistName=${playlistName}&playlistId=${playlistConfig[playlistName]}`);
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

