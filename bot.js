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

// const { createWallet } = require('./logic/create_wallet.js');
// const { verifyAttestation } = require('./logic/verify_attestation.js');
// const { verifyMyFriend } = require('./logic/verify_my_friend.js');

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
      welcomeMessage = `Welcome back! You can call me to:\n/create_wallet\n/connect_wallet\n/view_my_wallet\n/verify_my_friend\n/verify_attestation`;
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
      // TODO: Fred checkout
      // const account = createWallet();

      // db.run('INSERT INTO users (telegramUserId, accountAddress, accountPrivateKey, attestations) VALUES (?, ?, ?, ?)', [chatId, account.address, account.privateKey, "[]"], (err) => {
      //   if (!err) {
      //     const setupMessage = `Your account & wallet is successfully created!\n\nAccount address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
      //     bot.sendMessage(chatId, setupMessage);
      //   } else {
      //     console.error('Error inserting user:', err);
      //   }
      // });

      // test fred
      db.run('INSERT INTO users (telegramUserId, accountAddress, accountPrivateKey, attestations) VALUES (?, ?, ?, ?)', [chatId, "12321123", "1232123123", "[1, 2, 3, 4, 5]"], (err) => {
        if (!err) {
          const setupMessage = `Your account & wallet is successfully created!\n\nAccount address:\n${"12321123"}\n\nSeed phrase:\n${"1232123123"}\n\nPlease make sure you save this message to a secure place!`;
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

// Verify my friend
bot.onText(/\/verify_my_friend/, async (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Who do you want to verify?");
  userStates[chatId] = 'awaiting_friend_verification';
});

// Handle friend verification input
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userState = userStates[chatId];

  if (userState === 'awaiting_friend_verification') {
    const friendName = msg.text.trim();

    // Assuming "Fred" is the friend we're verifying
    if (friendName.toLowerCase() === 'fred') {
      const options = ['A', 'B', 'C'];
      const keyboard = options.map((option) => [{ text: option }]);
      const message = "Please choose a scheme (A, B, or C):";

      bot.sendMessage(chatId, message, {
        reply_markup: {
          keyboard: keyboard,
          resize_keyboard: true,
          one_time_keyboard: true,
        },
      });
      userStates[chatId] = 'awaiting_scheme_selection';
    } else {
      bot.sendMessage(chatId, "The user does not exist.");
      delete userStates[chatId];
    }
  } else if (userState === 'awaiting_scheme_selection') {
    const selectedScheme = msg.text.trim().toUpperCase();

    // Memorize the selected scheme
    userInputs[chatId] = {
      selectedScheme: selectedScheme,
    };

    bot.sendMessage(chatId, `You selected scheme ${selectedScheme}. Do you want to use the default value? (Yes/No)`);
    userStates[chatId] = 'awaiting_default_value_decision';
  } else if (userState === 'awaiting_default_value_decision') {
    const decision = msg.text.trim().toLowerCase();

    if (decision === 'yes') {
      const selectedScheme = userInputs[chatId].selectedScheme;

      // Reply with the selected scheme and the decision
      // TODO: Fred here
      bot.sendMessage(chatId, `You selected scheme ${selectedScheme}. You have chosen to use the default value.`);
    } else if (decision === 'no') {
      bot.sendMessage(chatId, "You chose not to use the default value.");
    } else {
      bot.sendMessage(chatId, "Invalid choice. Please reply with 'Yes' or 'No'.");
    }

    delete userStates[chatId];
    delete userInputs[chatId];
  }
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
      // TODO: Fred
      const result = await hello0011001(uid); // Replace with your actual function call
      
      if (result === true) {
        bot.sendMessage(chatId, "Attestation verification successful!");
      } else {
        bot.sendMessage(chatId, "Attestation verification failed.");
      }
    } catch (error) {
      bot.sendMessage(chatId, "An error occurred while verifying attestation.");
    }

    delete userStates[chatId];
  }
});

async function hello0011001(uid) {
  return true;
}

// // Connect Wallet
// bot.onText(/\/connect_wallet/, async (msg) => {
//   const chatId = msg.chat.id;

//   db.get('SELECT * FROM users WHERE telegramUserId = ?', [chatId], (err, row) => {
//     if (row) {
//       const confirmationMessage = `You already have an account (${row.accountAddress}). Creating a new one will replace the old account. Do you want to proceed? (Yes/No)`;
//       userStates[chatId] = 'confirm_new_account';

//       bot.sendMessage(chatId, confirmationMessage);
//     } else {
//       // TODO: Fred checkout
//       // const account = createWallet();

//       // db.run('INSERT INTO users (telegramUserId, accountAddress, accountPrivateKey, attestations) VALUES (?, ?, ?, ?)', [chatId, account.address, account.privateKey, "[]"], (err) => {
//       //   if (!err) {
//       //     const setupMessage = `Your account & wallet is successfully created!\n\nAccount address:\n${account.address}\n\nSeed phrase:\n${account.mnemonic.phrase}\n\nPlease make sure you save this message to a secure place!`;
//       //     bot.sendMessage(chatId, setupMessage);
//       //   } else {
//       //     console.error('Error inserting user:', err);
//       //   }
//       // });

//       // test fred
//       db.run('INSERT INTO users (telegramUserId, accountAddress, accountPrivateKey, attestations) VALUES (?, ?, ?, ?)', [chatId, "12321123", "1232123123", "[]"], (err) => {
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
