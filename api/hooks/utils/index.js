'use strict';

/*
Utility methods
*/

const array = require('./lib/array'),
    datetime = require('./lib/datetime'),
    environment = require('./lib/environment'),
    // errorHandler = require('./lib/errorHandler'),
    filesystem = require('./lib/filesystem'),
    fileWatcher = require('./lib/fileWatcher'),
    fn = require('./lib/fn'),
    geo = require('./lib/geo'),
    image = require('./lib/image'),
    json = require('./lib/json'),
    model = require('./lib/model'),
    number = require('./lib/number'),
    object = require('./lib/object'),
    policy = require('./lib/policy'),
    postcode = require('./lib/postcode'),
    request = require('./lib/request'),
    string = require('./lib/string'),
    sql = require('./lib/sql'),
    template = require('./lib/template'),
    timing = require('./lib/timing'),
    value = require('./lib/value');


module.exports = function(sails) {
    return {
        array: array,
        datetime: datetime,
        environment: environment,
        // errorHandler: errorHandler,
        filesystem: filesystem,
        fileWatcher: fileWatcher,
        fn: fn,
        geo: geo,
        image: image,
        json: json,
        model: model,
        number: number,
        object: object,
        policy: policy,
        postcode: postcode,
        request: request,
        string: string,
        sql: sql,
        template: template,
        timing: timing,
        value: value
    };
};