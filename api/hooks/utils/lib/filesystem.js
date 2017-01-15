'use strict';

/**
 * @class sails.hooks.utils.filesystem
 *
 * File utility methods.
 */

/**
 * Get file system module as promisified 
 *
 * @return {Object} The file system module with its functions promisified
 */
function getPromisifiedFs() {
    return sails.Promise.promisifyAll(require('fs'));
}

module.exports = {

    /**
     * Create a recursive directory structure with the specified path
     *
     * @param {String} path The path to create.
     *
     * @return {Object} sails.Promise That resolves with the path of the created directory
     */
    createDirectory: function(path) {
        return new sails.Promise(function(resolve, reject) {
            const mkdirp = require('mkdirp');

            sails.hooks.log.verbose('createDirectory', 'Creating directory - ' + path);

            mkdirp(path, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(path);
                }
            });
        });
    },

    /**
     * Read the specified directory contents synchronously
     *
     * @param {String} directory The directory to read.
     *
     * @return {Array} The file names within the directory
     */
    readDirectorySync: function(directory) {
        const fs = getPromisifiedFs();

        sails.hooks.log.verbose('read', 'Reading directory - ' + directory);
        return fs.readdirSync(directory);
    },

    /**
     * Read the specified file contents
     *
     * @param {String} filename The file to read.
     * @param {String} [encoding='utf8'] The file encoding
     *
     * @return {Object} sails.Promise that resolves with the file content
     */
    read: function(filename, encoding) {
        const fs = getPromisifiedFs();

        if (!encoding) {
            encoding = 'utf8';
        }

        sails.hooks.log.verbose('read', 'Reading file - ' + filename + ' as ' + encoding);

        return fs.readFileAsync(filename, encoding);
    },

    /**
     * Write the specified content into a file
     *
     * @param {String} filename The file to write to.
     * @param {String} content The content to write
     *
     * @return {Object} sails.Promise that resolves with the result of writing the file
     */
    write: function(filename, content) {
        const fs = getPromisifiedFs();

        sails.hooks.log.verbose('write', 'Writing to file - ' + filename);

        return fs.writeFileAsync(filename, content);

    },

    /**
     * Write content into multiple files
     *
     * @param {Object[]} fileArray Array of {filename: ?, content: ?}.
     *
     * @return {Object} sails.Promise that resolves with the an array of results
     */
    writeMultiple: function(fileArray) {
        var _this = this;

        return new sails.Promise(function(resolve, reject) {
            var allPromises = [];

            sails.hooks.log.verbose('writeMultiple', 'Writing to multiple files ...');

            _.each(fileArray, function(file, index) {
                allPromises.push(this.write(file.filename, file.content));
            }, _this);

            sails.Promise.all(allPromises).then(function(results) {
                resolve(results);
            }).catch(function(err) {
                sails.hooks.log.error('writeMultiple', 'Error creating files', err);
            });
        });
    },

    /**
     * List directories within the specified path
     *
     * @param {String} path Path to list directories from
     *
     * @return {Array} List of directories
     */
    getDirectories: function(path) {
        var fs = require('fs');
        return fs.readdirSync(path).filter(function(file) {
            return fs.statSync(path + '/' + file).isDirectory();
        });
    },

    /**
     * Check if the specified path exists
     *
     * @param {String} path The path to check for existence of a file
     *
     * @return {Boolean} Does a file exist at this path
     */
    exists: function(path) {
        const fs = require('fs');
        try {
            // Query the entry
            fs.lstatSync(path);
            return true;
        } catch (e) {
            return false;
        }
    },

    /**
     * Return object containing description of
     * the file or directory parts (path, ext, filename etc)
     *
     * @param {String} fileOrDir The file of directory path to get information on
     *
     * @return {Object} Information on the file or the directory
     */
    describeFileOrDirectory: function(fileOrDir) {
        const path = require('path'),
            fs = require('fs'),
            stats = fs.lstatSync(fileOrDir),
            parts = {
                is_file: false,
                filename_with_ext: '',
                filename_without_ext: '',
                file_ext: '',
                is_directory: false,
                directory: fileOrDir,
                full_path: fileOrDir,
                exists: this.exists(fileOrDir),
                size: stats.size || null
            };

        if (parts.exists) {
            parts.is_file = stats.isFile();
            parts.is_directory = stats.isDirectory();

            if (parts.is_file) {
                parts.file_ext = path.extname(fileOrDir);
                parts.filename_with_ext = path.basename(fileOrDir);
                parts.filename_without_ext = path.basename(fileOrDir, parts.file_ext);
                parts.directory = path.dirname(fileOrDir);
            }
        }

        return parts;
    },

    /**
     * Rename the specified file or directory
     *
     * @param {String} oldPath The old path to the file or directory that we are renaming
     * @param {String} newPath The new path for the file or directory
     *
     * @return {String} The new path
     */
    rename: function(oldPath, newPath) {
        const fs = require('fs');
        fs.renameSync(oldPath, newPath);
        return newPath;
    },

    /**
     * Generate SHA-256 hash signature of a file
     * 
     * @param {Object} file The file to generate the hash for
     *
     * @return {Object} sails.Promise that resolves with a hash for a file
     */
    generateFileHash: function(file) {
        const crypto = require('crypto'),
            fs = require('fs'),
            shasum = crypto.createHash('sha256'),
            s = fs.ReadStream(file);

        return new sails.Promise(function(resolve, reject) {

            s.on('data', function(d) {
                shasum.update(d);
            });

            s.on('end', function() {
                // End the hash with the current datetime
                shasum.update(UtilsDateTimeService.getServerDateTime().toString());

                resolve(shasum.digest('hex'));
            });

            s.on('error', function(error) {
                reject(error);
            });
        });
    },

    /**
     * Upload a file 
     *
     * @param {Object} fileUpload Multi-part file upload typically got from req.file(paramName)
     * @param {Object} options The upload options
     *
     * @return {Object} sails.Promise that resolves with the uploaded file
     */
    uploadFile: function(fileUpload, options) {
        return new sails.Promise(function(resolve, reject) {

            fileUpload.upload(options, function(err, files) {
                try {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (_.isEmpty(files)) {
                        throw new sails.hooks.errors.SystemError('NO_FILES_TO_UPLOAD');
                    }

                    _.each(files, file => {
                        if (file.size <= 0) {
                            throw new sails.hooks.errors.SystemError('EMPTY_FILE_SIZE');
                        }

                        if (_.isNumber(options.maxBytes) && file.size > options.maxBytes) {
                            throw new sails.hooks.errors.SystemError('MAX_FILE_SIZE_EXCEEDED');
                        }
                    });

                    resolve(files);

                } catch (err) {
                    reject(err);
                }
            });
        });
    },

    /**
     * Remove extension from the passed filename
     *
     * @param {String} filename
     *
     * @return {String} The filename with the extension removed
     */
    removeExtensionFromFileName: function(filename) {
        filename = filename || '';

        const extensionIndex = filename.lastIndexOf('.');

        if (extensionIndex !== -1) {
            filename = filename.substring(0, extensionIndex);
        }
        return filename;
    },

    /**
     * Function merging the pdfs with the filePaths passed into one pdf
     * 
     * @param  {String[]}   filePaths An array of file paths
     * @param  {String}     fileName  The name of the new file
     * @return {Object}     sails.Promise returning a new file system record
     */
    mergePdfs: function(filePaths, fileName, fileFormat) {
        return sails.Promise.coroutine(function*() {
            const pdfMerge = require('pdf-merge'),
                mergePdf = new pdfMerge(filePaths),
                mergedFile = yield mergePdf.asBuffer().promise();

            return sails.hooks.filesystem.createFile.writeFile(mergedFile, fileName, 'pdf', 'base64');
        })();
    }
}