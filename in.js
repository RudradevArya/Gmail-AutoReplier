// const { google } = require('googleapis');
// const { OAuth2Client } = require('google-auth-library');
// const nodemailer = require('nodemailer');
// const fs = require('fs');
// const readline = require('readline');

// const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
// const TOKEN_PATH = 'token.json';

// // Your Gmail ID
// const userEmail = 'fringe.xb6783746@gmail.com';

// // Load client secrets from a file, and setup the Gmail API
// fs.readFile('credentials.json', (err, content) => {
//   if (err) return console.log('Error loading client secret file:', err);
//   authorize(JSON.parse(content), checkAndReplyToEmails);
// });

// function authorize(credentials, callback) {
//   const { client_secret, client_id, redirect_uris } = credentials.installed;
//   const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

//   // Check if we have previously stored a token.
//   fs.readFile(TOKEN_PATH, (err, token) => {
//     if (err) return getAccessToken(oAuth2Client, callback);
//     oAuth2Client.setCredentials(JSON.parse(token));
//     callback(oAuth2Client);
//   });
// }

// function getAccessToken(oAuth2Client, callback) {
//   const authUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: SCOPES,
//   });
//   console.log('Authorize this app by visiting this url:', authUrl);
//   const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
//   });
//   rl.question('Enter the code from that page here: ', (code) => {
//     rl.close();
//     oAuth2Client.getToken(code, (err, token) => {
//       if (err) return console.error('Error retrieving access token', err);
//       oAuth2Client.setCredentials(token);
//       // Store the token to disk for later program executions
//       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
//         if (err) console.error(err);
//         console.log('Token stored to', TOKEN_PATH);
//       });
//       callback(oAuth2Client);
//     });
//   });
// }

// function getEmailFromField(from) {
//   const matchResult = from && from.match(/<([^>]+)>/);
//   return matchResult ? matchResult[1] : from;
// }

// function getMessageDetails(auth, messageId, callback) {
//   const gmail = google.gmail({ version: 'v1', auth });

//   gmail.users.messages.get({
//     userId: userEmail,
//     id: messageId,
//   }, (err, res) => {
//     if (err) return console.error('Error retrieving message:', err);

//     const { headers } = res.data.payload;
//     const fromHeader = headers.find(header => header.name === 'From');
//     const senderEmail = fromHeader ? fromHeader.value : null;

//     console.log('Sender\'s Email:', senderEmail);
//     callback(senderEmail);
//   });
// }
// function checkAndReplyToEmails(auth) {
//     const gmail = google.gmail({ version: 'v1', auth });
  
//     gmail.users.messages.list({ userId: userEmail }, (err, res) => {
//       if (err) return console.error('The API returned an error:', err);
  
//       const messages = res.data.messages;
  
//       if (messages && messages.length > 0) {
//         messages.forEach((message) => {
//           // Check if the email property is defined
//           if (message && message.threadId) {
//             const email = message;
//             const threadId = email.threadId;
  
//             if (!email.labelIds || (!email.labelIds.includes('SENT') && !email.labelIds.includes('REPLIED'))) {
//               getMessageDetails(auth, message.id, (senderEmail) => {
//                 if (senderEmail) {
//                   const replyText = 'Thank you for your email!';
//                   const replyMessage = `From: ${userEmail}\nSubject: Re: ${email.subject}\n\n${replyText}`;
//                   sendEmail(userEmail, senderEmail, `Re: ${email.subject}`, replyMessage);
  
//                   const labelName = 'Replied';
//                   addLabel(gmail, userEmail, threadId, labelName);
//                 } else {
//                   console.error('Sender email is not defined.');
//                 }
//               });
//             }
//           }
//         });
//       }
//     });
  
//     const nextCheckDelay = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000;
//     setTimeout(() => checkAndReplyToEmails(auth), nextCheckDelay);
//   }
  

// function sendEmail(userEmail, senderEmail, subject, message) {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: userEmail,
//       pass: 'clvv lelc qbcc iwlp', // Use an 'app password' for security
//     },
//   });

//   const mailOptions = {
//     from: userEmail,
//     to: senderEmail,
//     subject,
//     text: message,
//   };

//   transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//       return console.error('Error sending email:', error);
//     }
//     console.log('Email sent:', info.response);
//   });
// }

// function addLabel(gmail, userEmail, threadId, labelName) {
//   gmail.users.labels.list({ userId: userEmail }, (err, res) => {
//     if (err) return console.error('Error listing labels:', err);

//     const labels = res.data.labels;
//     let labelId;

//     const existingLabel = labels.find((label) => label.name === labelName);

//     if (existingLabel) {
//       labelId = existingLabel.id;
//     } else {
//       const newLabel = { name: labelName, messageListVisibility: 'show', labelListVisibility: 'labelShow' };
//       gmail.users.labels.create({ userId: userEmail, resource: newLabel }, (err, res) => {
//         if (err) return console.error('Error creating label:', err);

//         labelId = res.data.id;
//       });
//     }

//     gmail.users.threads.modify({
//       userId: userEmail,
//       id: threadId,
//       resource: { addLabelIds: [labelId] },
//     });
//   });
// }



