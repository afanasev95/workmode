import mysql from 'mysql2'
import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import util from 'util'

import { botDataObj } from './../class/botData.mjs'
let BOTS_CONFIGS = botDataObj

import botFuncsAll from './../class/botFuncs.mjs'
let botFuncs = new botFuncsAll()

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
    polling: {
        interval: 100,
        autoStart: true
    }
});


let i = 0;
function check()
{
    i++;
    console.log(i);
    setTimeout(async function ()
    {
        let parsed_ads = await query("SELECT * FROM `parsed_ads` WHERE `sendTime` = 0 AND `status` = 'tosend' ORDER BY `id` ASC");
        if(parsed_ads.length > 0)
        {
            let parsed_ad;
            let parsed_ad_arr = {};
            for(let key in parsed_ads)
            {
                parsed_ad = parsed_ads[key];

                if(parsed_ad_arr[parsed_ad['searchId']] == undefined) parsed_ad_arr[parsed_ad['searchId']] = [];
                parsed_ad_arr[parsed_ad['searchId']].push(parsed_ad);
            }
            
            for(let key in parsed_ad_arr)
            {
                parsed_ads = parsed_ad_arr[key];

                let csvData = "Ссылка на объявление,Название,Цена,Продавец,Местоположение,Дата публикации";

                for(let parsed_adsKey in parsed_ads)
                {
                    parsed_ad = parsed_ads[parsed_adsKey];
                    let adObj = botFuncs.decodeToDb(parsed_ad['adObj']);

                    let sendText = "🪧 Название: `"+ adObj['title'] +"`";
                    sendText += "\n💰 Цена: `"+ adObj['price']['amount'] +" "+ adObj['price']['currency_code'] +"`";
                    sendText += "\n📍 Адрес: `"+ adObj['city'] +", "+ adObj['country'] +"`";
                    sendText += "\n🗒 Описание: *"+ adObj['description'] +"*";

                    sendText += "\n\n👤 Продавец: ";

                    let sellerRating = "?";
                    if(adObj['user']['feedback_reputation'] !== undefined) sellerRating = ((adObj['user']['feedback_reputation'] * 10) / 2).toFixed(1);
                    let photoLink = parsed_ad['adLink'];
                    if(adObj['photos'] !== undefined && adObj['photos'].length > 0) photoLink = adObj['photos'][0]['url'];

                    let createData = botFuncs.botDateFromTime(botFuncs.strtotime(adObj['created_at_ts']) + BOTS_CONFIGS['domains_info'][parsed_ad['domain']]['time_zone_plus']);
                    sendText += "\n\n📅 Дата публикации: *"+ createData +"*";
                    sendText += "\n📦 Кол-во объявлений: *"+ adObj['user']['item_count'] +"*";
                    sendText += "\n⭐ Рейтинг продавца: *"+ sellerRating +"*";

                    sendText += "\n\n🔗 [Ссылка на объявление]("+ parsed_ad['adLink'] +")";
                    sendText += "\n🔗 [Ссылка на фото]("+ photoLink +")";

                    let botViewsCount = "Нет";
                    let exstBotViews = await query("SELECT COUNT(*) as count FROM `parsed_ads` WHERE `adId` = ? AND `domain` = ? AND `sendTime` > 0", [parsed_ad['adId'], parsed_ad['domain']]);
                    console.log(exstBotViews);
                    if(exstBotViews.length > 0 && exstBotViews[0]['count'] > 0) botViewsCount = exstBotViews[0]['count'];
                    sendText += "\n\n🔎 *"+ botViewsCount +" просмотров от "+ BOTS_CONFIGS['BOT_NAME'] +"*";

                    await query("UPDATE `parsed_ads` SET `sendTime` = ?, `status` = 'sended' WHERE `id` = ?", [botFuncs.time(), parsed_ad['id']]);

                    console.log('send MSG');
                    await bot.sendPhoto(parsed_ad['uid'], photoLink, {caption: sendText, parse_mode:"markdown", disable_web_page_preview: true});
                    console.log('sended MSG');

                    csvData += "\n"+ parsed_ad['adLink'] +","+ adObj['title'] +","+ adObj['price']['amount'] +" "+ adObj['price']['currency_code'] +",,"+ adObj['city'] +"," + createData;
                }

                let csvFile = REAL_PATH + "temp_files/parsing" + parsed_ad['uid'] + "_" + parsed_ad['searchId'] + ".csv";
                await botFuncs.writeFile(csvFile, csvData);

                console.log('send CSV');
                await bot.sendDocument(parsed_ad['uid'], csvFile);
                console.log('sended CSV');

                botFuncs.delFile(csvFile);
            }
        }
        else console.log("Wait link");

        console.log('check');
        check();
    }
    , 2000);
}
check();




// f();

async function f()
{
    let parsed_ads = await query("SELECT * FROM `parsed_ads` WHERE `sendTime` = 0 ORDER BY `id` ASC");
    console.log(parsed_ads);
    if(parsed_ads.length == 0) process.exit();

    let botUsers = await query("SELECT * FROM `bot_users`");
    console.log(botUsers);

    botUsers.push({'id':0, 'uid':botDataObj['channel']});

    if(botUsers.length == 0)
    {
        await query("UPDATE `spam` SET `status` = 'end'");
        process.exit();
    }

    let lastBotUserId = botUsers[botUsers.length - 1]['id'];


    for(let spamKey in parsed_ads)
    {
        let spam = parsed_ads[spamKey];
        await query("UPDATE `spam` SET `status` = 'wait' WHERE `id` = ?", [spam['id']]);

        for(let botUserKey in botUsers)
        {
            let botUser = botUsers[botUserKey];

            if(lastBotUserId == botUser['id'] || lastBotUserId == 0) await query("UPDATE `spam` SET `status` = 'end' WHERE `id` = ?", [spam['id']]);

            try
            {
                console.log('here');
                let res = await bot.copyMessage(botUser['uid'], spam['fromChatId'], spam['mId']);
                console.log(res);
            }
            catch(err)
            {
                console.log(err);
                // continue;
            }
        }
    }
    process.exit();
}