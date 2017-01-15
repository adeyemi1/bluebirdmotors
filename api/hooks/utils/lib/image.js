'use strict';

/**
 * @class sails.hooks.utils.image
 *
 */
const sharp = require('sharp');

/**
 * Is the passed in extension recognised as being an image extension
 *
 * @param {String} extension The extension to check
 *
 * @return {Boolean} Is the passed extension a recognised image extension
 */
function isImageExtension(extension) {
    const imageExtensions = ['JPG', 'BMP', 'PNG', 'TIFF', 'GIF', 'JPEG', 'BPG', 'HEIF', 'WEBP', 'EXIF', 'JFIF'];
    extension = extension.replace('.', '').toUpperCase();
    return _.includes(imageExtensions, extension);
}

/**
 * Is the passed mime type an image mime type?
 *
 * @param {String} mimeType The mime type to check to see if it is an image mime-type
 *
 * @return {Boolean} Is the mimeType an image mimetype
 */
function isImageMimeType(mimeType) {
    return (mimeType || '').toUpperCase().startsWith('IMAGE/');
}

/**
 * Get base 64 image from an image path
 *
 * @param {String} path The image file path
 * @param {Number} maxWidth The max width to be set
 * @param {Number} maxHeight The max height to be set
 */
function getBase64Thumbnail(path, maxWidth, maxHeight) {
    return new sails.Promise(function(resolve, reject) {

        sharp(path)
            .resize(maxWidth || null, maxHeight || null)
            .min()
            .withoutEnlargement()
            .jpeg()
            .toBuffer(function(err, buffer, info) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(buffer.toString('base64'));
            });
    });
}


// Public functions
module.exports = {
    isImageExtension,
    isImageMimeType,
    getBase64Thumbnail
};