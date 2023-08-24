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

## Project Demo

The project demo is (here)[https://youtu.be/YvrJwQvfnKY]. Check it out and let us know feedbacks! 

Attestations on Base Goerli: 
- (Attest skills)[https://base-goerli.easscan.org/schema/view/0x1412c2e5a81110b9873daf1681de462199d92b8da1d7c4dd187775e0f1892943]
- (Attest referrals)[https://base-goerli.easscan.org/schema/view/0x2c0c0e26502d5551b274184bd0296653e7d87daf4dbe46a40be372127e713744]
- (Attest fans)[https://base-goerli.easscan.org/schema/view/0x6916bde9b639ba59e0aae0d39af6e25e751cebf3442e3c31fd11c82c128dba3f]
