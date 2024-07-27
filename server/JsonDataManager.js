const fs = require('fs');

// this doesn't work because fs doesn't exist in react, and also since react runs in the browser it
// has no access to the file system. Move these functions to the backend (still not sure if fs will
// work in express)

// then render with https://www.npmjs.com/package/react-json-view
class JsonDataManager {
  static PLAYLIST_STRUCTURE = 'PLAYLIST_STRUCTURE';

  constructor(fileLocation, fileType) {
    this.fileLocation = fileLocation;
    this.fileType = fileType;

    console.log(`JsonDataManager created with file type: ${this.fileType}`);
  }

  get() {
    try {
      const jsonData = JSON.parse(fs.readFileSync(`${this.fileLocation}`, 'utf-8'));
      console.log(`Data loaded from ${this.fileLocation}: ${JSON.stringify(jsonData)}`);
      return jsonData;
    } catch (error) {
      console.error(`Error loading data from ${this.fileLocation}: ${error.message}`);
      throw error;
    }
  }

  save(jsonBlob) {
    try {
      fs.writeFileSync(`${this.fileLocation}`, JSON.stringify(jsonBlob, null, 2));
      console.log(`Data saved to ${this.fileLocation}`);
    } catch (error) {
      console.error(`Error saving data to ${this.fileLocation}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = JsonDataManager;
