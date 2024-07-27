const fs = require('fs');

class JsonDataManager {
  static PLAYLIST_NAMES = 'PLAYLIST_NAMES';
  static PLAYLIST_STRUCTURE = 'PLAYLIST_STRUCTURE';

  constructor(playlistNamesFileLocation, playlistStructureFileLocation) {
    this.playlistNamesFileLocation = playlistNamesFileLocation;
    this.playlistStructureFileLocation = playlistStructureFileLocation;

    console.log(`JsonDataManager created with file type: ${this.playlistNamesFileLocation}`);
  }

  get(type) {
    const fileLocation = this.getFileLocation(type)
    try {
      const jsonData = JSON.parse(fs.readFileSync(`${fileLocation}`, 'utf-8'));
      console.log(`Data loaded from ${fileLocation}: ${JSON.stringify(jsonData)}`);
      return jsonData;
    } catch (error) {
      console.error(`Error loading data from ${fileLocation}: ${error.message}`);
      throw error;
    }
  }

  save(jsonBlob, type) {
    const fileLocation = this.getFileLocation(type)
    try {
      fs.writeFileSync(`${fileLocation}`, JSON.stringify(jsonBlob, null, 2));
      console.log(`Data saved to ${fileLocation}`);
    } catch (error) {
      console.error(`Error saving data to ${fileLocation}: ${error.message}`);
      throw error;
    }
  }

  getFileLocation(type) {
    return type === JsonDataManager.PLAYLIST_NAMES ?
        this.playlistNamesFileLocation :
        this.playlistStructureFileLocation
  }
}

module.exports = JsonDataManager;
