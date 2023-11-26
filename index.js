const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const nodemailer = require('nodemailer');
const fs = require('fs');
const readline = require('readline');

// Define Gmail API scopes
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];
const TOKEN_PATH = 'token.json';

// Load environment variables from the .env file
require('dotenv').config();

// Retrieve Gmail user and app password from environment variables
const userEmail = process.env.GMAIL_USER;
const appPassword = process.env.GMAIL_APP_PASSWORD;

// Load client secrets from a file and set up the Gmail API
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  authorize(JSON.parse(content), checkAndReplyToEmails);
});

// Function to authorize the Gmail API using OAuth2 credentials
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_uris[0]);

  // Check if a token is already stored
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

// Function to get OAuth2 access token
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);

      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });

      callback(oAuth2Client);
    });
  });
}

// Function to extract sender's email address from the 'From' field
function getEmailFromField(from) {
  // Check if the 'from' field is defined
  console.log('From:', from);
  const matchResult = from && from.match(/<([^>]+)>/);
  return matchResult ? matchResult[1] : from;
}

// Function to get details of a specific email message
function getMessageDetails(auth, messageId, callback) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.get({
    userId: userEmail,
    id: messageId,
  }, (err, res) => {
    if (err) return console.error('Error retrieving message:', err);

    const { headers } = res.data.payload;
    const fromHeader = headers.find(header => header.name === 'From');
    const senderEmail = fromHeader ? fromHeader.value : null;

    console.log('Sender\'s Email:', senderEmail);
    callback(senderEmail);
  });
}

// Function to check and reply to emails
function checkAndReplyToEmails(auth) {
  const gmail = google.gmail({ version: 'v1', auth });

  // Get the list of messages in the user's Gmail inbox
  gmail.users.messages.list({ userId: userEmail }, (err, res) => {
    if (err) return console.error('The API returned an error:', err);

    const messages = res.data.messages;

    if (messages && messages.length > 0) {
      messages.forEach((message) => {
        // Check if the email property is defined
        if (message && message.threadId) {
          const email = message;
          const threadId = email.threadId;

          // Check if the email has labels or is not marked as 'REPLIED'
          if (!email.labelIds || (!email.labelIds.includes('SENT') && !email.labelIds.includes('REPLIED'))) {
            // Get the sender's email address
            getMessageDetails(auth, message.id, (senderEmail) => {
              if (senderEmail) {
                const replyText = 'Thank you for your email!';
                const replyMessage = `From: ${userEmail}\n\n\n${replyText}`;

                // Send a reply email
                sendEmail(userEmail, senderEmail, `Re: ${email.subject}`, replyMessage);

                // Add the 'AutoReplied' label to the email thread
                const labelName = 'AutoReplied';
                addLabel(gmail, userEmail, threadId, labelName);
              } else {
                console.error('Sender email is not defined.');
              }
            });
          }
        }
      });
    }
  });

  // Schedule the next check in a random interval between 45 to 120 seconds
  const nextCheckDelay = Math.floor(Math.random() * (120 - 45 + 1) + 45) * 1000;
  setTimeout(() => checkAndReplyToEmails(auth), nextCheckDelay);
}

// Function to send an email
function sendEmail(userEmail, senderEmail, subject, message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: userEmail,
      pass: appPassword,
    },
  });

  const mailOptions = {
    from: userEmail,
    to: senderEmail,
    subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Email sent:', info.response);
  });
}

// Function to add a label to an email thread
function addLabel(gmail, userEmail, threadId, labelName) {
  // Get existing labels
  gmail.users.labels.list({ userId: userEmail }, (err, res) => {
    if (err) return console.error('Error listing labels:', err);

    const labels = res.data.labels;
    let labelId;

    // Check if the label already exists
    const existingLabel = labels.find((label) => label.name === labelName);

    if (existingLabel) {
      labelId = existingLabel.id;
    } else {
      // Create a new label
      const newLabel = { name: labelName, messageListVisibility: 'show', labelListVisibility: 'labelShow' };
      gmail.users.labels.create({ userId: userEmail, resource: newLabel }, (err, res) => {
        if (err) return console.error('Error creating label:', err);

        labelId = res.data.id;
      });
    }

    // Add the label to the email thread
    gmail.users.threads.modify({
      userId: userEmail,
      id: threadId,
      resource: { addLabelIds: [labelId] },
    });
  });
}
