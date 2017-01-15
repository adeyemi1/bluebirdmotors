'use strict';

/**
 * @class sails.hooks.utils.string
 *
 * String utility methods.
 *
 */

var Promise = require('bluebird'),
    stringSortConversion = undefined,
    stringSortConversionLength = 0;

module.exports = {


    /*
     * Return the pence value as pounds
     * @param {Number} value The value in pence
     */
    penceToPounds: function(value) {
        if (!value) {
            value = 0;
        }
        value = value.toString();
        var firstPart = value.substring(0, value.length - 2),
            secondPart = value.slice(-2);
        return "£" + firstPart + "." + secondPart;
    },

    /**
     * Return the left portion of a string
     * @param {String} str The string
     * @param {Number} n The number of characters
     * @return {String} The left n characters of the string
     */
    left: function(str, n) {

        if (n <= 0)
            return "";
        else if (n > String(str).length)
            return str;
        else
            return String(str).substring(0, n);
    },

    /**
     * Return the right portion of a string
     * @param {String} str The string
     * @param {Number} n The number of characters
     * @return {String} The right n characters of the string
     */
    right: function(str, n) {
        if (n <= 0)
            return "";
        else if (n > String(str).length)
            return str;
        else {
            var iLen = String(str).length;
            return String(str).substring(iLen, iLen - n);
        }
    },

    /**
     * Remove whitespace from the left and right of a string
     * @param {String} stringToTrim The string to trim
     * @return {String} The trimmed string
     */
    trim: function(stringToTrim) {
        if (stringToTrim) {
            return stringToTrim.replace(/^\s+|\s+$/g, "");
        } else {
            return stringToTrim;
        }
    },

    /**
     * Remove whitespace from the left of a string
     * @param {String} stringToTrim The string to trim
     * @return {String} The trimmed string
     */
    ltrim: function(stringToTrim) {
        return stringToTrim.replace(/^\s+/, "");
    },

    /**
     * Remove whitespace from the right of a string
     * @param {String} stringToTrim The string to trim
     * @return {String} The trimmed string
     */
    rtrim: function(stringToTrim) {
        return stringToTrim.replace(/\s+$/, "");
    },

    /**
     * Capitalise the first character of a string
     * @param {String} str The string
     * @return {String} String with the first character Capitalised
     */
    capFirstLetter: function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    /**
     * Return a random string of the specified length from the characters abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
     *
     * @param {int} stringLength The required random string length.
     * @return {string} The random string.
     *
     */
    randomString: function(length) {

        var characterList = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
            i = 0,
            randomString = '';

        while (i <= length - 1) {
            randomString += characterList[Math.round(Math.random() * (characterList.length - 1))];
            i++;
        }

        return randomString;
    },

    /**
     * Remove double quotes from the specified string
     *
     * @param {string} theString The string to remove double quotes from.
     * @return {string} The string with quotes removed.
     *
     */
    removeDoubleQuotes: function(string) {

        return string.replace(/"/g, '');
    },


    /**
     * @method parseLetter
     * Convert a string to a base 36 number and then to a base 10 number
     *
     * @param letter
     *
     */
    parseLetter: function(letter) {

        // Convert the letter from a string to a base 36 number
        letter = parseInt(letter, 36);
        // Convert the letter from a base 36 number to a base 10 number
        letter = parseInt(letter, 10);

        return letter;
    },

    /**
     * Check if a string ends with another string
     *
     * @param {string} searchIn The string to search in
     * @param {string} searchFor The string to search for
     *
     * @return {boolean} True if searchIn ends with searchFor.
     *
     */
    endsWith: function(searchIn, searchFor) {
        return searchIn.indexOf(searchFor, searchIn.length - searchFor.length) !== -1;
    },

    /**
     * Check if a string contains another string
     *
     * @param {string} searchIn The string to search in
     * @param {string} searchFor The string to search for
     *
     * @return {boolean} True if searchIn contains searchFor.
     *
     */
    contains: function(searchIn, searchFor) {
        return searchIn.indexOf(searchFor) > -1;
    },

    /**
     * Convert a string into a database sortable format
     *
     * @param {string} str String to convert
     *
     * @return {Object} Promise The converted string
     *
     */
    dbSortable: function(str) {
        var _this = this;
        return new Promise(function(resolve, fail) {
            if (!_this.stringSortConversion) {

                StringSortConversion.find()
                    .then(function callback(sortConversion) {

                        _this.stringSortConversion = sortConversion;

                        if (_this.stringSortConversion) {
                            _this.stringSortConversionLength = _this.stringSortConversion.length;
                        }

                        resolve(dbSortableConvert(str, _this.stringSortConversionLength, _this.stringSortConversion));
                    })
                    .catch(function(error) {
                        sails.hooks.log.error('dbSortable', 'Unable to retrieve StringSortConversion', error);
                    });
            } else {
                resolve(dbSortableConvert(str, _this.stringSortConversionLength, _this.stringSortConversion));
            }
        });
    },

    /**
     * Function removing all characters selected from the end of a string.
     * Finds last non selected character and removes everything from there on.
     * 
     * @param  {String}   string          The word to remove the characters from.
     * @param  {String[]} [characters]    Optional. Characters to be removed. If none passed, removes '.', ',' and '!'
     * @return {String}                   Returns the converted string
     */
    removeCharactersFromEnd: function(string, characters) {
        var charactersToRemove = [',', '.', '!'],
            index = string.length;

        if (!characters) {
            characters = charactersToRemove;
        }

        while (index-- && characters.indexOf(string[index]) > -1) {}
        return string.slice(0, index + 1);
    },

    /**
     * Function replacing a character at a given index
     * 
     * @param  {String}   string          The word to replace the character from.
     * @param  {Number}   index          The index of the character to replace
     * @param  {String} replacementCharacter    the character to update the old character to
     * @return {String}   string                Returns the newly updated string
     */
    replaceAtIndex: function(string, index, replacementCharacter) {
        string = string.substring(0, index) + (replacementCharacter || '') + string.substring(index + 1, string.length);

        return string;
    },

    /**
     * Function replacing all unwanted values from a string
     * @param  {String} string The string to convert
     * @param  {Boolean} trim to trim the string
     * @return {String} The string passed with all unwanted values removed
     */
    replaceAllInvalidStrings: function(string, trim) {
        string = (string || '').replace(/null|undefined|NaN|Name not available from migration/g, '');

        if (trim) {
            string = string.trim();
        }

        return string;
    },

    /**
     * change \n to \r
     *
     * @param {String} text The text to format
     *
     * @return {String} The text that has has its line feeds replacing with carriage returns
     */
    lineFeedToCarriageReturn: function(string) {
        return string.replace(/\n/g, '\r');
    },

    /**
     * Is the passed in character a valid letter of the alphabet
     *
     * @param {String} character The character to check if it is a letter
     *
     * @return {Boolean} Is the character a valid letter of the alphabet (between a and z)
     */
    isValidLetter: function(character) {
        var charCodeForA = 65,
            charCodeForZ = 90,
            charCode;

        if (character.length !== 1) {
            return false;
        }

        character = character.toUpperCase();
        charCode = character.charCodeAt();

        return charCode >= charCodeForA && charCode <= charCodeForZ;
    },

    /**
     * Get letter as number
     *
     * @param {String} letter The letter to get as a number
     * @param {Number} [startAt=0] The number to start at (so if startAt = 5, a === 5)
     *
     * @return {Number} The letter as a number
     */
    getLetterAsNumber: function(letter, startAt) {
        var charCodeForA = 65;

        letter = letter.toUpperCase();
        startAt = startAt || 0;

        return letter.charCodeAt() - charCodeForA + startAt;
    },

    /**
     * Function removing all whitespace from a string
     * @param  {String} string  The string to convert
     * @return {String} the string without whitespaces
     */
    removeWhitespace: function(string) {
        return string.replace(/ /g, '');
    },

    /**
     * Function removing all underscores from a string
     * @param  {String} string  The string to convert
     * @return {String} the string without underscores
     */
    removeUnderscores: function(string) {
        return string.replace(/_/g, '');
    },

    /**
     * Does the string contain any of these values 
     *
     * @param {String} string The string to check
     * @param {String[]} lookFor The strings to look for in the string to check
     *
     * @return {Boolean} Does the string contain any of the string in the lookFor array
     */
    containsAny: function(string, lookFor) {
        return !!_.find(lookFor, lookForItem => _.contains(string, lookForItem));
    },

    /**
     * Generate SHA-256 hash signature of a string
     *
     * @param {String} string to generate the hash for
     *
     * @return {Object} sails.Promise that resolves with a hash for the string
     */
    generateStringHash: function(unhashedString) {
        return new sails.Promise(function(resolve, reject) {
            try {
                const crypto = require('crypto'),
                    hashedString = crypto.createHash('sha256').update(unhashedString).digest('hex');
                resolve(hashedString);
            } catch (error) {
                reject(error);
            }
        });
    },

    /**
     * Count the occurences of a value in a string
     *
     * @param {String} string The string to look for the countValue in
     * @param {String} countValue The value to look for in the string
     * @param {Boolean} [caseSensitive=true] Is the count case-sensitive, default to true
     * 
     * @return {Number} The number of occurences of the countValue in the string 
     */
    countOccurences: function(string, countValue, caseSensitive) {
        if (caseSensitive === false) {
            countValue = countValue.toLowerCase();
            string = string.toLowerCase();
        }
        return (string.match(new RegExp(countValue, 'g')) || []).length;
    },

    /**
     * Replace all occurences within a string with another string value
     *
     * @param {String} string The string to replace the characters in
     * @param {String} replace The value to replace in the string
     * @param {String} replaceWith The value to use as the replacement
     *
     * @return {String} The updated string with the values replaced
     */
    replaceAll: function(string, replace, replaceWith) {
        return string.split(replace).join(replaceWith);
    },

    /**
     * Function extracting and returning the number from a string
     * 
     * @param  {String} string  The string to get the number from
     * @return {Number} the number found and returned
     */
    extractNumberFromString: function(string) {
        let numberString = string.match(/[\d\.\,]/g, '');
        if (_.isEmpty(numberString)) {
            return null;
        }
        numberString = numberString.join('');
        return parseFloat(numberString, 10);
    }
};

/**
 * Private function to process string sort conversion
 *
 * @param {string} str String to convert
 * @param {string} stringSortConversionLength Length of the conversion array
 * @param {string} stringSortConversion The conversion array
 *
 * @return {string} The converted string
 *
 */
function dbSortableConvert(str, stringSortConversionLength, stringSortConversion) {
    var i,
        j,
        character,
        converted = '';

    for (i = 0; i < str.length; i++) {
        character = str.charAt(i);

        for (j = 0; j < stringSortConversionLength; j++) {
            if (stringSortConversion[j].character === character) {
                character = stringSortConversion[j].conversion;
                break;
            }
        }
        converted += character;
    }

    return converted;
}