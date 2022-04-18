
function resetEmail(host, user){
    const message = {
      subject: 'Reset Password',
      text:
        `Hi ${user.firstName},\n\n`+
          `${'Forgot your password?\n'+
          'We receive a request to reset your password for your account.\n\n' +
          'To reset your password click on the following link, or paste this into your browser:\n' +
          'http://'}${host}/api/auth/reset/${user.resetPasswordToken}\n\n` +
        `If you did not make this request then please ignore this email.\n`
    };
  
    return message;
  };
  
  function confirmResetPasswordEmail() {
    const message = {
      subject: 'Password Changed',
      text:
        'You are receiving this email because you changed your password. \n\n' +
        'If you did not request this, please contact us immediately.'
    };
  
    return message;
  };
  
  function signupEmail(name){
    const message = {
      subject: 'Account Registration',
      text:
        `Hi ${name.firstName}!\n`+ 
        `Your account has been signed up sucessfully!\n` + 
        `Thank you for joining with us!. \n\n` +
        `If you did not request this, please contact us immediately.`
    };
  
    return message;
  }

  function merchantApplicationEmail(name){
    const message = {
      subject: 'Sell on MERN Store',
      text: `We received your request! Our team will contact you soon. \n\n`
    };

    return message;
  }
  module.exports = {
      resetEmail,
      confirmResetPasswordEmail,
      signupEmail,
      merchantApplicationEmail
  }