const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
const router = express.Router();
const pino = require("pino");
const { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

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
    const { default: makeWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");

    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
    const { state, saveCreds } = await useMultiFileAuthState('./auth_info_baileys');

    const socket = makeWASocket({
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: Browsers.macOS("Desktop"),
        auth: state
    });

    let qrSent = false;

    socket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        if (qr && !qrSent) {
            qrSent = true;
            try {
                const qrBuffer = await toBuffer(qr);
                res.setHeader('Content-Type', 'image/png');
                return res.end(qrBuffer);
            } catch (err) {
                console.error("Failed to generate QR code buffer:", err);
                return res.status(500).send("QR Code generation failed.");
            }
        }

        if (connection === "open") {
            await delay(3000);
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

            const sessionPath = './auth_info_baileys/creds.json';
            const sessionName = `${generateSessionId()}.json`;
            const sessionLink = await upload(fs.createReadStream(sessionPath), sessionName);
            const sessionId = sessionLink.replace('https://mega.nz/file/', '');

            console.log(`\n========== SESSION GENERATED ==========
SESSION-ID ==> ${sessionId}\n========================================\n`);

            const msg = await socket.sendMessage(user, { text: sessionId });
            await socket.sendMessage(user, { text: MESSAGE }, { quoted: msg });

            await delay(1000);
            try { fs.emptyDirSync('./auth_info_baileys'); } catch (e) {}
        }

        if (connection === "close") {
            const reasonCode = new Boom(lastDisconnect?.error)?.output?.statusCode;

            switch (reasonCode) {
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
                    console.log("Connection closed. Unknown reason:", reasonCode);
                    await delay(5000);
                    exec('pm2 restart qasim');
                    process.exit(0);
            }
        }
    });

    socket.ev.on("creds.update", saveCreds);
});

module.exports = router;
