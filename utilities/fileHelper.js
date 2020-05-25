const fs = require('fs');
const path = require('path');

const rootDir = require('./path');

exports.deleteFile = (filePath) => {

    fs.unlink(filePath, (err) => {
        if(err) {
            throw (err);
        }
    });
}

