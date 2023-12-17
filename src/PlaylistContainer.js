import React from 'react';
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import 'react-tabs/style/react-tabs.css';
import PlaylistTab from "./PlaylistTab";

function PlaylistContainer(props) {
    const playlists = props.playlists;
    const usedPlaylists = props.usedPlaylists;
    const setUsedPlaylists = props.setUsedPlaylists;
    const currentTrackRef = props.currentTrackRef;
    const playlistConfig = props.playlistConfig;

    return (
        <div className="main-wrapper">
            <div className="playlist-buttons">
                <Tabs>
                    <TabList>
                        {playlists.map((playlist) => (
                            <Tab key={playlist.name}>{playlist.name}</Tab>
                        ))}
                    </TabList>
                        {playlists.map((playlist) => (
                            <TabPanel key={playlist.name + '-panel'}>
                                <PlaylistTab playlists={playlist.playlists}
                                             usedPlaylists={usedPlaylists}
                                             setUsedPlaylists={setUsedPlaylists}
                                             playlistConfig={playlistConfig}
                                             currentTrackRef={currentTrackRef} />
                            </TabPanel>
                        ))}
                </Tabs>
            </div>
        </div>
    );
}

export default PlaylistContainer;

