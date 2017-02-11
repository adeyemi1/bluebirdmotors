/**
 * ContactController
 *
 * @description :: Server-side logic for managing services
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    saveMessage: function(req, res) {
        Contact.create(req.body).exec(function(err, createdContact) {
            if (err) return res.negotiate(err);

            return res.json({
                id: createdContact.id
            });
        });;
    }
};