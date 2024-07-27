import React from 'react';
import ReactJson from 'react-json-view'
import {toast} from "react-toastify";

const PLAYLIST_NAMES = 'PLAYLIST_NAMES';
const PLAYLIST_STRUCTURE = 'PLAYLIST_STRUCTURE';

function JsonContainer(props) {
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

    const validateNames = async (data) => {
        console.log("validate names")
        if (!Array.isArray(data)) {
            return "Playlist names is not a valid list.";
        }
        for (const playlistName of data) {
            if (!(typeof playlistName === 'string')) {
                return `${playlistName} is not a valid string.`;
            }
        }

        if (new Set(data).size !== data.length) {
            return "Array has duplicates."
        }

        // todo: this should check entire list, not just new value
        const response = await fetch('/api/playlistConfig?playlistNames=' + JSON.stringify(data));
        const playlistConfig = await response.json();
        if (Object.keys(playlistConfig).length === 0) {
            return `List contains a playlist that could not be found.`
        }

        return '';
    }

    const validateStructure = (data) => {
        console.log("validate structure")
        if (!Array.isArray(data)) {
            return "Playlist structure is not a valid list."
        }

        for (const category of data) {
            const result = validateCategory(category)
            if (result) return result
        }
        return ''
    }

    const validateCategory = (category) => {
        if (!isValidObject(category)) {
            return "At least one category is not a valid object."
        }
        if (!("name" in category)) {
            return "At least one category does not have a valid name."
        }
        if (!("playlists" in category) || !Array.isArray(category.playlists)) {
            return "At least one category does not have a valid list of playlists."
        }

        for (const playlist of category.playlists) {
            if (!props.playlistConfig.includes(playlist)) {
                return `The playlist "${playlist}" was not found in playlist config.`
            }
        }
        return ''
    }

    const isValidObject = (obj) => {
        return typeof obj === 'object' &&
        !Array.isArray(obj) &&
            obj !== null
    }

    const onEdit = async (editData, jsonType) => {
        const newSrc = editData.updated_src;
        const invalidMessage = jsonType === PLAYLIST_NAMES ? await validateNames(newSrc) : validateStructure(newSrc)
        if (invalidMessage) {
            toastError(invalidMessage)
        } else {
            toastMessage(`Updated "${editData.existing_value}" to "${editData.new_value}"`)
            //TODO: UPDATE FILE AND STATE
            // FILE FOR PERMANANCE
            // STATE SO THAT THE REST OF THE LOADER WORKS, AND VALIDATING STRUCTURE AGAINST NEWLY UPDATED NAMES WORKS

        }

        return true;
    }

    const onAdd = (addData) => {
        // don't validate on adds because they are never a final operation
        console.log(addData)
        return true
    }

    const onDelete = (deleteData) => {
        toastMessage(`Removing "${deleteData.existing_value}"`)
        return true
    }

    return (
        <>
            <div className="json-blob">
            <ReactJson src={props.playlistConfig}
                       theme="brewer"
                       name={"Playlist Names"}
                       style={{'backgroundColor':'#282c34'}}
                       collapsed={true}
                       enableClipboard={false}
                       displayObjectSize={false}
                       displayDataTypes={false}
                       sortKeys={true}
                       onEdit={(data) => onEdit(data, PLAYLIST_NAMES)}
                       onAdd={onAdd}
                       onDelete={onDelete}
            />
            </div>
            <div className="json-blob">
            <ReactJson src={props.playlistStructure}
                       theme="brewer"
                       name={"Playlist Structure"}
                       style={{'backgroundColor':'#282c34'}}
                       collapsed={true}
                       enableClipboard={false}
                       displayObjectSize={false}
                       displayDataTypes={false}
                       sortKeys={true}
                       onEdit={(data) => onEdit(data, PLAYLIST_STRUCTURE)}
                       onAdd={onAdd}
                       onDelete={onDelete}
            />
            </div>
        </>

    );
}

export default JsonContainer;

