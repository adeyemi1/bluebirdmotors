'use strict';

/**
 * @class sails.hooks.utils.sql
 *
 * SQL methods
 */

var Promise = require('bluebird');

module.exports = {
    /**
     * Execute custom query on the System table
     *
     * @param {Object} query object
     * @param {Object} res object
     *
     * @return {Object} Promise, executeSQL.
     *
     */
    executeSQL: function(query) {
        return new Promise(function(resolve, reject) {
            System.query(query, function(err, result) {
                if (err) {
                    sails.hooks.log.error('executeSQL', 'Failed calling - ' + query, err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    /**
     * Create foreign key - don't call this unless on test database - causes issues with waterline, left in for posterity if we ever come back to it
     *
     *
     * @param {String} table to create foreign key on
     * @param {String} column to create foreign key on
     * @param {String} table that foreign key references
     * @param {String} column that foreign key references
     *
     * @return {Object} Promise, createForeignKey.
     *
     */
    createForeignKey: function(localTable, localColumn, referencedTable, referencedColumn) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var keyName = sails.hooks.utils.string.removeDoubleQuotes(localTable + '_' + localColumn + '_fkey'),
                referencedColumn = referencedColumn || 'id',
                sql = "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '" + keyName + "') THEN ALTER TABLE \"" + localTable + "\" ADD CONSTRAINT " + keyName + " FOREIGN KEY (" + localColumn + ") REFERENCES \"" + referencedTable + "\" (" + referencedColumn + "); END IF; END; $$;";

            sails.hooks.log.verbose('createForeignKey', sql);

            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                });
        });
    },

    /**
     * Set created_by and updated_by on the specified table
     *
     *
     * @param {String} table to create foreign key on
     *
     * @return {Object} Promise, setCreatedByUpdatedBy.
     *
     */
    setCreatedByUpdatedBy: function(table) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var legacyTable,
                sql;

            if (sails.hooks.utils.string.endsWith(table, '_legacy')) {
                sql = 'DO $$ begin if exists (select 1 from "' + table + '" where created_by = 1) then update "' + table + '" l set created_by = u.id from "user" u, "user_legacy" ul where l.user_create = ul.user_code and u.legacy = ul.id; update "' + table + '" l set updated_by = u.id from "user" u, "user_legacy" ul where l.user_modify = ul.user_code and u.legacy = ul.id; end if; end; $$;';
            } else {
                legacyTable = table + '_legacy';
                if (table === 'customer') {
                    sql = 'DO $$ begin if exists (select 1 from "' + table + '" where created_by = 1) then update "' + table + '" s set created_by = u.id, approved_by = u.id from "' + legacyTable + '" l, "user" u, "user_legacy" ul where s.legacy = l.id and l.user_create = ul.user_code and u.legacy = ul.id; update "' + table + '" s set updated_by = u.id from "' + legacyTable + '" l, "user" u, "user_legacy" ul where s.legacy = l.id and l.user_modify = ul.user_code and u.legacy = ul.id; end if; end; $$;';
                } else {
                    sql = 'DO $$ begin if exists (select 1 from "' + table + '" where created_by = 1) then update "' + table + '" s set created_by = u.id from "' + legacyTable + '" l, "user" u, "user_legacy" ul where s.legacy = l.id and l.user_create = ul.user_code and u.legacy = ul.id; update "' + table + '" s set updated_by = u.id from "' + legacyTable + '" l, "user" u, "user_legacy" ul where s.legacy = l.id and l.user_modify = ul.user_code and u.legacy = ul.id; end if; end; $$;';
                }
            }


            sails.hooks.log.verbose('setCreatedByUpdatedBy', sql);

            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                })
                .catch(function(err) {
                    sails.hooks.log.error('setCreatedByUpdatedBy', 'Error setting created_by, updated_by table ' + table + ' using sql :' + sql, err);
                    resolve(false);
                });
        });
    },

    /**
     * Check if the specified table name exists
     *
     *
     * @param {String} table to check if exists
     *
     * @return {Object} Promise, tableExists.
     *
     */
    getTableExists: function(table) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var sql;

            sql = "SELECT count(1) FROM pg_catalog.pg_class WHERE relname = '" + table + "' AND relkind = 'r'";

            sails.hooks.log.debug('tableExists', sql);

            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result > 0);
                }).catch(function(err) {
                    sails.hooks.log.error('getTableExists', 'Error checking if table ' + table + ' exists', err);
                    resolve(false);
                });
        });
    },

    /**
     * Check if the specified sequence table name exists
     *
     *
     * @param {String} table to check if exists
     *
     * @return {Object} Promise, tableExists.
     *
     */
    getSequenceTableExists: function(table) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            var sql;

            sql = "SELECT count(1) FROM pg_catalog.pg_class WHERE relname = '" + table + "' AND relkind = 'S'";

            sails.hooks.log.info('sequenceTableExists', sql);

            _this.executeSQL(sql)
                .then(function(result) {
                    if (result.rows[0].count == 1) {
                        sails.hooks.log.info('getSequenceTableExists', 'Sequence table - ' + table + ' exists');
                        resolve(true);
                    } else {
                        sails.hooks.log.info('getSequenceTableExists', 'Sequence table - ' + table + ' does NOT exist');
                        resolve(false);
                    }
                }).catch(function(err) {
                    sails.hooks.log.error('sequenceTableExists', 'Error checking if table ' + table + ' exists', err);
                    resolve(false);
                });
        });
    },

    /**
     * Alter sequence for postgres table
     *
     *
     * @param {String} table name
     * @param {String} name of sequence column
     *
     * @return {Object} Promise, sequence table altered.
     *
     */
    alterSequence: function(table, sequenceColumnName) {
        var _this = this;
        return new Promise(function(resolve, reject) {
            // Does model have a sequence table?

            if (sequenceColumnName === undefined) {
                sequenceColumnName = 'id';
            }

            var sequenceTable = table + '_' + sequenceColumnName + '_' + "seq";
            sails.hooks.log.info('alterSequence', 'Altering sequence table - ' + sequenceTable + ' for table ' + table);

            _this.getSequenceTableExists(sequenceTable)
                .then(function(exists) {
                    if (exists) {
                        // We have found sequence table, get max id from table
                        var maxSQL = 'SELECT max(id) FROM "' + table + '"';
                        sails.hooks.log.info('alterSequence', 'Retrieving max ID from table - ' + table + '.  SQL: ' + maxSQL);

                        _this.executeSQL(maxSQL)
                            .then(function(result) {
                                var maxID = result.rows[0].max;

                                if (maxID !== null) {
                                    maxID++;
                                    var alterSQL = 'ALTER SEQUENCE "' + sequenceTable + '" RESTART WITH ' + maxID + ';';

                                    _this.executeSQL(alterSQL)
                                        .then(function(result) {
                                            sails.hooks.log.info('alterSequence', 'Sequence altered for table ' + sequenceTable + ".  SQL: " + alterSQL);
                                            resolve(true);
                                        }).catch(function(err) {
                                            sails.hooks.log.error('alterSequence', 'Unable to alter sequence for table ' + sequenceTable + ".  SQL: " + alterSQL, err);
                                            resolve(false);
                                        });
                                } else {
                                    sails.hooks.log.error('alterSequence', 'Table - ' + table + ' does not contain any rows');
                                    resolve(false);
                                }
                            }).catch(function(err) {
                                sails.hooks.log.error('alterSequence', 'Error checking if max ID for table ' + table, err);
                                resolve(false);
                            });
                    }
                })
                .catch(function(err) {
                    sails.hooks.log.error('alterSequence', 'Error checking if table ' + sequenceTable + ' exists', err);
                    resolve(false);
                });
        });
    },

    /**
     * Update parent office on office
     *
     * @return {Object} Promise, office updated.
     *
     */
    setParentOffice: function() {
        var _this = this,
            sql = 'update office as o1 \
                set parent_office = o2.id \
                from office_legacy as l1,\
                office as o2, \
                office_legacy as l2 \
                where o1.legacy = l1.id \
                and l1.parent_office > 0 \
                and l1.parent_office = l2.office_ref \
                and l2.id = o2.legacy;';

        return new Promise(function(resolve, reject) {
            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
        });
    },

    /**
     * Set preferred_address on person
     *
     * @return {Object} Promise, resolves with the persons that were updated
     *
     */
    setPreferredAddress: function() {
        var _this = this,
            sql = 'update person as p \
                set preferred_address = a.id \
                from person_legacy pl, \
                address_legacy al, \
                address a, \
                address_persons__person_addresses ap \
                where pl.preferred_address_ref > 0 \
                and pl.preferred_address_ref = al.address_ref \
                and al.id = a.legacy \
                and a.id = ap.address_persons \
                and ap.person_addresses = p.id;';

        return new Promise(function(resolve, reject) {
            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
        });

    },

    /**
     * Set preferred_email on person
     *
     * @return {Object} Promise, resolves with the persons that were updated
     *
     */
    setPreferredEmail: function() {
        var _this = this,
            sql = 'update person as p \
                set preferred_email_address = ea.id \
                from person_legacy pl, \
                email_address_legacy eal, \
                email_address ea, \
                emailaddress_persons__person_email_addresses ep \
                where pl.preferred_email_ref > 0 \
                and pl.preferred_email_ref = eal.telephone_ref \
                and eal.id = ea.legacy \
                and ea.id = ep.emailaddress_persons \
                and ep.person_email_addresses = p.id;';

        return new Promise(function(resolve, reject) {
            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
        });

    },

    /**
     * Set preferred_phone on person
     *
     * @return {Object} Promise, resolves with the persons that were updated
     *
     */
    setPreferredPhone: function() {
        var _this = this,
            sql = 'update person as p \
                set preferred_phone = ph.id \
                from person_legacy pl, \
                phone_legacy phl, \
                phone ph, \
                person_phones__phone_persons pp \
                where pl.preferred_phone_ref > 0 \
                and pl.preferred_phone_ref = phl.telephone_ref \
                and phl.id = ph.legacy \
                and ph.id = pp.phone_persons \
                and pp.person_phones = p.id;';

        return new Promise(function(resolve, reject) {
            _this.executeSQL(sql)
                .then(function(result) {
                    resolve(result);
                }).catch(function(error) {
                    reject(error);
                });
        });
    }

};