const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const yaml = require('js-yaml');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('private_database.sqlite3'); 
const { createWallet } = require('./logic/create_wallet.js');
const { attestUser } = require("./logic/my_attestation.js"); 

const config = yaml.load(fs.readFileSync('./bot-token.yml', 'utf8'));
const token = config.telegramBotToken;
const bot = new TelegramBot(token, { polling: true });

const userStates = {};

// Initialize the SQLite database table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramUserId INTEGER PRIMARY KEY,
      accountAddress TEXT
    )
  `);
});

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let welcomeMessage = `Hi, I am CalfoxBot!\n\nYou can ask me to /setup_wallet.\n\nIf you believe you already have a wallet, \nplease contact our customer service.`;

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      welcomeMessage = `Welcome back!\n\nYour existing account address: ${row.accountAddress}\n\nYou can choose to create a new account using /setup_wallet, but your existing account will be lost.\n\nYou can also use /my_wallet to view your wallet address.\n\nMore functions:\n1. /attest_my_friend\n2. /my_attestation`;
    }
    bot.sendMessage(chatId, welcomeMessage);
  });
});


bot.onText(/\/setup_wallet/, async (msg) => {
  const chatId = msg.chat.id;

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      const confirmationMessage = `You already have an account (${row.accountAddress}). Creating a new one will replace the old account. Do you want to proceed? (Yes/No)`;
      userStates[chatId] = 'confirm_new_account';

      bot.sendMessage(chatId, confirmationMessage);
    } else {
      // Now you can use the createWallet function
      const account = createWallet();

      db.run('INSERT INTO users (telegramUserId, accountAddress) VALUES (?, ?)', [chatId, account.address], (err) => {
        if (!err) {
          const setupMessage = `Your account & wallet is successfully created!\n\nAccount address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
          bot.sendMessage(chatId, setupMessage);
        } else {
          console.error('Error inserting user:', err);
        }
      });
    }
  });
});

bot.onText(/Yes|No/i, async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'confirm_new_account') {
    if (msg.text.toLowerCase() === 'yes') {
      const account = createWallet();

      db.run('UPDATE users SET accountAddress = ? WHERE telegramUserId = ?', [account.address, chatId], (err) => {
        if (!err) {
          const setupMessage = `Your account & wallet is successfully updated!\n\nNew account address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
          bot.sendMessage(chatId, setupMessage);
        } else {
          console.error('Error updating user:', err);
        }
      });
    } else {
      bot.sendMessage(chatId, "Cancelled. Your existing account remains unchanged.");
    }

    delete userStates[chatId];
  }
});

bot.onText(/\/my_wallet/, async (msg) => {
  const chatId = msg.chat.id;

  db.get('SELECT accountAddress FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row && row.accountAddress) {
      const walletAddress = row.accountAddress;
      const walletMessage = `Your wallet address:\n${walletAddress}`;
      bot.sendMessage(chatId, walletMessage);
    } else {
      bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /setup_wallet to create one.");
    }
  });
});

bot.onText(/\/my_attestation/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Please provide your mnemonic phrase:");
  userStates[chatId] = 'awaiting_mnemonic';
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'awaiting_mnemonic') {
    const mnemonicPhrase = msg.text;
    const attestationUID = await attestUser(mnemonicPhrase);

    bot.sendMessage(chatId, `Your attestation was successful!\nAttestation UID: ${attestationUID}`);
    delete userStates[chatId];
  }
});
