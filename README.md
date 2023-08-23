# AttestMe Bot 

## Introduction 

Welcome to the AttestMe bot! Have you ever find it difficult to connect and refer acquaintances on social media? Have you gotten annoyed by the fake accounts and scams? Here is our solution: we crafted an on-chain attestatiion system for social media! 

AttestMe bot is currently launched on Telegram, which is fabulous in connecting people yet tough to verify accounts and connections. The functions are on-chain hosted by Base network to facilitate acquaintance-wide connection and referrals. You can attest the skills and interests of your friends and facilitate referrals of your friend of friend! Build your inter-person network on the go. 

## Product Design 

The bot's features break down as follows: 

1. You can connect your on-chain account to the bot by creating a new wallet on Base. We choose Base for its high stability and throughput. 
2. You can attest another friends' telegram account and chip in a referral for them to connect to your friends. Your friends can then use your attestation to prove their authenticity and efficiently connect! 
3. You can choose from a selection of additional attestation schemas to attest someone's skills, fan status, goals, etc. to help build a network map among your acquaintances. 
4. You can check attestations of a new connection to confirm credibility and avoid spam and fraud. 

## Project Structure 

1. `/logic` hosts all the functions interacting with the Base Goerli blockchain and with the EAS smart contracts 
2. `/logic/create_schema.js` uses the SDK to register a new schema and return the new schema ID 
3. `/logic/create_wallet.js` handles all the interactions to setup and connect wallet on Base
4. `/logic/create_attestation.js` takes in the schema and schema ID and encodes the attester's parameters to file attestation 
5. `/logic/verify_attestation.js` takes the UID of an attestation and validates its existence on-chain and returns the values stored in the attestation 
6. `bot.js` handles the logic with Telegram bot launcher 