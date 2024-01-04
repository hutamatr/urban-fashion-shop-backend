import nodemailer from 'nodemailer';

import { emailHost, pass, service, user } from './constants';

/**
 * The function `sendEmail` is an asynchronous function that sends an email using nodemailer.
 * @param {string} email - The `email` parameter is the email address of the recipient.
 * @param {string} subject - The subject parameter is a string that represents the subject of the
 * email. It is typically a brief summary or title that describes the content of the email.
 * @param {string} text - The `text` parameter is the body of the email message. It is the plain text
 * version of the email content that will be sent to the recipient.
 */
const sendEmail = async (email: string, subject: string, link: string) => {
  const transporter = nodemailer.createTransport({
    host: emailHost,
    service: service,
    port: 465,
    secure: true,
    auth: {
      user: user,
      pass: pass,
    },
  });

  await transporter.sendMail({
    from: user,
    to: email,
    subject: subject,
    html: `<h2>You requested for password reset</h2>
    <h4>Please click on<a href="${link}"> Here</a > to reset password!</h4>`,
  });
};

export default sendEmail;
