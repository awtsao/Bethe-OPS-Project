var multer = require('multer');

/**
 * Stores uploads in the [destination] folder under the name stated in [filename].
 */
var Storage = multer.diskStorage({
    // store all poster files in ./public/images/posters
    destination: function(req, file, callback) {
        callback(null, './public/images/posters');
    },
    filename: function(req, file, callback) {
        callback(null, file.originalname);
    }
});

var upload = multer({
    storage: Storage
});

module.exports = upload;
