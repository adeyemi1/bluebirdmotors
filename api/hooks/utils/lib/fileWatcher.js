'use strict';

/**
 * @class sails.hooks.utils.filewatcher
 *
 * Watch files for changes.
 */

var fileWatcher = require('file-watcher');

module.exports = {

    /**
     * Watch the specified directory and call the passed in function when a file changes
     *
     * @param {string} directory The directory to watch
     * @param {function} filter Function to filter out files not required to be watched
     * @param {function} fn The function to call when the file changes
     *
     */
    watchDirectory: function(directory, filter, fn) {
        var dirWatcher = new fileWatcher({
            root: directory,
            filter: filter
        });

        dirWatcher.on('any', fn);

        dirWatcher.watch();
    }
};