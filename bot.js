const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const yaml = require('js-yaml');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('private_database.sqlite3'); // Connect to SQLite database


const config = yaml.load(fs.readFileSync('./bot-token.yml', 'utf8'));
const token = config.telegramBotToken;
const bot = new TelegramBot(token, { polling: true });

const userStates = {};
const userInputs = {};

const { createWallet } = require('./logic/create_wallet.js');
const { verifyAttestation } = require('./logic/verify_attestation.js');
const { createAttestation } = require('./logic/create_attestation.js');

// Initialize the SQLite database table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      telegramUserId INTEGER PRIMARY KEY,
      accountAddress TEXT,
      accountPrivateKey TEXT,
      attestations TEXT
    )
  `);
});

// Start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  let welcomeMessage = `You can call me to:\n/create_wallet\n/connect_wallet`;

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      welcomeMessage = `Welcome back! You can call me to:\n/create_wallet\n/connect_wallet\n/view_my_wallet\n/verify_my_friend\n/verify_attestation\n/append_attestation`;
    }
    bot.sendMessage(chatId, welcomeMessage);
  });
});

// Create Wallet
bot.onText(/\/create_wallet/, async (msg) => {
  const chatId = msg.chat.id;

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      const confirmationMessage = `You already have an account (${row.accountAddress}). Creating a new one will replace the old account. Do you want to proceed? (Yes/No)`;
      userStates[chatId] = 'confirm_new_account';

      bot.sendMessage(chatId, confirmationMessage);
    } else {
      const account = createWallet();

      db.run('INSERT INTO users (telegramUserId, accountAddress, accountPrivateKey, attestations) VALUES (?, ?, ?, ?)', [chatId, account.address, account.privateKey, "[]"], (err) => {
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

// View my wallet
bot.onText(/\/view_my_wallet/, async (msg) => {
  const chatId = msg.chat.id;

  db.get('SELECT accountAddress, attestations FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      const accountAddress = row.accountAddress;
      const attestations = JSON.parse(row.attestations); // Parse the attestations from JSON string to an array

      let message = `Your account address:\n${accountAddress}`;
      if (attestations.length > 0) {
        message += `\n\nYour attestations:\n`;
        for (let i = 0; i < attestations.length; i++) {
          message += `- ${attestations[i]}\n`;
        }
      } else {
        message += "\n\nYou don't have any attestations yet.";
      }

      bot.sendMessage(chatId, message);
    } else {
      bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /create_wallet to create one.");
    }
  });
});









// Verify My Friend
bot.onText(/\/verify_my_friend/, async (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Who do you want to create an attestation upon? (Type 'Carol')");

  userStates[chatId] = 'verify_friend';
});

// Handling user input for verifying a friend
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'verify_friend') {
    const friendName = msg.text.trim().toLowerCase();

    if (friendName === 'carol') {
      const markup = {
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Skills', callback_data: 'skills' }],
            [{ text: 'Referral', callback_data: 'referral' }],
            [{ text: 'Fans', callback_data: 'fans' }],
          ],
        },
      };

      bot.sendMessage(chatId, 'Choose the attestation type:', markup);

      userStates[chatId] = 'choose_schema';
    } else {
      bot.sendMessage(chatId, 'User does not exist.');
      delete userStates[chatId];
    }
  } else if (userState === 'choose_schema') {
    const schemaChosen = msg.data;

    if (['skills', 'referral', 'fans'].includes(schemaChosen)) {
      db.get('SELECT accountPrivateKey FROM users WHERE telegramUserId = ?', [chatId], async (err, row) => {
        if (row) {
          const userPrivateKey = await row.accountPrivateKey;

          try {
            const attestationResult = await createAttestation(schemaChosen, userPrivateKey);
            bot.sendMessage(chatId, attestationResult);
          } catch (error) {
            console.log("userPrivateKey");
            console.log(userPrivateKey);
            bot.sendMessage(chatId, 'Failed to create attestation.');
          }
        } else {
          bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /create_wallet to create one.");
        }
      });
    } else {
      bot.sendMessage(chatId, 'Invalid schema choice.');
    }

    delete userStates[chatId];
  }
});

// Handling callback queries from inline keyboard
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const schemaChosen = query.data;

  db.get('SELECT accountPrivateKey FROM users WHERE telegramUserId = ?', [chatId], async (err, row) => {
    if (row) {
      const userPrivateKey = row.accountPrivateKey;

      try {
        const attestationResult = await createAttestation(schemaChosen, userPrivateKey);
        db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
          if (row) {
            const currentAttestations = JSON.parse(row.attestations);
            currentAttestations.push(attestation);
      
            db.run('UPDATE users SET attestations = ? WHERE telegramUserId = ?', [JSON.stringify(currentAttestations), chatId], (updateErr) => {
              if (!updateErr) {
                bot.sendMessage(chatId, `New attestation "${attestationResult}" appended.`);
              } else {
                console.error('Error updating attestations:', updateErr);
              }
            });
          } 
        });
        bot.sendMessage(chatId, attestationResult);
      } catch (error) {
        console.log("userPrivateKey");
        console.log(userPrivateKey);
        console.log(error);
        bot.sendMessage(chatId, 'Failed to create attestation.');
      }
    } else {
      bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /create_wallet to create one.");
    }
  });
});

// Verify attestation
bot.onText(/\/verify_attestation/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Please enter a UID to verify:");
  userStates[chatId] = 'awaiting_uid_verification';
});

// Handle UID verification input
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'awaiting_uid_verification') {
    const uid = msg.text.trim();

    try {
      const attestation = await verifyAttestation(uid);
      bot.sendMessage(chatId, `Your attester is ${attestation.attester}, recipient is ${attestation.recipient}, and data is ${attestation.data}`);
    } catch (error) {
      bot.sendMessage(chatId, "An error occurred while verifying attestation.");
    }

    delete userStates[chatId];
  }
});

// Connect Wallet
bot.onText(/\/connect_wallet/, async (msg) => {
  const chatId = msg.chat.id;

  // Check if the user has a wallet
  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (!err && row) {
      // User already has a wallet
      const confirmationMessage = `You already have a wallet (${row.accountAddress}). Do you want to overwrite your wallet? (Yes/No)`;
      userStates[chatId] = 'confirm_overwrite_wallet';

      bot.sendMessage(chatId, confirmationMessage);
    } else {
      // User doesn't have a wallet
      bot.sendMessage(chatId, "You don't have a wallet yet. Please use /create_wallet to create one.");
    }
  });
});

// Handle wallet overwrite confirmation input
bot.onText(/Yes|No/i, async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'confirm_overwrite_wallet') {
    if (msg.text.toLowerCase() === 'yes') {
      bot.sendMessage(chatId, "Please enter the address of your new wallet:");
      userStates[chatId] = 'awaiting_wallet_address';
    } else {
      bot.sendMessage(chatId, "Cancelled. Your existing wallet remains unchanged.");
      delete userStates[chatId];
    }
  }
});

// Handle wallet address input
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'awaiting_wallet_address') {
    const newWalletAddress = msg.text.trim();
    userInputs[chatId] = { newWalletAddress };

    bot.sendMessage(chatId, "Please enter the private key of your new wallet:");
    userStates[chatId] = 'awaiting_private_key';
  } else if (userState === 'awaiting_private_key') {
    const newPrivateKey = msg.text.trim();
    const { newWalletAddress } = userInputs[chatId];

    // Update the user's record with new wallet details
    db.run('UPDATE users SET accountAddress = ?, accountPrivateKey = ? WHERE telegramUserId = ?', [newWalletAddress, newPrivateKey, chatId], (err) => {
      if (!err) {
        bot.sendMessage(chatId, "Your account is updated successfully.");
      } else {
        console.error('Error updating user:', err);
      }
    });

    delete userStates[chatId];
    delete userInputs[chatId];
  }
});

// Append Attestation
bot.onText(/\/append_attestation/, async (msg) => {
  const chatId = msg.chat.id;
  const attestation = 'abcabc'; // New attestation value

  db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
    if (row) {
      const currentAttestations = JSON.parse(row.attestations);
      currentAttestations.push(attestation);

      db.run('UPDATE users SET attestations = ? WHERE telegramUserId = ?', [JSON.stringify(currentAttestations), chatId], (updateErr) => {
        if (!updateErr) {
          bot.sendMessage(chatId, `New attestation "${attestation}" appended.`);
        } else {
          console.error('Error updating attestations:', updateErr);
        }
      });
    } else {
      bot.sendMessage(chatId, "You don't have a wallet address yet. Please use /create_wallet to create one.");
    }
  });
});
