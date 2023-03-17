const path = require('path');
const fs = require('fs');

// const __dirname = path.resolve();

class Common {

  constructor() {
  }

  static readSync(projectFilePath) {
    const finalFilename = projectFilePath.startsWith('./') ?
            __dirname + '/' + projectFilePath.substring(2) :
            projectFilePath;
    return fs.readFileSync(finalFilename, 'utf8');
  }

  static loadJsonResource(jsonProjectFilePath) {
    const fileContent = Common.readSync(jsonProjectFilePath);
    const result = JSON.parse(fileContent);
    // DEBUG // console.log(result);
    return result;
  }
}

module.exports = Common;