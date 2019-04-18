/* eslint-disable @typescript-eslint/explicit-function-return-type */
import mailgunProvider from 'mailgun-js';

const apiKey = process.env.MAILGUN_API_KEY;
const domain = process.env.MAILGUN_DOMAIN;
const mailgun = mailgunProvider({apiKey: apiKey, domain: domain});

const sendmail = (options={type: 'info',subject: 'NVT Watcher', text: 'Empty message'}) => new Promise((res,rej) => {
    const {type, subject, text} = options;
    const data = {
        from: 'NVT Watcher <me@samples.mailgun.org>',
        to: process.env.MAILGUN_RECIPIENTS,
        subject,
        text
    };
    switch (type) {
        case 'info': {
            data.subject = `NVT Watcher [${type}]`;
            data.text = '';
            break;
        }
        case 'error': {
            data.subject = `NVT Watcher [${type}]`;
            data.text = '';
        }
    }
    mailgun.messages().send(data, function (error: any, body: any) {
        if (error) {
            console.error(error,JSON.stringify(options));
            rej(error);
        }
        res(body);
    });
});

export default sendmail;
