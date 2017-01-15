'use strict';

/**
 * @class sails.hooks.utils.model
 *
 * Model utility methods.
 */

module.exports = (function() {


    /**
     * Get the name of the model that an association uses
     *
     * @param {Object} association The association
     *
     * @return {String} The model name that the association uses
     */
    const getAssociationModelName = function(association) {
            if (association.type === 'collection') {
                return association.collection;
            }
            return association.model;
        },

        /**
         * Should the passed attribute be populated with the passed in populate settings
         *
         * @param {String} attribute The attribute to determine if it needs populating
         * @param {String[]|String|Object} [populate=[]] An array of attributes that should be populated, only used if populateAll is false, can also be an object 
         *         where each property on the object is an attribute to populate and the value is how the populate should be queried (especially useful for collections)
         * @param {Boolean} [populateAll=false] If true all attributes except for those is dontPopulate should be populated
         * @param {String[]|String} [dontPopulate=[]] An array of attributes that should not be populate, only used if populateAll is true
         *
         * @return {Boolean} Should the attribute be populated
         */
        shouldPopulateAttribute = function(attribute, populate, populateAll, dontPopulate) {

            if (_.isObject(populate) && !_.isArray(populate)) {
                populate = _.keys(populate);
            } else {
                populate = sails.hooks.utils.array.toArray(populate);
            }
            dontPopulate = sails.hooks.utils.array.toArray(dontPopulate);

            if (_.isEmpty(populate) && populateAll === true) {
                return !_.contains(dontPopulate, attribute);
            }
            return _.contains(populate, attribute);
        },

        /**
         * From the passed in options determine if every association should be populated
         *
         * @param {Boolean} populateAll The populate all option, will populate all except for those in the dontPopulate array
         * @param {String[]} dontPopulate An array of association names not to populate
         * @param {String[]} populate An array of association names to populate, if these are specified then we infer that the user only wants to populate these
         * 
         * @return {Boolean} Should every single association be populated
         */
        shouldPopulateAll = function(populateAll, dontPopulate, populate) {
            return populateAll === true && _.isEmpty(dontPopulate) && _.isEmpty(populate);
        },

        /**
         * Apply populate options to the passed in query
         *
         * @param {Object} query The query to populate
         * @param {Object} model The model that the query is on
         * @param {String[]|String} [populate=[]] List of associations to populate if populateAll is false
         * @param {Boolean} [populateAll=false] Should all associations be populated (excluding those in dontPopulate)
         * @param {String[]|String} [dontPopulate=[]] The associations to not populate when populateAll is true
         *
         * @return {Object} The query after populate has been applied to the correct associations
         */
        populateQuery = function(query, model, populate, populateAll, dontPopulate) {
            if (_.isString(populate)) {
                populate = sails.hooks.utils.array.toArray(populate);
            }
            dontPopulate = sails.hooks.utils.array.toArray(dontPopulate);

            if (shouldPopulateAll(populateAll, dontPopulate, populate)) {
                return query.populateAll();
            }

            _.each(model.associations, association => {
                const associationName = association.alias;

                if (shouldPopulateAttribute(associationName, populate, populateAll, dontPopulate)) {
                    const populateArgs = [associationName];
                    if (populate[associationName]) {
                        populateArgs.push(populate[associationName]);
                    }

                    query = query.populate.apply(query, populateArgs);
                }
            });

            return query;
        },

        /**
         * Get attributes to populate on a model
         * 
         * @param {Object} model The model to get the attributes to populate on
         * @param {String[]|String} [populate=[]] List of associations to populate if populateAll is false
         * @param {Boolean} [populateAll=false] Should all associations be populated (excluding those in dontPopulate)
         * @param {String[]|String} [dontPopulate=[]] The associations to not populate when populateAll is true
         *
         * @return {String[]} An array of association alias' to populate
         */
        getAttributesToPopulate = function(model, populate, populateAll, dontPopulate) {
            populate = sails.hooks.utils.array.toArray(populate);
            dontPopulate = sails.hooks.utils.array.toArray(dontPopulate);

            const associationAliases = _.pluck(model.associations, 'alias');

            if (shouldPopulateAll(populateAll, dontPopulate, populate)) {
                return associationAliases;
            }

            return _.filter(associationAliases, alias => shouldPopulateAttribute(alias, populate, populateAll, dontPopulate));
        },

        /**
         * Remove any values from data that do not have corresponding fields on the model
         *
         * @param {Object} model The model that the data is for
         * @param {Object} data The data to clean
         
         */
        cleanInputData = function(model, data) {
            const modelAttributes = model._attributes;

            _.forIn(data, (value, key) => {
                const modelAttr = modelAttributes[key];
                if (typeof modelAttr === 'undefined') {
                    delete data[key];
                } else if (sails.migratingData) {
                    data[key] = formatMigrationData(value, modelAttr);
                }
            });

            return data;
        },

        /**
         * Format migration data based on the type of the model attribute
         *
         * @param {*} value The value of the attribute from migration
         * @param {Object} modelAttr The model attribute that the value is for
         * 
         * @return {*} The value formatted for use
         */
        formatMigrationData = function(value, modelAttr) {
            if (modelAttr.type === 'datetime') {
                value = formatMigrationDate(value);
            } else if (modelAttr.type === 'boolean') {
                value = formatMigrationBoolean(value);
            }
            return value;
        },

        /**
         * Format migration boolean, 1 or true (even as strings) should be 
         * returned as true
         * 
         * @param {*} The value to be turned into a boolean value
         *
         * @return {Boolean} The resulting boolean
         */
        formatMigrationBoolean = function(value) {
            return (value === '1' || value === 1 || value === 'true' || value === true);
        },

        /**
         * Format migration date, if the passed in values is falsy make sure it
         * is null
         * 
         * @param {*} value The value to be formatted
         *
         * @return {*} The formatted value
         */
        formatMigrationDate = function(value) {
            if (!value) {
                value = null;
            } else {
                value = sails.hooks.utils.datetime.formatSybaseDateTime(value);
            }
            return value;
        },

        /**
         * Remove models and collection (associations) from the passed in model data, replacing with ids where possible
         *
         * @param {Object} model The model that the data is for
         * @param {Object} data The data for the model
         *
         * @return {Object} The data object with the association data removed
         */
        removeAssociationsFromData = function(model, data) {
            const dataClone = _.clone(data);
            let associationValue;

            for (let association of model.associations) {

                if (!dataClone.hasOwnProperty(association.alias)) {
                    continue;
                }

                replaceAssociationObjectAndArraysWithIds(dataClone, association);

            }
            return dataClone;
        },

        /**
         * Remove object and arrays from a data object for the passed in association, replace
         * with ids where possible, otherwise remove the data
         *
         * @param {Object} data The data object that should contain a property for the passed in association
         * @param {Object} association The association on the model that we want to set as an id in the data
         */
        replaceAssociationObjectAndArraysWithIds = function(data, association) {
            const associationValue = data[association.alias];

            // If is a number or a string representation of a number then leave alone
            if (_.isNumber(associationValue) || !isNaN(parseInt(associationValue, 10))) {
                return;
            }

            if (_.isArray(associationValue)) {

                data[association.alias] = sails.hooks.utils.array.compactMap(associationValue, item => {
                    if (_.isNumber(item)) {
                        return item;
                    }
                    if (_.isEmpty(item)) {
                        return null;
                    }
                    return item.id;
                });

            } else if (_.isObject(associationValue) && _.isNumber(associationValue.id)) {
                data[association.alias] = associationValue.id;
            } else {
                delete data[association.alias];
            }
        },

        /**
         * Get model from the passed in request
         *
         * @param {Object} The request to get the model from
         *
         * @return {Object} The model for the request
         */
        getModelFromRequest = function(req) {
            const modelName = req.options.model || req.options.controller;
            return sails.models[modelName];
        },

        /**
         * Filter out inactive records from the query if the model has the 
         * required activation_date and expiry_date fields
         *
         * @param {Object} query The query to filter
         * @param {Object} model The model that the query is for
         *
         * @return {Object} query The filtered query
         */
        filterInactiveRecords = function(query, model) {
            //If the model has activation and expiry properties then filter out the expired records
            if (model.definition.activation_date && model.definition.expiry_date) {

                const currentTime = UtilsDateTimeService.getServerDateTime();

                query = query.where({
                    activation_date: {
                        '<=': currentTime
                    },
                    or: [{
                        expiry_date: {
                            '>': currentTime
                        }
                    }, {
                        expiry_date: null
                    }]
                });
            }

            return query;
        },

        /**
         * Apply sort to query 
         *
         * @param {Object} query The query to sort
         * @param {String|String[]} The fields to sort by, can be a single field, or an array of fields, will be sorted in the array order
         *
         * @return {Object} The query with sort applied
         */
        applySort = function(query, sort) {
            if (!_.isArray(sort)) {
                sort = [sort];
            }

            _.each(sort, (sortItem) => {
                query.sort(sortItem);
            });

            return query;
        },

        /**
         * Remove collection data from the data for a model
         *
         * @param {Object} model The model that the data belongs to
         * @param {Object} data The data to remove collections from
         *
         * @return {Object} The data with the collections removed
         */
        removeCollectionsFromData = function(model, data) {
            let result = _.clone(data);
            for (let association of model.associations) {
                if (association.type === 'collection') {
                    delete result[association.alias];
                }
            }
            return result;
        },


        /**
         * Get model object for the passed in model
         *
         * @param {String} modelName The modelName to get the model object for
         *
         * @return {Object} The model
         */
        getModel = function(modelName) {
            if (!modelName) {
                throw new sails.hooks.errors.SkError('API_MISSING_PARAM');
            }
            modelName = normaliseModelName(modelName);
            const model = sails.models[modelName];

            if (!model) {
                throw new sails.hooks.errors.SkError('API_BAD_REQUEST');
            }

            return model;
        },

        /**
         * Normalise the passed model name, by removing underscores and making the name lowercase
         *
         * @param {String} modelName The name of the model to normalise
         *
         * @return {String} The normalised model name, lowercase with underscores removed
         */
        normaliseModelName = function(modelName) {
            if (!_.isString(modelName)) {
                return null;
            } else {
                return sails.hooks.utils.string.removeUnderscores(modelName).toLowerCase();
            }
        },

        /**
         * When given a model and an array of string properties, return the properties that are actually on the model (excluding collection properties)
         *
         * @param {Object} model The model that the properties should be filtered to
         * @param {String[]} properties The list of properties that will
         *
         * @return {String[]} From the properties that were passed the ones that are on the model are returned
         */
        filterToPropertiesOnModel = function(model, properties) {

            const modelSchemaKeys = _.keys(model.schema),
                associationNames = _.pluck(model.associations, 'alias'),
                collectionAssociations = _.filter(model.associations, association => association.type === 'collection'),
                collectionAssociationNames = _.pluck(collectionAssociations, 'alias'),
                attributeNames = _.difference(modelSchemaKeys, collectionAssociationNames),
                propertiesArray = sails.hooks.utils.array.toArray(_.cloneDeep(properties));

            return sails.hooks.utils.array.compactMap(propertiesArray, (property) => getPropertyOnModel(model, property));
        },

        /**
         * From the passed model get the fields that need to be selected for the passed select and populate 
         * options (populated models need to be included in the select if there are any select fields)
         *
         * @param {Object} model The model that we are getting the fields to select on
         * @param {String[]} select The fields that we are selecting
         */
        getFieldsToSelect = function(model, select, populate, populateAll, dontPopulate) {
            const fieldsOnModel = filterToPropertiesOnModel(model, select);

            if (_.isEmpty(fieldsOnModel)) {
                return [];
            }

            const toPopulate = getAttributesToPopulate(model, populate, populateAll, dontPopulate),
                modelName = model.getModelName();

            return _.uniq(filterToPropertiesOnModel(model, fieldsOnModel.concat(toPopulate)));


        },

        /**
         * Get property if it is on the model, checks to see if the passed property is on the model, if it is return the property name
         * otherwise return null, can also specify property as {modelName}.{propertyName} if the model name does not match the passed model
         * then null will be returned 
         *
         * @param {Object} model The model that we want to check the property is on
         * @param {String} property The property on the model
         *
         * @return {String|null} The property name on the model or null if not found
         */
        getPropertyOnModel = function(model, property) {
            const splitProperty = property.split('.');

            if (splitProperty.length > 1) {
                if (splitProperty.length !== 2) {
                    return null;
                }

                const modelName = model.getModelName();
                if (normaliseModelName(_.first(splitProperty)) !== modelName) {
                    return null;
                }

                property = _.last(splitProperty);
            }

            return _.includes(_.keys(model.schema), property) ? property : null;
        };



    // Public Functions
    return {
        getAssociationModelName,
        shouldPopulateAttribute,
        populateQuery,
        cleanInputData,
        removeAssociationsFromData,
        getModelFromRequest,
        filterInactiveRecords,
        applySort,
        removeCollectionsFromData,
        getModel,
        normaliseModelName,
        filterToPropertiesOnModel,
        getFieldsToSelect,
        getPropertyOnModel
    };

}());