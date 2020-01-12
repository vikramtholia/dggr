'use strict';

const mailer = require("nodemailer");

module.exports.sendEmail = async function(message, subject) {
    // Use Smtp Protocol to send Email
    const smtpTransport = mailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const mail = {
        from: process.env.GMAIL_FROM,
        to: process.env.GMAIL_TO,
        subject: subject || "✔ dggr has a message for you",
        // text: message
        html: message
    }

    try{ 
        const response = await smtpTransport.sendMail(mail);

        console.log(response);
    } catch(err){
        console.log(err);
    } finally{
        smtpTransport.close();
    }
}