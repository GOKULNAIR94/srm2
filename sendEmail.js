module.exports = function() {
    const express = require('express');
    const bunyan = require('bunyan');
    const nodemailer = require('nodemailer');
    const restService = express();
    const bodyParser = require('body-parser');
    var fs = require('fs');
    console.log("Inside");
    // Create a SMTP transporter object
    let transporter = nodemailer.createTransport({
        service: 'Outlook365', // no need to set host or port etc.
        auth: {
            user: 'reachme@kaaman.onmicrosoft.com',
            pass: 'K@agar55wal'
        }
    });


    var to_email = "Gokul.Nair@lntinfotech.com";

    let message = {
        from: 'Hi <hi@haha.com>',
        // Comma separated list of recipients
        to: to_email,

        cc: "Gokul.Nair@lntinfotech.com",

        // Subject of the message
        subject: 'Adhoc Data push completion notification!', //

        // HTML body
        html: '<p><b>Hello,</b></p>' +
            '<p>Ho Ho Ho.</p>' +
            '<p>Thanks,<br><b>Viki</b></p>',

        // Apple Watch specific HTML body
        watchHtml: '<b>Hello</b> to myself'

    };

    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
        }
    });

    console.log('Sending Mail');
    setTimeout(function() {
        transporter.sendMail(message, (error, info) => {
            if (error) {
                console.log('Error occurred');
                console.log(error.message);
                return;
            }
            console.log('Message sent successfully!');
            console.log('Server responded with "%s"', info.response);
            transporter.close();
            return;
        });
    }, 4000);

}