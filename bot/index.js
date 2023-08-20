const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const config = yaml.load(fs.readFileSync('./bot-token.yml', 'utf8'));;

const token = config.telegramBotToken;
const bot = new TelegramBot(token, {polling: true});


const userStates = {};

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `Hi, I am CalfoxBot!\n\nYou can ask me to /setup_wallet. \n\n If you have a wallet, you can /operate_wallet.`;
    
    bot.sendMessage(chatId, welcomeMessage);
  });
  
bot.onText(/\/setup_wallet/, (msg) => {
    const chatId = msg.chat.id;
    const setupMessage = `Let's get started with setting up your wallet!`;

    bot.sendMessage(chatId, setupMessage);
});

bot.onText(/\/operate_wallet/, (msg) => {
    const chatId = msg.chat.id;
    const setupMessage = `Let's play aroung with your wallet!`;

    userStates[chatId] = 'waiting_for_wallet_address'; // Set user's state

    bot.sendMessage(chatId, setupMessage);
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userState = userStates[chatId];
  
    if (userState === 'waiting_for_wallet_address') {
      const walletAddress = msg.text;
      // You can process the wallet address here, for example, save it or do further actions
      const replyMessage = `You entered the wallet address: ${walletAddress}`;
      
      bot.sendMessage(chatId, replyMessage);
      
      // Clear the user's state after processing the address
      delete userStates[chatId];
    }
  });