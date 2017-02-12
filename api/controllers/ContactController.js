/**
 * ContactController
 *
 * @description :: Server-side logic for managing services
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var mailGun = require('machinepack-mailgun');
module.exports = {

    saveMessage: function(req, res) {
        Contact.create(req.body).exec(function(err, createdContact) {
            if (err) return res.negotiate(err);

            Subject.findOne(createdContact.subject)
                .then(function(foundSubject) {
                    mailGun.sendHtmlEmail({
                        apiKey: 'key-e193ef20a9f08a1d0ab294472ed033e5',
                        domain: 'sandboxf00e04b0bccb489a9828c3482cc47511.mailgun.org',
                        toEmail: 'd.bola1@gmail.com',
                        toName: 'Bluebird Motors',
                        subject: foundSubject.name,
                        fromEmail: createdContact.email,
                        fromName: createdContact.name,
                        htmlMessage: createdContact.message
                    }).exec({
                        // An unexpected error occurred.
                        error: function(err) {

                        },
                        // OK.
                        success: function() {
                            console.log('done!');
                        }
                    });
                });

            return res.json({
                id: createdContact.id
            });
        });;
    }
};