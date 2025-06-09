const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
const router = express.Router();
const pino = require("pino");
const fs = require("fs-extra");
const path = require('path');
const { Boom } = require("@hapi/boom");
const { default: makeWASocket, useMultiFileAuthState, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");

const MESSAGE = process.env.MESSAGE || `
╭━━━〔 *MUQEET_MD SESSION* 〕━━━┈⊷
┃◈├•*SESSION GENERATED SUCCESSFULLY* ✅
┃◈┃
┃◈├•*Give a star to the repo for support* 🌟
┃◈├•https://github.com/muqeet908/MUQEET_MD
┃◈┃
┃◈├•*Telegram Group* 🌟
┃◈├•https://t.me/Muqeet656
┃◈┃
┃◈├•*WhatsApp Group* 🌟
┃◈├•https://chat.whatsapp.com/Ewj28yRfkVnIUXZ29YRj5E
┃◈┃
┃◈├•*WhatsApp Channel* 🌟
┃◈├•https://whatsapp.com/channel/0029VbAqZNoDDmFSGN0sgx3L
┃◈┃
┃◈├•*YouTube Tutorials* 🌟 
┃◈├•Coming Soon 🔜 (Inshallah 💕)
┃◈┃
┃◈├•*GitHub* 🌟
┃◈├•http://GitHub.com/muqeet908
┃◈┃
┃◈├•*Website* 🌟
┃◈├•ERROR ⚠️
┃◈┃
┃◈├•*MUQEET_MD--WHATSAPP-BOT* 🥀
┃◈╰──────────●●►
╰━━━〔 *MUQEET_MD SESSION* 〕━━━┈⊷
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync('./auth_info_baileys');
}

router.get('/', async (req, res) => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');
        const { version } = await fetchLatestBaileysVersion();

        const socket = makeWASocket({
            version,
            auth: state,
            logger: pino({ level: 'silent' }),
            browser: Browsers.macOS("Safari"),
            printQRInTerminal: false
        });

        socket.ev.on("creds.update", saveCreds);

        socket.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, pairingCode } = update;

            if (pairingCode && !res.headersSent) {
                res.setHeader('Content-Type', 'text/plain');
                res.end(`🔑 Your WhatsApp Pairing Code: ${pairingCode}`);
                console.log(`
🔑 Pairing Code: ${pairingCode}
`);
            }

            if (connection === "open") {
                const user = socket.user.id;

                function generateSessionId(length = 6, numberLength = 4) {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    let result = '';
                    for (let i = 0; i < length; i++) {
                        result += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                    return `Muqeet~${result}${number}`;
                }

                const authFilePath = './auth_info_baileys/creds.json';
                const sessionFileName = `${generateSessionId()}.json`;
                const megaUrl = await upload(fs.createReadStream(authFilePath), sessionFileName);
                const sessionId = megaUrl.replace('https://mega.nz/file/', '');

                console.log(`\n✅ SESSION CREATED\nSession ID: ${sessionId}\n`);

                const msg = await socket.sendMessage(user, { text: sessionId });
                await socket.sendMessage(user, { text: MESSAGE }, { quoted: msg });

                await new Promise(res => setTimeout(res, 1000));
                try { fs.emptyDirSync('./auth_info_baileys'); } catch (e) {}
            }

            if (connection === "close") {
                const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;

                switch (reason) {
                    case DisconnectReason.connectionClosed:
                        console.log("Connection closed.");
                        break;
                    case DisconnectReason.connectionLost:
                        console.log("Connection lost.");
                        break;
                    case DisconnectReason.restartRequired:
                        console.log("Restart required. Restarting...");
                        return exec('pm2 restart qasim');
                    case DisconnectReason.timedOut:
                        console.log("Connection timed out.");
                        break;
                    default:
                        console.log("Unknown disconnect reason:", reason);
                        exec('pm2 restart qasim');
                        process.exit(0);
                }
            }
        });

        // Initiate pairing code generation if not registered
        if (!socket.authState.creds.registered) {
            const code = await socket.requestPairingCode('YOUR_PHONE_NUMBER@c.us');
            console.log(`📲 Pair this code in WhatsApp: ${code}`);
        }

    } catch (err) {
        console.error(err);
        exec('pm2 restart qasim');
        fs.emptyDirSync('./auth_info_baileys');
    }
});

module.exports = router;
