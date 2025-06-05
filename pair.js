const express = require('express');
const fs = require('fs-extra');
const { exec } = require("child_process");
let router = express.Router();
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const MESSAGE = process.env.MESSAGE || `
╭━━━〔 *MUQEET_MD SESSION* 〕━━━┈⊷
┃◈├•*SESSION GENERATED SUCCESSFULY* ✅
┃◈┃
┃◈├•*Gɪᴠᴇ ᴀ ꜱᴛᴀʀ ᴛᴏ ʀᴇᴘᴏ ꜰᴏʀ ᴄᴏᴜʀᴀɢᴇ* 🌟
┃◈├•https://github.com/muqeet908/MUQEET_MD
┃◈┃
┃◈├•*Tᴇʟᴇɢʀᴀᴍ Gʀᴏᴜᴘ* 🌟
┃◈├•https://t.me/Muqeet656
┃◈┃
┃◈├•*WʜᴀᴛsAᴘᴘ Gʀᴏᴜᴘ* 🌟
┃◈├•https://chat.whatsapp.com/Ewj28yRfkVnIUXZ29YRj5E
┃◈┃
┃◈├•*WʜᴀᴛsAᴘᴘ ᴄʜᴇɴɴᴀʟ* 🌟
┃◈├•https://whatsapp.com/channel/0029VbAqZNoDDmFSGN0sgx3L
┃◈┃
┃◈┃*Yᴏᴜ-ᴛᴜʙᴇ ᴛᴜᴛᴏʀɪᴀʟꜱ* 🌟 
┃◈├•Coming Soon 🔜 (Inshallah 💕)
┃◈┃
┃◈├•*ɢɪᴛʜᴜʙ* 🌟
┃◈├•http://GitHub.com/muqeet908
┃◈┃
┃◈├•*Wᴇʙsɪᴛᴇ* 🌟
┃◈├•ERROR ⚠️
┃◈┃
┃◈├•*MUQEET_MD--WHATTSAPP-BOT* 🥀
┃◈╰──────────●●►
╰━━━〔 *MUQEET_MD SESSION* 〕━━━┈⊷
______________________________

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

// Ensure the directory is empty when the app starts
if (fs.existsSync('./auth_info_baileys')) {
    fs.emptyDirSync(__dirname + '/auth_info_baileys');
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function SUHAIL() {
        const { state, saveCreds } = await useMultiFileAuthState(`./auth_info_baileys`);
        try {
            let Smd = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari"),
            });

            if (!Smd.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Smd.requestPairingCode(num);
                if (!res.headersSent) {
                    await res.send({ code });
                }
            }

            Smd.ev.on('creds.update', saveCreds);
            Smd.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    try {
                        await delay(10000);
                        if (fs.existsSync('./auth_info_baileys/creds.json'));

                        const auth_path = './auth_info_baileys/';
                        let user = Smd.user.id;

                        // Define randomMegaId function to generate random IDs
                        function randomMegaId(num = 22) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  
  for (let i = 2; i < num; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return `Muqeet~${result}`;
}

async function downloadCreds(sessionId) {  
  try {
    if (!sessionId.startsWith('Muqeet~')) {
      throw new Error('Invalid SESSION_ID: It must start with "Muqeet~"');
    }

                        // Upload credentials to Mega
                        const mega_url = await upload(fs.createReadStream(auth_path + 'creds.json'), `${randomMegaId()}.json`);
                        const Id_session = mega_url.replace('https://mega.nz/file/', '');

                        const Scan_Id = Id_session;

                        let msgsss = await Smd.sendMessage(user, { text: Scan_Id });
                        await Smd.sendMessage(user, { text: MESSAGE }, { quoted: msgsss });
                        await delay(1000);
                        try { await fs.emptyDirSync(__dirname + '/auth_info_baileys'); } catch (e) {}

                    } catch (e) {
                        console.log("Error during file upload or message send: ", e);
                    }

                    await delay(100);
                    await fs.emptyDirSync(__dirname + '/auth_info_baileys');
                }

                // Handle connection closures
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
                    }
                }
            });

        } catch (err) {
            console.log("Error in SUHAIL function: ", err);
            exec('pm2 restart qasim');
            console.log("Service restarted due to error");
            SUHAIL();
            await fs.emptyDirSync(__dirname + '/auth_info_baileys');
            if (!res.headersSent) {
                await res.send({ code: "Try After Few Minutes" });
            }
        }
    }

    await SUHAIL();
});

module.exports = router;
                    
