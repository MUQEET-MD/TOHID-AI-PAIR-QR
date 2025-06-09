const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
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
┃◈╭─────────────●●►
┃◈├ ╔═╦═╗───╔══╗╔╗╔╗╔╗
┃◈├ ║║║║╠╦╦═╩╗╔╩╣╚╬╬╝║
┃◈├ ║║║║║╔╩══╣║╬║║║║╬║
┃◈├ ╚╩═╩╩╝───╚╩═╩╩╩╩═╝
┃◈╰─────────────●●►
╰─────────────●●►
______________________________
Use your Session ID Above to Deploy your Bot.
Check on YouTube Channel for Deployment 
Procedure(Ensure you have Github Account and Billed 
Heroku Account First.)
Don't Forget To Give Star⭐ To My Repo
╭────────────────────┈⊷
├━━━〔 *TOHID_MD SESSION* 〕━━━┈⊷
╰────────────────────┈⊷
`;

const { upload } = require('./mega');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} = require("@whiskeysockets/baileys");

if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function TOHID() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num + '@s.whatsapp.net');
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            sock.ev.on('creds.update', saveCreds);
            sock.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        const auth_path = './auth_info_baileys/';
                        let user = sock.user.id;

                        function randomMegaId(length = 6, numberLength = 4) {
                            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                            let result = '';
                            for (let i = 0; i < length; i++) {
                                result += characters.charAt(Math.floor(Math.random() * characters.length));
                            }
                            const number = Math.floor(Math.random() * Math.pow(10, numberLength));
                            return `${result}${number}`;
                        }

                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        const Scan_Id = `Muqeet~${Id_session}`;

                        let msgsss = await sock.sendMessage(user, { text: Scan_Id });
                        await sock.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                if (connection === "close") {
                    let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed!");
                    } else if (reason === DisconnectReason.connectionLost) {
                        console.log("Connection Lost from Server!");
                    } else if (reason === DisconnectReason.restartRequired) {
                        console.log("Restart Required, Restarting...");
                        TOHID().catch(err => console.log(err));
                    } else if (reason === DisconnectReason.timedOut) {
                        console.log("Connection TimedOut!");
                    } else {
                        console.log('Connection closed with bot. Please run again.');
                        console.log(reason);
                        await delay(5000);
                        exec('pm2 restart qasim');
                    }
                }
            });

        } catch (err) {
            console.log("Error in TOHID function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
            TOHID();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await TOHID();
});

module.exports = router;
