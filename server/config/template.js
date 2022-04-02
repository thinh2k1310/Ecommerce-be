
function resetEmail(req,username,resetToken){
    const message = {
      subject: 'Reset Password',
      text:
        `Hi ${username},\n\n`+
          `${'Forgot your password?\n'+
          'We receive a request to reset your password for your account.\n\n' +
          'To reset your password click on the following link, or paste this into your browser:\n' +
          'http://'}${req.headers.host}/api/reset/${resetToken}\n\n` +
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

  module.exports = {
      resetEmail,
      confirmResetPasswordEmail
  }