const Mailgun = require('mailgun-js');

const template = require('./template');
const keys = require('../config/keys');

const { key, domain } = keys.mailgun;

class MailgunService {
  init() {
    try {
      return new Mailgun({
        apiKey: key,
        domain: domain
      });
    } catch (error) {
      console.warn('Missing mailgun keys');
    }
  }
}

const mailgun = new MailgunService().init();

async function sendEmail(email, type, host, data) {
  try {
    const message = prepareTemplate(type, host, data);

    const config = {
      from: 'Ecommerce store! <ecommerce-store@gmail.com}>',
      to: email,
      subject: message.subject,
      text: message.text
    };
    return await mailgun.messages().send(config,(error,body) => {
      console.log(body);
    });
    
  } catch (error) {
    return error;
  }
};

const prepareTemplate = (type, host, data) => {
  let message;

  switch (type) {
    case 'reset':
      message = template.resetEmail(host, data);
      break;

    case 'reset-confirmation':
      message = template.confirmResetPasswordEmail();
      break;

    case 'signup':
      message = template.signupEmail(data);
      break;

    default:
      message = '';
  }

  return message;
};

module.exports = {
  sendEmail
}
