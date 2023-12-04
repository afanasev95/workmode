import mysql from 'mysql2'
import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import util from 'util'

const API_KEY_BOT = process.env.API_KEY_BOT;

const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

const REAL_PATH = process.env.REAL_PATH

const conn = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset : 'utf8mb4',
  port: DB_PORT
});
const query = util.promisify(conn.query).bind(conn);

const bot = new TelegramBot(API_KEY_BOT, {
    polling: false
});

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
while (true)
{
    await delay(3000);
    await f();
}

process.exit();

process.exit();

async function f()
{

    let spams = await query("SELECT * FROM `spam` WHERE `status` != 'end' ORDER BY `id` ASC");
    if(spams.length == 0) return;

    let botUsers = await query("SELECT * FROM `bot_users`");

    botUsers.push({'id':0, 'uid':botDataObj['channel']});

    if(botUsers.length == 0)
    {
        await query("UPDATE `spam` SET `status` = 'end'");
        return;
    }

    let lastBotUserId = botUsers[botUsers.length - 1]['id'];


    for(let spamKey in spams)
    {
        let spam = spams[spamKey];
        await query("UPDATE `spam` SET `status` = 'wait' WHERE `id` = ?", [spam['id']]);

        for(let botUserKey in botUsers)
        {
            let botUser = botUsers[botUserKey];

            if(lastBotUserId == botUser['id'] || lastBotUserId == 0) await query("UPDATE `spam` SET `status` = 'end' WHERE `id` = ?", [spam['id']]);

            try
            {
                await bot.copyMessage(botUser['uid'], spam['fromChatId'], spam['mId']);
            }
            catch(err)
            {
                console.log(err);
            }
        }
    }
}