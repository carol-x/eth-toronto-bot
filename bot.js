const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const yaml = require('js-yaml');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('private_database.sqlite3'); // Connect to SQLite database
// const { createWallet } = require('./logic/create_wallet.js');
// const { verifyAttestation } = require('./logic/verify_attestation.js');
// const { myAttestation } = require('./logic/ether_setup.js');

const config = yaml.load(fs.readFileSync('./bot-token.yml', 'utf8'));
const token = config.telegramBotToken;
const bot = new TelegramBot(token, { polling: true });

const userStates = {};
const userInputs = {};

// // Initialize the SQLite database table
// db.serialize(() => {
//   db.run(`
//     CREATE TABLE IF NOT EXISTS users (
//       telegramUserId INTEGER PRIMARY KEY,
//       accountAddress TEXT,
//       myAttestationUID TEXT
//     )
//   `);
// });

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let welcomeMessage = `Hi, I am CalfoxBot! I have functions:\n/setup_wallet\n/my_wallet\n/verify_attestation\n/verify_my_friend\n\nYou can ask me to /setup_wallet.\n\nIf you believe you already have a wallet, \nplease contact our customer service.`;

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      welcomeMessage = `Welcome back! I have functions:\n/setup_wallet\n/my_wallet\n/verify_attestation\n/verify_my_friend\n\nYour existing account address: ${row.accountAddress}\n\nYou can choose to create a new account using /setup_wallet, but your existing account will be lost.\n\nYou can also use /my_wallet to view your wallet address.`;
    }
    bot.sendMessage(chatId, welcomeMessage);
  });
});


// bot.onText(/\/setup_wallet/, async (msg) => {
//   const chatId = msg.chat.id;

//   db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
//     if (row) {
//       const confirmationMessage = `You already have an account (${row.accountAddress}). Creating a new one will replace the old account. Do you want to proceed? (Yes/No)`;
//       userStates[chatId] = 'confirm_new_account';

//       bot.sendMessage(chatId, confirmationMessage);
//     } else {
//       const account = createWallet();

//       db.run('INSERT INTO users (telegramUserId, accountAddress) VALUES (?, ?)', [chatId, account.address], (err) => {
//         if (!err) {
//           const setupMessage = `Your account & wallet is successfully created!\n\nAccount address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
//           bot.sendMessage(chatId, setupMessage);
//         } else {
//           console.error('Error inserting user:', err);
//         }
//       });
//     }
//   });
// });

// bot.onText(/Yes|No/i, async (msg) => {
//   const chatId = msg.chat.id;
//   const userState = userStates[chatId];

//   if (userState === 'confirm_new_account') {
//     if (msg.text.toLowerCase() === 'yes') {
//       const account = createWallet();

//       db.run('UPDATE users SET accountAddress = ? WHERE telegramUserId = ?', [account.address, chatId], (err) => {
//         if (!err) {
//           const setupMessage = `Your account & wallet is successfully updated!\n\nNew account address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
//           bot.sendMessage(chatId, setupMessage);
//         } else {
//           console.error('Error updating user:', err);
//         }
//       });
//     } else {
//       bot.sendMessage(chatId, "Cancelled. Your existing account remains unchanged.");
//     }

//     delete userStates[chatId];
//   }
// });


// bot.onText(/\/my_wallet/, async (msg) => {
//   const chatId = msg.chat.id;

//   db.get('SELECT accountAddress FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
//     if (row && row.accountAddress) {
//       const walletAddress = row.accountAddress;
//       const walletMessage = `Your wallet address:\n${walletAddress}`;
//       bot.sendMessage(chatId, walletMessage);
//     } else {
//       bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /setup_wallet to create one.");
//     }
//   });
// });


// // Verify Attestation!!!
// bot.onText(/\/verify_attestation/, async (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(chatId, "Please provide the UID of the attestation you want to verify:");
//   userStates[chatId] = 'awaiting_attestation_uid';
// });


// // All replies
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const userState = userStates[chatId];

//   // Verify Attestation Real Logic
//   if (userState === 'awaiting_attestation_uid') {
//     const attestationUID = msg.text;
//     bot.sendMessage(chatId, `You provided the following attestation UID: ${attestationUID}`);
//     const attestation = await verifyAttestation(attestationUID);
//     bot.sendMessage("Your attester is %s, recipient is %s, and data is %s", attestation.attester, attestation.recipient, attestation.data);
//     delete userStates[chatId];
//   }
// });

// // Verify My Friend
// bot.onText(/\/verify_my_friend/, async (msg) => {
//   const chatId = msg.chat.id;

//   bot.sendMessage(chatId, "Please provide the following information:");
//   userStates[chatId] = 'awaiting_verify_my_friend_info';
// });

// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const userState = userStates[chatId];

//   if (userState === 'awaiting_verify_my_friend_info') {
//     const info = msg.text;

//     const infoParts = info.split(',');
//     if (infoParts.length !== 3) {
//       bot.sendMessage(chatId, "Invalid input. Please provide the values in the format: metIRL,value1,referReason,value2,target_addr,value3");
//       return;
//     }

//     const metIRL = infoParts[1];
//     const referReason = infoParts[3];
//     const target_addr = infoParts[5];

//     const verificationMessage = `You provided the following information:\nMet IRL: ${metIRL}\nRefer Reason: ${referReason}\nTarget Address: ${target_addr}`;
//     bot.sendMessage(chatId, verificationMessage);

//     delete userStates[chatId];
//   }
// });


// Verify My Friend
bot.onText(/\/verify_my_friend/, async (msg) => {
  const chatId = msg.chat.id;

  // Initialize userInputs for this chatId
  userInputs[chatId] = {};

  bot.sendMessage(chatId, "Please provide the value of metIRL:");
  userStates[chatId] = 'awaiting_metIRL';
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'awaiting_metIRL') {
    const metIRL = msg.text;
    bot.sendMessage(chatId, "Please provide the value of referReason:");
    userStates[chatId] = 'awaiting_referReason';
    userInputs[chatId].metIRL = metIRL;
  } else if (userState === 'awaiting_referReason') {
    const referReason = msg.text;
    bot.sendMessage(chatId, "Please provide the value of target_addr:");
    userStates[chatId] = 'awaiting_target_addr';
    userInputs[chatId].referReason = referReason;
  } else if (userState === 'awaiting_target_addr') {
    const target_addr = msg.text;

    const verificationMessage = `You provided the following information:\nMet IRL: ${userInputs[chatId].metIRL}\nRefer Reason: ${userInputs[chatId].referReason}\nTarget Address: ${target_addr}`;
    bot.sendMessage(chatId, verificationMessage);

    delete userStates[chatId];
    delete userInputs[chatId];
  }
});




