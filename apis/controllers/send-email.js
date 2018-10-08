const sg = require('@sendgrid/mail');
const ejs = require('ejs');
const EmailSchema = require('../../schema/email-schema');
const Config = require('../../config/index');

const EmailAccessKey = require('../../Templates/email-accessKey');

const EJSMapping = {
  'email-accessKey.ejs': EmailAccessKey,
};
const getEJSTemplate = ({ fileName }) => new Promise(resolve => {
  const content = EJSMapping[fileName];
  resolve(
    ejs.compile(content, {
      cache: true,
      filename: fileName,
    })
  );
});

/*
    from: {email: "jason@blockcluster.io", name: "Jason from Blockcluster"},
    to: email,
    subject: `Confirm ${user.emails[0].address} on blockcluster.io`,
    text: `Visit the following link to verify your email address. ${link}`,
    html: finalHTML
  */
const sendEmail = async emailOptions => {
  sg.setApiKey(Config.sendgridAPIKey);
  await sg.send(emailOptions);
  const savable = new EmailSchema(emailOptions);
  savable.save();
  return true;
};

const processAndSend = async (email, name, subject, text, file, key) => {
  const ejsTemplate = await getEJSTemplate({ fileName: file });
  const finalHTML = ejsTemplate({
    user: {
      email,
      name,
    },
    accessKey: key,
  });
  const emailProps = {
    from: { email: 'no-reply@blockcluster.io', name: 'Blockcluster' },
    to: email,
    subject: `${subject} | BlockCluster`,
    text,
    html: finalHTML,
  };
  const res = await sendEmail(emailProps);
  return res;
};
module.exports = {
  processAndSend,
};
