const { exec } = require("child_process");
const { upload } = require('./mega');
const express = require('express');
let router = express.Router();
const pino = require("pino");
let { toBuffer } = require("qrcode");
const path = require('path');
const fs = require("fs-extra");
const { Boom } = require("@hapi/boom");

const MESSAGE = process.env.MESSAGE || `
╭━━━〔 *TOHID_MD SESSION* 〕━━━┈⊷
┃◈├•*SESSION GENERATED SUCCESSFULY* ✅
┃◈┃
┃◈├•*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
┃◈├•https://github.com/Tohidkhan6332/TOHID_MD
┃◈┃
┃◈├•*Tᴇʟᴇɢʀᴀᴍ Gʀᴏᴜᴘ* 🌟
┃◈├•https://t.me/Tohid_Tech
┃◈┃
┃◈├•*WʜᴀᴛsAᴘᴘ Gʀᴏᴜᴘ* 🌟
┃◈├•https://chat.whatsapp.com/IqRWSp7pXx8DIMtSgDICGu
┃◈┃
┃◈├•*WʜᴀᴛsAᴘᴘ ᴄʜᴇɴɴᴀʟ* 🌟
┃◈├•https://whatsapp.com/channel/0029VaGyP933bbVC7G0x0i2T
┃◈┃
┃◈┃*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🌟 
┃◈├•https://youtube.com/Tohidkhan_6332
┃◈┃
┃◈├•*ɢɪᴛʜᴜʙ* 🌟
┃◈├•http://GitHub.com/Tohidkhan6332
┃◈┃
┃◈├•*Wᴇʙsɪᴛᴇ* 🌟
┃◈├•https://tohid-khan-web.vercel.app/
┃◈┃
┃◈├•*TOHID_MD--WHATTSAPP-BOT* 🥀
┃◈╰──────────●●►
╰─────────────●●►
`;

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
};

router.get('/', async (req, res) => {
    const { default: SuhailWASocket, useMultiFileAuthState, Browsers, delay, DisconnectReason, makeInMemoryStore } = require("@whiskeysockets/baileys");
    const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys');

        try {
            let Smd = SuhailWASocket({ 
                printQRInTerminal: false,
                logger: pino({ level: "silent" }), 
                browser: Browsers.macOS("Desktop"),
                auth: state 
            });

            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect, qr } = s;

                if (qr && !res.headersSent) {
                    res.setHeader('Content-Type', 'image/png');
                    try {
                        const qrBuffer = await toBuffer(qr);
                        res.end(qrBuffer);
                        return;
                    } catch (error) {
                        console.error("Error generating QR Code buffer:", error);
                        return;
                    }
                }

                if (connection == "open") {
                    await delay(3000);
                    let user = Smd.user.id;

                    // ==== Updated Function ====
                    function randomMegaId(length = 6, numberLength = 4) {
                        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        let result = '';
                        for (let i = 0; i < length; i++) {
                            result += characters.charAt(Math.floor(Math.random() * characters.length));
                        }
                        const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                        return `Muqeet~${result}${number}`;
                    }

                    const auth_path = './auth_info_baileys/';
                    const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const Scan_Id = string_session;

                    console.log(`\n====================  SESSION ID  ==========================\nSESSION-ID ==> ${Scan_Id}\n-------------------   SESSION CLOSED   -----------------------\n`);

                    let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                    await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                    await delay(1000);
                    try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}
                }

                Smd.ev.on('creds.update', saveCreds);

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;

                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        SUHAIL().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                        process.exit(0);
                    }
                }
            });

        } catch (err) {
            console.log(err);
            exec('pm2 restart qasim');
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        }
    }

    SUHAIL().catch(async (err) => {
        console.log(err);
        await fs.emptyDirSync(__dirname + '/auth_info_baileys');
        exec('pm2 restart qasim');
    });

    return await SUHAIL();
});

module.exports = router;
