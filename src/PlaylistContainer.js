import React from 'react';
import {Tab, TabList, TabPanel, Tabs} from "react-tabs";
import 'react-tabs/style/react-tabs.css';
import PlaylistTab from "./PlaylistTab";

function PlaylistContainer(props) {
    const playlistStructure = props.playlistStructure;
    const usedPlaylists = props.usedPlaylists;
    const setUsedPlaylists = props.setUsedPlaylists;
    const currentTrackRef = props.currentTrackRef;
    const playlistConfig = props.playlistConfig;

    return (
        <div className="main-wrapper">
            <div className="playlist-buttons">
                <Tabs>
                    <TabList>
                        {playlistStructure.map((playlistCategory) => (
                            <Tab key={playlistCategory.name}>{playlistCategory.name}</Tab>
                        ))}
                    </TabList>
                        {playlistStructure.map((playlistCategory) => (
                            <TabPanel key={playlistCategory.name + '-panel'}>
                                <PlaylistTab playlists={playlistCategory.playlists}
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

