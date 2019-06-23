const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rhuynh2005@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the Task Manager app, ${name}.  Let me know how you get along with the app`,
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'rhuynh2005@gmail.com',
        subject: 'Sorry to see you go!',
        text: `Good buy, ${name}.  I hope to see you back sometime soon.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}



