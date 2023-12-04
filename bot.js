import mysql from 'mysql2'
import 'dotenv/config'
import TelegramBot from 'node-telegram-bot-api'
import util from 'util'
import axios from 'axios'

import { botDataObj } from './class/botData.mjs'
let BOTS_CONFIGS = botDataObj

import botFuncsAll from './class/botFuncs.mjs'
let botFuncs = new botFuncsAll()

const API_KEY_BOT = process.env.API_KEY_BOT;

const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

const CRYPTO_BOT_TOKEN = process.env.CRYPTO_BOT_TOKEN;
const CRYPTO_BOT_URL = process.env.CRYPTO_BOT_URL;

const REAL_PATH = process.env.REAL_PATH
const FILESID_FILE = REAL_PATH + 'bot_files/fileFileIds.txt'

const PAYS_CHAT_LINK = process.env.PAYS_CHAT_LINK;
const PAYS_CHAT_ID = process.env.PAYS_CHAT_ID;

const daysToPay = {1:"день", 3:"дня", 7:"дней", 31:"день"};

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
const axiosOptions = {headers: {'Crypto-Pay-API-Token': CRYPTO_BOT_TOKEN}};

var delMsg = false;
var preg;
var newUserInput = '';

var kbds = [];
var btns = [];
var cmdData = {}


var commands = BOTS_CONFIGS['commands'];
var cmdsKey = botFuncs.cmdsToKey(commands);

var data = {};
data["disable_web_page_preview"] = true;
data["parse_mode"] = "markdown";

bot.on("polling_error", err => console.log(err.data.error.message));

bot.on('message', async newMsg => {

    try
    {
        let SETTINGS = await botFuncs.getSettings(query);

        for(let domainFor in BOTS_CONFIGS['domains_info'])
        {
            let domainName = domainFor.replace(/\.[^:]+/, "");
            if(SETTINGS[domainFor + '_prices'] === undefined) SETTINGS[domainFor + '_prices'] = SETTINGS[domainName + '_prices'];
        }

        delMsg = false;
        let sendMsg = false;
        let uid = newMsg['chat']['id'];
        let name = "";
        if(newMsg['chat']['first_name']) name = newMsg['chat']['first_name'];
        let sname = "";
        if(newMsg['chat']['last_name']) sname = newMsg['chat']['last_name'];
        // let fullName = name +" "+ sname;
        let username = "";
        if(newMsg['chat']['username']) username = newMsg['chat']['username'];

        let options = {};

        let cmd = newMsg['text'];

        let invitedByUid = cmd.match(/^\/start\s([0-9]+)/);
        if(invitedByUid) invitedByUid = invitedByUid[1];

        let mId = newMsg['message_id'];
        let botUser = {}
        let botUsers = await query('SELECT * FROM `bot_users` WHERE `uid` = ?', [uid]);
        if(botUsers.length > 0) botUser = botUsers[0];
        else
        {
            if(invitedByUid == uid) invitedByUid = 0;
            if(invitedByUid > 0)
            {
                let invitedByUser = await query('SELECT * FROM `bot_users` WHERE `uid` = ?', [invitedByUid]);
                if(invitedByUser.length == 0) invitedByUid = 0;
            }

            let sqlData = [invitedByUid, uid, username, name, sname, botFuncs.time()];
            await query("INSERT INTO `bot_users` SET `invitedByUid` = ?, `uid` = ?, `username` = ?, `name` = ?, `sname` = ?, `input_data` = '', `reg_time` = ?", sqlData);

            if(invitedByUid > 0)
            {
                let sendMsgNow = "По Вашей ссылке зарегистрировался ["+name +"](tg://user?id="+ uid +")";
                bot.sendMessage(invitedByUid, sendMsgNow, {parse_mode:"Markdown"});
            }

            let botUsers = await query('SELECT * FROM `bot_users` WHERE `uid` = ?', [uid]);
            if(botUsers.length > 0) botUser = botUsers[0];
        }

        let userInput = botUser['input'];
        let inputData = {};
        // console.log(botUser['input_data']);
        if(!botFuncs.empty(botUser['input_data'])) inputData = botFuncs.decodeToDb(botUser['input_data']);
        if(botFuncs.empty(botUser['settings']))
        {
            botUser['settings'] = BOTS_CONFIGS['BOT_USERS_DEF_SETS'];
            await query("UPDATE `bot_users` SET `settings` = ? WHERE `id` = ?", [botFuncs.encodeToDb(botUser['settings']), botUser['id']]);
        }
        else botUser['settings'] = botFuncs.decodeToDb(botUser['settings']);

        if(!botFuncs.empty(botUser['payed_domains'])) botUser['payed_domains'] = botFuncs.decodeToDb(botUser['payed_domains']);
        else botUser['payed_domains'] = {};

        if(!botFuncs.empty(botUser['domains_settings'])) botUser['domains_settings'] = botFuncs.decodeToDb(botUser['domains_settings']);
        else botUser['domains_settings'] = {};


        let isAdmin = false;
        if(botFuncs.in_array(botUser['uid'], BOTS_CONFIGS["BOT_ADMINS"])) isAdmin = true;


        let tgText = '';
        kbds = [];
        btns = [];
        if(!botFuncs.empty(commands))
        {
            cmdData = {};
            if(!botFuncs.empty(cmdsKey[cmd])) cmdData = cmdsKey[cmd];
            else if(!botFuncs.empty(cmdsKey[userInput])) cmdData = cmdsKey[userInput];
            else cmdData = cmdsKey['no_cmd'];

            if(!botFuncs.empty(cmdData['answer'])) tgText = cmdData['answer'];
            if(!botFuncs.empty(cmdData['keyboards'])) kbds = cmdData['keyboards'];
            if(!botFuncs.empty(cmdData['buttons'])) btns = cmdData['buttons'];

            if(!botFuncs.empty(cmdData['kbd']))
            {
                if(!botFuncs.empty(cmdsKey[cmdData['kbd']]['keyboards'])) kbds = cmdsKey[cmdData['kbd']]['keyboards'];
                if(!botFuncs.empty(cmdsKey[cmdData['kbd']]['buttons'])) btns = cmdsKey[cmdData['kbd']]['buttons'];
            }


            if(!botFuncs.empty(cmdData['newUserInput'])) newUserInput = cmdData['newUserInput'];
            else newUserInput = "";

            let cmdKey = cmdData['command'];
            if(!botFuncs.empty(cmdData['cmd_key'])) cmdKey = cmdData['cmd_key'];

            if(!botFuncs.empty(cmdsKey[cmd])) userInput = "";
            
            console.log("cmdKey, userInput");
            console.log(cmdKey, userInput);

            if(cmdKey == "start" || cmdKey == "cancel" || (cmdKey == "no_cmd" && botFuncs.empty(userInput) && cmd != "🔐 Админка"))
            {
                tgText = "👋";
                if(cmdKey == "cancel") tgText = "❌";
                options = {
                    "reply_markup": botFuncs.getKbdsReplyMarkup(cmdsKey['start_kbds']['keyboards'])
                }
                if(isAdmin) options['reply_markup']['keyboard'][2][1] = "🔐 Админка";
                await bot.sendMessage(botUser['uid'], tgText, options);

                if(cmdKey == "no_cmd") tgText = false;
            }
            else if(cmdKey == "stop_search")
            {
                await query("UPDATE `searchs` SET `status` = 'stoped' WHERE `uId` = ? ORDER BY `id` DESC LIMIT 1", [botUser['id']]);
                kbds = cmdsKey['start_kbds']['keyboards'];
                if(isAdmin) kbds[2][1] = "🔐 Админка";
            }
            else if(cmdKey == "sets")
            {
                let newBtns = [];
                for(let key in btns)
                {
                    let btnLine = btns[key];
                    if(!botFuncs.empty(btnLine['bot_see']))
                    {
                        if(botFuncs.empty(botUser['settings']['bot_see'])) btns[key]['bot_see'] = botFuncs.preg_replace("/❌/", "✅", btnLine['bot_see']);
                        else btns[key]['bot_see'] = botFuncs.preg_replace("/✅/", "❌", btnLine['bot_see']);
                    }
                    if(!botFuncs.empty(btnLine['limit_bot_see']) && botFuncs.empty(botUser['settings']['bot_see'])) continue;

                    newBtns.push(btns[key]);
                }
                btns = newBtns;
            }
            else if(cmdKey == "get_limit_bot_see")
            {
                if(parseInt(cmd) >= 0 && cmd * 1 > 0) botUser['settings']['limit_bot_see'] = cmd * 1;
                else
                {
                    cmdData['file'] = "";
                    newUserInput = cmdKey;
                    btns = [];
                    tgText = "⚠️ *Минимально Вы можете установить 1 просмотр!*";
                }
            }
            else if(cmdKey == "get_ads_send_max_count")
            {
                if(parseInt(cmd) >= 0 && cmd * 1 > 0 && cmd * 1 <= 50) botUser['settings']['ads_send_max_count'] = cmd * 1;
                else
                {
                    if(cmd * 1 > 0) tgText = "⚠️ *Максимально Вы можете установить 50 объявлений!*";
                    else tgText = "⚠️ *Минимально Вы можете установить 1 объявление!*";
                    cmdData['file'] = "";
                    newUserInput = cmdKey;
                    btns = [];
                }
            }
            else if(cmdKey == "get_add_balance_amount")
            {
                inputData['get_add_balance_amount'] = cmd;
                tgText += "\n\n— Сумма: "+ cmd +"\n\n💡 *Выберите валюту, которой хотите оплатить счёт*";
            }
            else if(userInput.match(/start_parsing:(.+):get_(.+)/))
            {
                let matches = userInput.match(/start_parsing:(.+):get_(.+)/);
                let domain = matches[1];
                let domainKey = domain.replace(/\..+/, "");
                let mode = matches[2];
                
                let correctInDataVal = true;
                let getVal = cmd;

                let newUserInputData = {
                    "vinted": {
                        "max_active_ads_of_seller":"min_date_pub_ad",
                        "min_date_pub_ad":"max_comments_of_seller",
                        "max_comments_of_seller":"parsing_type",
                        "parsing_type":"save_preset",
                        "save_preset":"cat_links",
                    },
                    "subito": {
                        "max_active_ads_of_seller":"min_reg_date_of_seller",
                        "min_reg_date_of_seller":"min_date_pub_ad",
                        "min_date_pub_ad":"max_comments_of_seller",
                        "max_comments_of_seller":"parsing_type",
                        "parsing_type":"save_preset",
                        "save_preset":"cat_links",
                    },
                    "etsy": {
                        "max_active_ads_of_seller":"min_reg_date_of_seller",
                        "min_reg_date_of_seller":"min_date_pub_ad",
                        "min_date_pub_ad":"max_comments_of_seller",
                        "max_comments_of_seller":"parsing_type",
                        "parsing_type":"save_preset",
                        "save_preset":"cat_links",
                    },
                };

                let tempKbds = [];
                let kbdsLine = [];

                if(inputData['start_parsing_data'] === undefined) inputData['start_parsing_data'] = {};

                if(mode == "max_active_ads_of_seller" && domainKey === "vinted")
                {
                    if(botFuncs.isNumeric(getVal))
                    {
                        getVal = parseInt(getVal);

                        sendMsg = "— Пример: `01-01-2020`\n\n🕜 *Введите минимальную* дату публикации *товара на сайте*";
                        for(let day = 2; day >= 0; day--)
                        {
                            kbdsLine.push(botFuncs.nowDateFromTime(botFuncs.time() - (86400 * day)));
                            if(day <= 1)
                            {
                                tempKbds.push(kbdsLine);
                                kbdsLine = [];
                            }
                        }
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "max_active_ads_of_seller" && domainKey !== "vinted")
                {
                    if(botFuncs.isNumeric(getVal))
                    {
                        getVal = parseInt(getVal);

                        sendMsg = "— Пример: `01-01-2020`\n\n🕜 *Введите минимальную* дату публикации *товара на сайте*";
                        for(let day = 2; day >= 0; day--)
                        {
                            kbdsLine.push(botFuncs.nowDateFromTime(botFuncs.time() - (86400 * day)));
                            if(day <= 1)
                            {
                                tempKbds.push(kbdsLine);
                                kbdsLine = [];
                            }
                        }
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "min_date_pub_ad")
                {
                    let timeInt = botFuncs.strtotime_parsed(cmd);
                    if(timeInt)
                    {
                        sendMsg = "— Пример: `5`\n\n🕜 *Введите максимально допустимое* количество комментариев *у продавца*";
                        tempKbds = [["0", "2", "5", "10"]];
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "max_comments_of_seller")
                {
                    if(botFuncs.isNumeric(getVal))
                    {
                        getVal = parseInt(getVal);
                        sendMsg = "— Выберите способ парсинга\n\n🕜 *Стандартный* - парсинг объявлений по страницам.\n*Фоновый* - парсинг, при котором периодически проверяется первая страница, на наличие новых объявлений. Длиться максимум 30 минут!";
                        tempKbds = [["Стандартный", "Фоновый"]];
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "parsing_type")
                {
                    if(botFuncs.in_array(getVal, ["Стандартный", "Фоновый"]))
                    {
                        sendMsg = "— Вы сможете подключать фильтры одним нажатием\n\n🗂 *Сохранить фильтры в пресет?*";
                        tempKbds = [["✅ Сохранить", "⛔️ Нет"]];
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "save_preset")
                {
                    if(botFuncs.in_array(getVal, ["✅ Сохранить", "⛔️ Нет"]))
                    {
                        cmdData['file'] = cmdsKey['search_ads']['file'];

                        if(getVal == "⛔️ Нет")
                        {
                            let predStartData = botFuncs.getSearchPredStartData(domain, BOTS_CONFIGS);
                            sendMsg = predStartData['sendMsg'];
                            tempKbds = predStartData['kbds'];
                            btns = predStartData['btns'];
                            newUserInput = predStartData['newUserInput'];
                        }
                        else if(getVal == "✅ Сохранить")
                        {
                            tgText = "🗂 *Пресеты*\n\n— Не более 10-ти символов\n\n💡 *Введите название пресета*";
                            newUserInput = "get_preset_name:" + domain;
                        }
                    }
                    else correctInDataVal = false;
                }
                else if(mode == "cat_links")
                {
                    let links = [];
                    if(getVal == "🗂 Вставить ссылки из прошлого парсинга")
                    {
                        let lastSearch = await query("SELECT * FROM `searchs` WHERE `uId` = ? ORDER BY `id` DESC LIMIT 1", [botUser['id']]);
                        lastSearch = lastSearch[0];
                        links = botFuncs.decodeToDb(lastSearch['links']);
                    }
                    else links = getVal.split("\n");
                    
                    sendMsg = await botFuncs.getSearchStartedText(query, domain, links, inputData, botUser);
                    cmdData['file'] = cmdsKey['search_ads']['file'];
                    kbds = cmdsKey['search_started']['keyboards'];
                }

                if(correctInDataVal)
                {
                    if(mode != "cat_links")
                    {
                        inputData['start_parsing_data'][mode] = getVal;
                        if(botFuncs.empty(newUserInput)) newUserInput = "start_parsing:"+ domain +":get_" + newUserInputData[domainKey][mode];
                        
                        let tempTgText = "🔎";
                        if(sendMsg !== false)
                        {
                            sendMsg = "🔎 *Запуск поиска объявлений*\n\n" + sendMsg;
                        }
                        else
                        {
                            tempTgText = "🤖";
                            tempKbds = cmdsKey['start_kbds']['keyboards'];
                            if(isAdmin) tempKbds[2][1] = "🔐 Админка";
                        }
                        options = {
                            "reply_markup": botFuncs.getKbdsReplyMarkup(tempKbds)
                        };
                        await bot.sendMessage(botUser['uid'], tempTgText, options);

                        if(btns.length == 0) btns.push({"cancel":"❌ Отменить действие"});
                    }
                }
                else
                {
                    newUserInput = userInput;
                    tgText = "❌ *Что-то пошло не так, повторите действия заново!*";
                    cmdData['file'] = "";
                }
            }
            else if(userInput.match(/get_preset_name:(.+)/))
            {
                let matches = userInput.match(/get_preset_name:(.+)/);
                let domain = matches[1];

                let predStartData = botFuncs.getSearchPredStartData(domain, BOTS_CONFIGS);
                sendMsg = predStartData['sendMsg'];
                btns = predStartData['btns'];
                newUserInput = predStartData['newUserInput'];

                let tempTgText = "🔎";
                let tempKbds = predStartData['kbds'];
                options = {
                    "reply_markup": botFuncs.getKbdsReplyMarkup(tempKbds)
                };
                await bot.sendMessage(botUser['uid'], tempTgText, options);

                await query("INSERT INTO `presets` SET `uId` = ?, `name` = ?, `preset` = ?, `createTime` = ?", [botUser['id'], cmd, botFuncs.encodeToDb(inputData['start_parsing_data']), botFuncs.time()]);
                
                tempTgText = "🗂 *Пресет сохранён!*";
                await bot.sendMessage(botUser['uid'], tempTgText, {"parse_mode":"markdown"});

            }
            else if(userInput.match(/blacklist_(upd|more):(.+)/))
            {
                let matches = userInput.match(/blacklist_(upd|more):(.+)/);
                let blackListMsg = botFuncs.getBlackListMsg(botUser, matches, cmd);
                botUser = blackListMsg['botUser'];
                tgText = blackListMsg['tgText'];
                btns = blackListMsg['btns'];
                cmdData['file'] = cmdsKey['search_ads']['file'];
            }
            else if(userInput.match(/^get:hoursto:(.+)/))
            {
                let domain = userInput.match(/^get:hoursto:(.+)/);
                domain = domain[1];
                let addHours = cmd;
                cmdData['file'] = cmdsKey['search_ads']['file'];

                if(botFuncs.isInt(addHours))
                {
                    let domainEndTime = 0;
                    if(botUser['payed_domains'][domain] !== undefined) domainEndTime = botUser['payed_domains'][domain];
                    if(domainEndTime < botFuncs.time()) domainEndTime = botFuncs.time();
                    domainEndTime += addHours * 3600;
                    botUser['payed_domains'][domain] = domainEndTime;
    
                    await query("UPDATE `bot_users` SET `fromRefNotUsedHours` = `fromRefNotUsedHours` - ?, `payed_domains` = ? WHERE `id` = ?", [addHours, botFuncs.encodeToDb(botUser['payed_domains']), botUser['id']]);
    
                    tgText = "🥳 *Успешно добавлено "+ addHours +" ч. для* "+ BOTS_CONFIGS['domains_info'][domain]['name_link'];
                    let btnLine = {};
                    btnLine["payed:" + domain] = "🔗 Перейти к площадке";
                    btns = [btnLine];
                }
                else
                {
                    sendMsg = "Введите целое число";
                    newUserInput = userInput;
                    btns = [{"activate_inviter_hours":"◀️ Назад"}];
                }
            }
            else if(userInput == "get_send_balance_amount")
            {
                if(botFuncs.isNumeric(cmd))
                {
                    let sendBalance = cmd * 1;
                    if(botUser['balance'] >= sendBalance)
                    {
                        await query("UPDATE `bot_users` SET `balance` = `balance` - ? WHERE `id` = ?", [sendBalance, botUser['id']]);
                        await query("UPDATE `bot_users` SET `balance` = `balance` + ? WHERE `id` = ?", [sendBalance, botUser['id']]);
                    }
                    else
                    {
                        sendMsg = "⚠️ *У вас на балансе: 0.0 $!*";
                    }
                }
                else
                {
                    sendMsg = "Введите число";
                    newUserInput = userInput;
                    btns = [{"sendresub":"◀️ Назад"}];
                }
            }
            else if(isAdmin)
            {
                if(cmd == '🔐 Админка')
                {
                    tgText = cmd;
                    btns = [
                        ["📧 Рассылка", "🛠 Подписки"],
                        ["👥 Пользователи"],
                    ];
                    let btnLine = {};
                    btnLine[PAYS_CHAT_LINK] = "💵 Оплаты";
                    btnLine["🛒 Цены"] = "🛒 Цены";
                    btns.push(btnLine);
                }

                else if(userInput == 'get_spam_msg')
                {
                    await bot.sendMessage(botUser['uid'], "Рассылка будет выглядеть так:");

                    console.log(newMsg);
                    let sendSpamBtnLine = {};
                    sendSpamBtnLine["send_spam_" + mId] = "Запустить рассылку";
                    btns = [
                        sendSpamBtnLine,
                        {"🔐 Админка": "❌ Отменить"}
                    ];
                    options = {
                        "reply_markup": botFuncs.getBtnsReplyMarkup(btns)
                    }
                    await bot.copyMessage(botUser['uid'], botUser['uid'], mId, options);
                    tgText = false;
                }

                else if(userInput == "search_user_to_manage")
                {
                    let userSearchVal = cmd;
                    let exstbotUser = await query("SELECT * FROM `bot_users` WHERE `uid` = ? OR `username` = ? OR `name` LIKE ? ORDER BY `id` ASC LIMIT 1", [userSearchVal, userSearchVal.replace(/@/, ""), "%"+ userSearchVal +"%"]);
                    if(exstbotUser.length > 0)
                    {
                        exstbotUser = exstbotUser[0];
                        tgText = "["+ exstbotUser['name'] +" "+ exstbotUser['sname'] +"](tg://user?id="+ exstbotUser['uid'] +")";
                        btns = [];
                        let btnLine = {};
                        btnLine["del_sub:" + exstbotUser['id']] = "✖️ Забрать подписку";
                        btnLine["add_sub:" + exstbotUser['id']] = "➕ Добавить подписку";
                        btns.push(btnLine);
                        btnLine = {};
                        btnLine["del_hours:" + exstbotUser['id']] = "🕟 Забрать часы";
                        btnLine["add_hours:" + exstbotUser['id']] = "➕ Добавить часы";
                        btns.push(btnLine);
                        btns.push({"🔐 Админка":"❌ Отменить"});
                    }
                    else
                    {
                        newUserInput = userInput;
                        tgText = "*Ничего не нашлось* Попробуйте еще раз:";
                    }
                }
                else if(userInput.match(/^get_(days|hours)_to_(add|del):([^:]+):([^:]+)/))
                {
                    let matches = userInput.match(/^get_(days|hours)_to_(add|del):([^:]+):([^:]+)/);
                    let daysOrHours = matches[1];
                    let delOrAdd = matches[2];
                    let botUserId = matches[3];
                    let domain = matches[4];
                    let addDaysOrHours = cmd;

                    if(botFuncs.isInt(addDaysOrHours))
                    {
                        let exstBotUser = await query("SELECT * FROM `bot_users` WHERE `id` = ?", [botUserId]);
                        if(exstBotUser.length > 0)
                        {
                            exstBotUser = exstBotUser[0];
                            let userPayedDomains = {};
                            if(!botFuncs.empty(exstBotUser['payed_domains'])) userPayedDomains = botFuncs.decodeToDb(exstBotUser['payed_domains']);
                            
                            if(userPayedDomains[domain] === undefined || userPayedDomains[domain] < botFuncs.time()) userPayedDomains[domain] = botFuncs.time();
                            
                            if(daysOrHours == "days") userPayedDomains[domain] += addDaysOrHours * 86400;
                            if(daysOrHours == "hours" && delOrAdd == "add") userPayedDomains[domain] += addDaysOrHours * 3600;
                            if(daysOrHours == "hours" && delOrAdd == "del") userPayedDomains[domain] -= addDaysOrHours * 3600;

                            await query("UPDATE `bot_users` SET `payed_domains` = ? WHERE `id` = ?", [botFuncs.encodeToDb(userPayedDomains), botUserId]);

                            tgText = "*Успешно!*";
                            btns = [];
                            let btnLine = {};
                            btnLine['subs_user:'+ botUserId] = "◀️ К пользователю";
                            btns.push(btnLine);
                        }
                        else
                        {
                            tgText = "*Не удалось найти пользователя*";
                            btns = [["🔐 Админка"]];
                        }
                    }
                    else
                    {
                        newUserInput = userInput;
                        tgText = "*Некорректные данные!* Введите число:";
                    }
                }

                else if(userInput == "get_search_users")
                {
                    let userSearchVal = cmd;
                    let exstBotUsers = await query("SELECT * FROM `bot_users` WHERE `uid` = ? OR `username` = ? OR `name` LIKE ? ORDER BY `id` DESC LIMIT 50", [userSearchVal, userSearchVal.replace(/@/, ''), "%"+ userSearchVal +"%"]);
                    if(exstBotUsers.length > 0)
                    {
                        tgText = "*Вот что нашлось:*";
                        let btnLine = {};
                        for(let botUserKey in exstBotUsers)
                        {
                            btnLine = {};
                            let botUserInd = exstBotUsers[botUserKey];
                            if(botUserInd['username'].length == 0) botUserInd['username'] = "-";
                            else botUserInd['username'] = "@" + botUserInd['username'];
                            btnLine['subs_user:' + botUserInd['id']] = botUserInd['username'] + " | " + botUserInd['name'] + " " + botUserInd['sname'] + " | $" + botUserInd['balance'];
                            btns.push(btnLine);
                        }
                        btns.push({"👥 Пользователи": "◀️ Назад"});
                    }
                    else
                    {
                        newUserInput = userInput;
                        tgText = "*Ничего не нашлось* Попробуйте еще раз:";
                    }
                }

                else if(userInput.match(/^get_ind_price_val:([^:]+):([^:]+)/))
                {
                    let matches = userInput.match(/^get_ind_price_val:([^:]+):([^:]+)/);
                    let dayToPay = matches[1];
                    let domain = matches[2];

                    console.log('domain:');
                    console.log(domain);

                    if(SETTINGS[domain + "_prices"] != undefined)
                    {
                        let newPrice = cmd;
                        if(botFuncs.isNumeric(newPrice))
                        {
                            newPrice *= 1;
                            SETTINGS[domain + "_prices"][dayToPay + "_day"] = newPrice;

                            tgText = "*Успешно изменено!*";
                            let newBtns = [];
                            for(let dayToPay in daysToPay)
                            {
                                let dayToPayVal = daysToPay[dayToPay];
                                let btnLine = {};
                                btnLine['change_ind_price:'+ dayToPay +':' + domain] = dayToPay +" "+ dayToPayVal +" ["+ SETTINGS[domain + "_prices"][dayToPay + "_day"] +" $]";
                                newBtns.push(btnLine);
                            }
                            newBtns.push({"🛒 Цены": "◀️ Назад"});
                            btns = newBtns;

                            let exstSetKey = await query("SELECT * FROM `sets` WHERE `key` = ?", [domain + "_prices"]);
                            if(exstSetKey.length == 0)
                            {
                                await query("INSERT INTO `sets` SET `val` = ?, `key` = ?", [JSON.stringify(SETTINGS[domain + "_prices"]), domain + "_prices"]);
                            }
                            else await query("UPDATE `sets` SET `val` = ? WHERE `key` = ?", [JSON.stringify(SETTINGS[domain + "_prices"]), domain + "_prices"]);
                        }
                        else
                        {
                            newUserInput = userInput;
                            tgText = "*Некорректные данные!* Введите число:";
                        }
                    }
                    else tgText = "Сервис не найден в базе";
                }
                
            }

            await query("UPDATE `bot_users` SET `input` = ?, `input_data` = ?, `settings` = ?, `domains_settings` = ? WHERE `id` = ?",
                        [newUserInput, botFuncs.encodeToDb(inputData), botFuncs.encodeToDb(botUser['settings']), botFuncs.encodeToDb(botUser['domains_settings']), botUser['id']]);

                
            if(cmdData['answer'] !== undefined && cmdData['answer'].length > 0) tgText = cmdData['answer'];

            if(tgText == false && sendMsg != false) tgText = sendMsg;
            
            if(tgText !== false)
            {
                tgText = botFuncs.preg_replace("/{limit_bot_see}/", botUser['settings']['limit_bot_see'], tgText);
                tgText = botFuncs.preg_replace("/{ads_send_max_count}/", botUser['settings']['ads_send_max_count'], tgText);
                tgText = botFuncs.preg_replace("/{balance}/", botUser['balance'], tgText);

                if(btns.length > 0)
                {
                    options = {
                        "reply_markup": botFuncs.getBtnsReplyMarkup(btns)
                    }
                    console.log(options);
                }

                console.log("kbds here 2");
                console.log(kbds);
                if(kbds.length > 0)
                {
                    options = {
                        "reply_markup": botFuncs.getKbdsReplyMarkup(kbds)
                    }
                }

                console.log(options);

                options['parse_mode'] = "markdown";
                options['disable_web_page_preview'] = true;

                if(!botFuncs.empty(cmdData['file']))
                {
                    if(cmdData['answer'] !== undefined && cmdData['answer'].length > 0) options['caption'] = tgText;
                    else if(tgText !== false) options['caption'] = tgText;

                    if(cmdData['file'].match(/mp4/i))
                    {
                        let sendFile = botFuncs.getSendTgFile(REAL_PATH + cmdData['file'], FILESID_FILE);
                        let sendResInd = await bot.sendVideo(botUser['uid'], sendFile, options);

                        if(!botFuncs.empty(sendResInd))
                        {
                            let fileTypeArr = ["document", "photo", "video"];
                            for(let fileTypeKey in fileTypeArr)
                            {
                                let fileType = fileTypeArr[fileTypeKey];
                                if(sendResInd[fileType] == undefined) continue;

                                if(!botFuncs.empty(sendResInd[fileType]))
                                {
                                    if(!botFuncs.empty(sendResInd[fileType]['file_id']) && !botFuncs.empty(sendResInd[fileType]['file_name']))
                                    {
                                        botFuncs.putFileFileIds(REAL_PATH +"bot_files/"+ sendResInd[fileType]['file_name'], sendResInd[fileType]['file_id'], FILESID_FILE);
                                    }
                                    if(!botFuncs.empty(sendResInd[fileType][0]) && !botFuncs.empty(sendResInd[fileType][0]['file_id']) && !botFuncs.empty(sendResInd[fileType][sendResInd[fileType].length - 1]['file_name']))
                                    {
                                        botFuncs.putFileFileIds(REAL_PATH +"bot_files/"+ sendResInd[fileType][sendResInd[fileType].length - 1]['file_name'], sendResInd[fileType][sendResInd[fileType].length - 1]['file_id'], FILESID_FILE);
                                    }
                                }
                            }
                        }
                    }
                }
                else await bot.sendMessage(botUser['uid'], tgText, options);
            }
        }
    }
    catch(error)
    {
        console.log(error);
    }
});








































bot.on('callback_query', async newMsgCall => {


    let newMsg = newMsgCall['message']

    try
    {
        let SETTINGS = await botFuncs.getSettings(query);

        for(let domainFor in BOTS_CONFIGS['domains_info'])
        {
            let domainName = domainFor.replace(/\.[^:]+/, "");
            if(SETTINGS[domainFor + '_prices'] === undefined) SETTINGS[domainFor + '_prices'] = SETTINGS[domainName + '_prices'];
        }


        delMsg = false;
        let answCallText = false;
        let sendMsg = false;
        let uid = newMsg['chat']['id'];
        let name = "";
        if(newMsg['chat']['first_name']) name = newMsg['chat']['first_name'];
        let sname = "";
        if(newMsg['chat']['last_name']) sname = newMsg['chat']['last_name'];
        let username = "";
        if(newMsg['chat']['username']) username = newMsg['chat']['username'];

        let options = {};

        let callId = newMsgCall['id'];
        let cmd = newMsgCall['data'];
        let mId = newMsg['message_id'];
        let botUser = {}
        let botUsers = await query('SELECT * FROM `bot_users` WHERE `uid` = ?', [uid]);
        if(botUsers.length > 0) botUser = botUsers[0];
        else
        {
            let sqlData = [uid, username, name, sname, botFuncs.time()];
            await query("INSERT INTO `bot_users` SET `uid` = ?, `username` = ?, `name` = ?, `sname` = ?, `input_data` = '', `reg_time` = ?", sqlData);
            
            let botUsers = await query('SELECT * FROM `bot_users` WHERE `uid` = ?', [uid]);
            if(botUsers.length > 0) botUser = botUsers[0];
        }

        let userInput = botUser['input'];
        let inputData = {};
        if(!botFuncs.empty(botUser['input_data'])) inputData = botFuncs.decodeToDb(botUser['input_data']);
        if(botFuncs.empty(botUser['settings']))
        {
            botUser['settings'] = BOTS_CONFIGS['BOT_USERS_DEF_SETS'];
            await query("UPDATE `bot_users` SET `settings` = ? WHERE `id` = ?", [botFuncs.encodeToDb(botUser['settings']), botUser['id']]);
        }
        else botUser['settings'] = botFuncs.decodeToDb(botUser['settings']);

        if(!botFuncs.empty(botUser['payed_domains'])) botUser['payed_domains'] = botFuncs.decodeToDb(botUser['payed_domains']);
        else botUser['payed_domains'] = {};

        if(!botFuncs.empty(botUser['domains_settings'])) botUser['domains_settings'] = botFuncs.decodeToDb(botUser['domains_settings']);
        else botUser['domains_settings'] = {};
    

        let isAdmin = false;
        if(botFuncs.in_array(botUser['uid'], BOTS_CONFIGS["BOT_ADMINS"])) isAdmin = true;

        data["chat_id"] = botUser['uid'];
        data["message_id"] = mId;

        let tgText = '';
        kbds = [];
        btns = [];

        console.log(cmd);

        if(!botFuncs.empty(commands))
        {

            cmdData = {}
            if(!botFuncs.empty(cmdsKey[cmd])) cmdData = cmdsKey[cmd];
            else if(!botFuncs.empty(cmdsKey[userInput])) cmdData = cmdsKey[userInput];
            else cmdData = cmdsKey['no_cmd'];

            if(!botFuncs.empty(cmdData['answer'])) tgText = cmdData['answer'];
            if(!botFuncs.empty(cmdData['keyboards'])) kbds = cmdData['keyboards'];
            if(!botFuncs.empty(cmdData['buttons'])) btns = cmdData['buttons'];

            if(!botFuncs.empty(cmdData['kbd']))
            {
                if(!botFuncs.empty(cmdsKey[cmdData['kbd']]['keyboards'])) kbds = cmdsKey[cmdData['kbd']]['keyboards'];
                if(!botFuncs.empty(cmdsKey[cmdData['kbd']]['buttons'])) btns = cmdsKey[cmdData['kbd']]['buttons'];
            }

            if(!botFuncs.empty(cmdData['newUserInput'])) newUserInput = cmdData['newUserInput'];
            else newUserInput = "";

            let cmdKey = cmdData['command'];
            if(!botFuncs.empty(cmdData['cmd_key'])) cmdKey = cmdData['cmd_key'];


            let domain = '';
            let domainCmd = cmdKey;
            if(BOTS_CONFIGS['domains_info'][cmd] !== undefined) domainCmd = cmd;
            let payedThisDomain = false;
            if((cmd.match(/buy_[0-9]+_day:(.+)/) || cmd.match(/payed:(.+)/)) || (BOTS_CONFIGS['domains_info'][domainCmd] != undefined && botUser['payed_domains'][domainCmd] > botFuncs.time()))
            {
                let matches;
                if(cmd.match(/payed:(.+)/)) matches = cmd.match(/payed:(.+)/);
                else if(cmd.match(/buy_[0-9]+_day:(.+)/)) matches = cmd.match(/buy_[0-9]+_day:(.+)/);
                else matches = [0, domainCmd];

                let tempDomain = matches[1];
                if(botUser['payed_domains'][tempDomain] > botFuncs.time() && BOTS_CONFIGS['domains_info'][tempDomain] != undefined)
                {
                    domain = tempDomain;
                    payedThisDomain = true;
                }
            }

            if(cmdKey == "cancel")
            {
                tgText = "❌";
                options = {
                    "reply_markup": botFuncs.getKbdsReplyMarkup(cmdsKey['start_kbds']['keyboards'])
                }
                if(isAdmin) options['reply_markup']['keyboard'][2][1] = "🔐 Админка";
                await bot.sendMessage(botUser['uid'], tgText, options);

                delMsg = true;
                tgText = false;
            }
            else if(cmdKey == "ref_prog")
            {
                let refsCount = await query("SELECT id FROM `bot_users` WHERE `invitedByUid` = ?", [botUser['uid']]);
                tgText = "👬 *Реферальная программа*\nВы пригласили - *"+ refsCount.length +" чел.*\nВы накопили - *"+ botUser['fromRefNotUsedHours'] +" ч.*\n\n❓ *Что я получу, если реферал купит подписку?*\n🤍 За покупку 1-го дня - 4 ч.\n💛 За покупку 3-ёх дней - 14 ч.\n🧡 За покупку 7-и дней - 28 ч.\n❤️ За покупку 31-го дня - 80 ч.\n\n🤝 *Ваша реферальная ссылка*\n[https://t.me/"+ botDataObj['BOT_USERNAME'] +"?start="+ botUser['uid'] +"](https://t.me/"+ botDataObj['BOT_USERNAME'] +"?start="+ botUser['uid'] +")";
            }
            else if(cmdKey == "activate_inviter_hours")
            {
                if(botUser['fromRefNotUsedHours'] <= 0) answCallText = "🚫 У вас отсутствуют накопленные часы!"; // ⚠️ После активации - Вы не сможете отменить подписку. Нажмите еще раз, чтобы активировать реферальные часы!
            }
            else if(cmd.match(/^(hoursto|change_price):([^\.]+)$/))
            {
                let matches = cmd.match(/^(hoursto|change_price):([^\.]+)/);
                let dopCmd = matches[1] + ":";
                let domainName = matches[2];
                cmdData['file'] = cmdsKey['search_ads']['file'];
                tgText = "*Введите сервис*";

                btns = botFuncs.getManyServicesBtns(BOTS_CONFIGS, domainName, dopCmd)
                btns.push({"/start": "◀️ Назад"});
            }
            else if(cmd.match(/^hoursto:(.+)/))
            {
                let domain = cmd.match(/^hoursto:(.+)/);
                domain = domain[1];
                cmdData['file'] = cmdsKey['search_ads']['file'];
                tgText = "*Введите кол-во начислямых часов для сервиса* "+ botDataObj['domains_info'][domain]['name'];
                newUserInput = 'get:' + cmd;
                btns = [{"activate_inviter_hours": "◀️ Назад"}];
            }
            else if(payedThisDomain)
            {
                let domainInfo = BOTS_CONFIGS['domains_info'][domain];

                cmdData['file'] = cmdsKey['search_ads']['file'];
                tgText = "🔎 *Площадка:*\n— "+ domainInfo['name_link'] +"\n\n📅 *Время в "+ domainInfo['country_1'] +":*\n— " + botFuncs.date_from_time(botFuncs.time() + domainInfo['time_zone']);
                btns = [];

                let btnLine = {};
                btnLine['start_parsing:' + domain] = "🔎 Запустить парсинг";
                btns.push(btnLine);
                btnLine = {};
                btnLine['presets:' + domain] = "🗂 Пресеты";
                btns.push(btnLine);
                btnLine = {};
                btnLine['blacklist:' + domain] = "🚫 Черный список слов";
                btns.push(btnLine);
                btns.push({"search_ads": "◀️ Назад"});
            }
            else if(cmd == "vinted" || cmd == "etsy")
            {
                console.log("HERE");
                cmdData['file'] = "bot_files/"+ botDataObj['menu_gif'];
                btns = botFuncs.getManyServicesBtns(BOTS_CONFIGS, cmd);
                btns.push({"search_ads": "◀️ Назад"});
            }
            else if(BOTS_CONFIGS['domains_info'][cmd] !== undefined)
            {
                let domain = cmd;
                let domainName = domain.replace(/\.[^:]+/, "");

                let domainInfo = BOTS_CONFIGS['domains_info'][domain];
                tgText = domainInfo['name_link'] + "\n\n" + domainInfo['head_text'];
                cmdData['file'] = "bot_files/"+ botDataObj['menu_gif'];


                let newBtns = [];
                
                let btnLine = {};
                for(let dayToPay in daysToPay)
                {
                    let dayToPayVal = daysToPay[dayToPay];
                    btnLine = {};
                    btnLine['buy_'+ dayToPay +'_day:' + domain] = "Купить на "+ dayToPay +" "+ dayToPayVal +" ["+ SETTINGS[domainName + "_prices"][dayToPay + "_day"] +" $]";
                    newBtns.push(btnLine);
                }
                let backKey = domainName;
                if(domain.match(/subito/)) backKey = "search_ads";
                btnLine = {};
                btnLine[backKey] = "◀️ Назад";
                newBtns.push(btnLine);
                btns = newBtns;
            }
            else if(cmd.match(/buy_([0-9]+)_day:(.+)/))
            {
                let matches = cmd.match(/buy_([0-9]+)_day:(.+)/);
                let dayToPay = matches[1];
                let domain = matches[2];
                
                if(botUser['payed_domains'][domain] == undefined) botUser['payed_domains'][domain] = 0;

                if(SETTINGS[domain + "_prices"] != undefined && SETTINGS[domain + "_prices"][dayToPay + "_day"] != undefined)
                {
                    let toPayAmount = SETTINGS[domain + "_prices"][dayToPay + "_day"];
                    if(botUser['balance'] >= toPayAmount)
                    {
                        botUser['payed_domains'][domain] = botFuncs.time() + 86400 * dayToPay;
                        console.log(botUser['payed_domains']);
                        let payedDomainsStr = botFuncs.encodeToDb(botUser['payed_domains']);
                        await query("UPDATE `bot_users` SET `balance` = `balance` - ?, `payed_domains` = ? WHERE `id` = ?", [toPayAmount, payedDomainsStr, botUser['id']]);

                        // код для начисления пригласителю
                        if(botDataObj['hours_to_inviter'][dayToPay] !== undefined)
                        {
                            let hoursToInviter = botDataObj['hours_to_inviter'][dayToPay];
                            query("UPDATE `bot_users` SET `fromRefNotUsedHours` = `fromRefNotUsedHours` + ? WHERE `uid` = ?", [hoursToInviter, botUser['invitedByUid']]);
                            let sendMsgNow = "Начислено *"+ hoursToInviter +" ч.* за ["+ botUser['name'] +"](tg://user?id="+ botUser['uid'] +")";
                            bot.sendMessage(botUser['invitedByUid'], sendMsgNow, {parse_mode:"Markdown"});
                        }
                        // код для начисления пригласителю

                        tgText = "🥳 *Поздравляем с покупкой! Теперь вам доступна площадка:* "+ BOTS_CONFIGS['domains_info'][domain]['name_link'];
                        let btnLine = {};
                        btnLine["payed:" + domain] = "🔗 Перейти к площадке";
                        btns = [btnLine];

                        let toChatText = "#Подписка\n["+ botUser['name'] +" "+ botUser['sname'] +"](tg://user?id="+ botUser['uid'] +") купил подписку *"+ BOTS_CONFIGS['domains_info'][domain]['name'] +"* на *"+ dayToPay + "д.*";
                        botFuncs.sendPaysToChat(toChatText, bot, PAYS_CHAT_ID);
                    }
                    else answCallText = "🚫️ Недостаточно средств!";
                }
                else answCallText = '❗️ Ошибка №232';
            }

            else if(cmdKey == "sendresub")
            {
                // if(botUser['fromRefNotUsedHours'] <= 0) answCallText = "🚫 У вас отсутствуют накопленные часы!"; // ⚠️ После активации - Вы не сможете отменить подписку. Нажмите еще раз, чтобы активировать реферальные часы!
            }

            else if(cmd.match(/start_parsing:([^:]+)$/))
            {
                let matches = cmd.match(/start_parsing:(.+)/);
                domain = matches[1];

                inputData['start_parsing_data'] = {};

                newUserInput = "start_parsing:"+ domain +":get_max_active_ads_of_seller";
                sendMsg = "🔎";
                let kbds = [
                    ["5", "10", "15"]
                ];
                options = {
                    "reply_markup": botFuncs.getKbdsReplyMarkup(kbds)
                }
                await bot.sendMessage(botUser['uid'], sendMsg, options);

                sendMsg = "🔎 *Запуск поиска объявлений*\n\n— Пример: `5`\n\n📃 *Введите максимально допустимое* количество активных объявлений *у продавца*";
                btns = [
                    {"cancel":"❌ Отменить действие"}
                ];
                cmdData['file'] = cmdsKey['search_ads']['file'];

                delMsg = true;
            }
            else if(cmd.match(/cat_links:(.+):(.+)/))
            {
                let matches = cmd.match(/cat_links:(.+):(.+)/);
                domain = matches[1];
                let catLinkLey = matches[2];

                if(BOTS_CONFIGS['domains_info'][domain]['cats_links'] != undefined && BOTS_CONFIGS['domains_info'][domain]['cats_links'][catLinkLey] != undefined)
                {
                    let links = [BOTS_CONFIGS['domains_info'][domain]['cats_links'][catLinkLey]];
                    sendMsg = await botFuncs.getSearchStartedText(query, domain, links, inputData, botUser);

                    delMsg = true;
                    cmdData['file'] = cmdsKey['search_ads']['file'];
                    kbds = cmdsKey['search_started']['keyboards'];
                }
                else sendMsg = "*Ошибка! Не удалось найти категорию*";
            }
            else if(cmd.match(/presets:([^:]+)$/))
            {
                let matches = cmd.match(/presets:(.+)/);
                domain = matches[1];

                let botUserPresets = await query("SELECT * FROM `presets` WHERE `uId` = ?", [botUser['id']]);

                tgText = "🗂 *Пресеты*\n\n— Парсер автоматически подключит фильтры\n\n💡 *Выберите нужный пресет*"
                btns = [];

                let btnLine = {};
                if(!botFuncs.empty(botUserPresets))
                {
                    for(let presetKey in botUserPresets)
                    {
                        let presetData = botUserPresets[presetKey];
                        btnLine['presets:ind:' + domain + ':' + presetData['id']] = presetData['name'];
                        btns.push(btnLine);
                        btnLine = {};
                    }
                }

                btnLine = {};
                btnLine['presets:del:' + domain] = "🗑 Удалить пресеты";
                btns.push(btnLine);
                btnLine = {};
                btnLine['presets:share:' + domain] = "📪 Поделиться пресетами";
                btns.push(btnLine);
                btnLine = {};
                btnLine[domain] = "◀️ Назад";
                btns.push(btnLine);
            }
            else if(cmd.match(/presets:ind:(.+):([0-9]+)/))
            {
                let matches = cmd.match(/presets:ind:(.+):([0-9]+)/);
                domain = matches[1];
                let presetId = matches[2];

                let preset = await query("SELECT * FROM `presets` WHERE `uId` = ? AND `id` = ?", [botUser['id'], presetId]);

                if(preset.length > 0)
                {
                    preset = preset[0];

                    let predStartData = botFuncs.getSearchPredStartData(domain, BOTS_CONFIGS, true);
                    sendMsg = predStartData['sendMsg'];
                    cmdData['file'] = cmdsKey['search_ads']['file'];
                    btns = predStartData['btns'];
                    newUserInput = predStartData['newUserInput'];
    
                    let tempTgText = "🔎";
                    let tempKbds = predStartData['kbds'];
                    options = {
                        "reply_markup": botFuncs.getKbdsReplyMarkup(tempKbds)
                    };
                    await bot.sendMessage(botUser['uid'], tempTgText, options);
                }
                else sendMsg = "*Нет доступа*";
            }
            else if(cmd.match(/presets:(del|to_del|ok_del):([^:]+):?([0-9]*)/))
            {
                let matches = cmd.match(/presets:(del|to_del|ok_del):([^:]+):?([0-9]*)/);
                console.log(matches);
                let mode = matches[1];
                domain = matches[2];
                let cmdPresetId = false;
                if(matches[3] != undefined) cmdPresetId = matches[3];

                tgText = "🗑 *Удаление пресетов*\n\n— Выберите пресеты, которые вы хотите удалить\n\n✅ *Пресеты которые удаляться выделенны галочкой*";

                if(inputData['to_del_presets'] == undefined) inputData['to_del_presets'] = [];

                console.log(inputData['to_del_presets']);

                if(mode == "del") inputData['to_del_presets'] = [];
                if(mode == "to_del" && cmdPresetId !== false) inputData['to_del_presets'].push(cmdPresetId);
                if(mode == "ok_del" && cmdPresetId !== false && inputData['to_del_presets'].length > 0)
                {
                    let toDelIds = inputData['to_del_presets'].join(",");
                    console.log("toDelIds: " + toDelIds);
                    await query("DELETE FROM `presets` WHERE `uId` = ? AND `id` IN (?)", [botUser['id'], toDelIds]);
                    inputData['to_del_presets'] = [];
                }
                
                
                let botUserPresets = await query("SELECT * FROM `presets` WHERE `uId` = ?", [botUser['id']]);

                btns = [];
                let btnLine = {};
                if(!botFuncs.empty(botUserPresets))
                {
                    for(let presetKey in botUserPresets)
                    {
                        let presetData = botUserPresets[presetKey];
                        let emjInBtn = "❌";
                        if(cmdPresetId == presetData['id']) emjInBtn = "✅";
                        btnLine['presets:to_del:' + domain + ':' + presetData['id']] = emjInBtn + " " + presetData['name'];
                        btns.push(btnLine);
                        btnLine = {};
                    }
                }

                btnLine['presets:ok_del:' + domain] = "🗑 Удалить выделенные пресеты";
                btns.push(btnLine);
                btnLine = {};
                btnLine["presets:" + domain] = "◀️ Назад";
                btns.push(btnLine);

            }
            else if(cmd.match(/blacklist([_del]*):(.+)/))
            {
                let matches = cmd.match(/blacklist([_del]*):(.+)/);
                let blackListMsg = botFuncs.getBlackListMsg(botUser, matches);
                botUser = blackListMsg['botUser'];
                tgText = blackListMsg['tgText'];
                btns = blackListMsg['btns'];
            }
            else if(cmd.match(/blacklist_(edit|share):(.+)/))
            {
                let matches = cmd.match(/blacklist_(edit|share):(.+)/);
                console.log(matches);
                let mode = matches[1];
                domain = matches[2];

                btns = [];
                if(mode == "edit")
                {
                    tgText = "✏️ *Редактировать список\n\n— Пример нескольких слов/словосочетаний:*\ndostawa\ntylko ręcznie\n\n💡 *Введите слова/словосочетания при наличии которых Вам не будут выдаваться объявления*";
                    let btnLine = {};
                    btnLine["blacklist:" + domain] = "◀️ Назад";
                    btns.push(btnLine);

                    newUserInput = "blacklist_upd:" + domain;
                }
            }
            else if(cmdKey == "help")
            {
                tgText = cmdData['answer'];
                // btns[btns.length - 1] = {"/start":"◀️ Назад"};
            }
            else if(cmdKey == "video_faq" && cmd == "video_faq_start")
            {
                btns[btns.length - 1] = {"/start":"◀️ Назад"};
            }
            else if(cmdKey == "sets")
            {
                let newBtns = [];
                for(let key in btns)
                {
                    let btnLine = btns[key];
                    if(!botFuncs.empty(btnLine['bot_see']))
                    {
                        if(botFuncs.empty(botUser['settings']['bot_see'])) btns[key]['bot_see'] = botFuncs.preg_replace("/❌/", "✅", btnLine['bot_see']);
                        else btns[key]['bot_see'] = botFuncs.preg_replace("/✅/", "❌", btnLine['bot_see']);
                    }
                    if(!botFuncs.empty(btnLine['limit_bot_see']) && botFuncs.empty(botUser['settings']['bot_see'])) continue;

                    newBtns.push(btns[key]);
                }
                btns = newBtns;
            }
            else if(cmdKey == "conf_ads" || botFuncs.preg_match("/^conf_ads:(.+)/", cmd))
            {
                preg = botFuncs.preg_match("/^conf_ads:(.+)/", cmd);
                if(preg)
                {
                    tgText = cmdsKey['conf_ads']['answer'];
                    let conf_ads_key = preg[1];

                    if(botUser['settings']['conf_ads'][conf_ads_key] != undefined)
                    {
                        if(botFuncs.empty(botUser['settings']['conf_ads'][conf_ads_key])) botUser['settings']['conf_ads'][conf_ads_key] = 1;
                        else botUser['settings']['conf_ads'][conf_ads_key] = 0;
                    }
                }

                let exampleAdText = botFuncs.getAdText(BOTS_CONFIGS['EXAMPLE_AD'], botUser, BOTS_CONFIGS);
                tgText += exampleAdText;
                btns = [];
                for(let lineNum in BOTS_CONFIGS['CONF_ADS_BTNS'])
                {
                    if(btns[lineNum] == undefined) btns[lineNum] = {};
                    let btnsArr = BOTS_CONFIGS['CONF_ADS_BTNS'][lineNum];
                    for(let btnKey in btnsArr)
                    {
                        let btnName = btnsArr[btnKey];
                        let btnEmj = "✅";
                        if(botUser['settings']['conf_ads'] == undefined || botFuncs.empty(botUser['settings']['conf_ads'][btnKey])) btnEmj = "❌";
                        btns[lineNum]["conf_ads:"+btnKey] = btnEmj+" "+btnName;
                    }
                }
                btns.push({"⚙️ Настройки":"◀️ Назад"});
            }
            else if(cmdKey == "bot_see")
            {
                if(!botFuncs.empty(botUser['settings'][cmdKey]))
                {
                    botUser['settings'][cmdKey] = 0;
                }
                else
                {
                    botUser['settings'][cmdKey] = 1;
                    tgText = "❌ Теперь Вам могут попадаться объявления от продавцов, которых видели другие пользователи Бота";
                }

                btns = cmdsKey['sets']['buttons'];
                let newBtns = [];
                for(let key in btns)
                {
                    let btnLine = btns[key];
                    if(!botFuncs.empty(btnLine[cmdKey]))
                    {
                        if(botFuncs.empty(botUser['settings'][cmdKey])) btns[key][cmdKey] = botFuncs.preg_replace("/❌/", "✅", btnLine[cmdKey]);
                        else btns[key][cmdKey] = botFuncs.preg_replace("/✅/", "❌", btnLine[cmdKey]);
                    }
                    if(!botFuncs.empty(btnLine['limit_bot_see']) && botFuncs.empty(botUser['settings'][cmdKey])) continue;

                    newBtns.push(btns[key]);
                }
                btns = newBtns;
            }
            else if(cmdKey == 'topup')
            {
                await query('UPDATE `bot_users` SET `creatingPay` = 0 WHERE `id` = ?', [botUser['id']]);
            }
            else if(cmd.match(/^PAY:(.+)/))
            {
                if(!botUser['creatingPay'])
                {
                    await query('UPDATE `bot_users` SET `creatingPay` = 1 WHERE `id` = ?', [botUser['id']]);
                    // await bot.sendMessage(botUser['uid'], 'Ожидайте...');

                    let preg = cmd.match(/^PAY:(.+)/);
                    let payCoin = preg[1];

                
                    let ratesObj = {};
                    let cryptoBotRatesUrl = CRYPTO_BOT_URL + 'getExchangeRates'
                    await axios.get(cryptoBotRatesUrl, axiosOptions)
                    .then(res =>
                    {
                        if(res.data != undefined && res.data.result != undefined && res.data.result.length > 0)
                        {
                            for(let exchKey in res.data.result)
                            {
                                let exch = res.data.result[exchKey];
                                if(exch['target'] == 'USD' && exch['source'] == payCoin)
                                {
                                    ratesObj[exch['source']] = exch['rate'];
                                    break;
                                }
                            }
                        }
                    })
                    .catch(err =>
                    {
                        sendMsg = 'Не удалось получить курсы валют';
                    });


                    console.log(ratesObj);
                    let topupAmountOrig = inputData['get_add_balance_amount'];
                    let topupAmount = topupAmountOrig;
                    if(ratesObj[payCoin] != undefined && ratesObj[payCoin] > 0) topupAmount = topupAmountOrig / ratesObj[payCoin];

                    console.log(ratesObj[payCoin]);
                    console.log(topupAmount);


                    var getReqData = new URLSearchParams({
                        asset: payCoin,
                        amount: topupAmount,
                    });
                    let cryptoBotUrl = CRYPTO_BOT_URL + 'createInvoice?' + getReqData.toString();
                    console.log(cryptoBotUrl);
                    await axios.get(cryptoBotUrl, axiosOptions)
                    .then(res =>
                    {
                        console.log(res.data)
                        if(res.data != undefined && res.data.result != undefined)
                        {
                            let invoice = res.data.result;
                            if(invoice['pay_url'] != undefined)
                            {
                                tgText = '🤖 [CryptoBot](https://t.me/CryptoBot)\n\n— Сумма: *'+ topupAmountOrig +'*\n— Валюта: *'+ invoice['asset'] +'*\n— Номер счёта: *'+ invoice['invoice_id'] +'*\n\nДля оплаты перейдите в кнопку «💰 *Перейти к оплате*». После оплаты нажмите на кнопку «✅ *Проверить оплату*»\n\n❗️*Если Вы потеряете/удалите данное сообщение - средства будут утеряны и не зачислены на счёт!*';
                                
                                btns = [];
                                let toPayBtn = {};
                                toPayBtn[invoice['pay_url']] = "💰 Перейти к оплате";
                                btns.push(toPayBtn);
                                let checkPayBtn = {};
                                checkPayBtn["chp_" + invoice['invoice_id'] + '_' + botUser['id'] + '_' + topupAmountOrig] = "✅ Проверить оплату";
                                btns.push(checkPayBtn);
            
                            }
                            else sendMsg = 'Error';
                        }
                        else sendMsg = 'Error';
                    }) 
                    .catch(err =>
                    {
                        console.log(err);
                        sendMsg = 'Не удалось создать платеж';
                    });
                    await query('UPDATE `bot_users` SET `creatingPay` = 0 WHERE `id` = ?', [botUser['id']]);
                }
                else sendMsg = 'Wait';
            }
            else if(cmd.match(/^chp_([^_]+)_([0-9]+)_?(.+)/))
            {
                let preg = cmd.match(/^chp_([^_]+)_([0-9]+)_?(.+)/);
                let invoiceId = preg[1];
                let botUserId = preg[2];
                let payedAmount = 0;
                if(preg[3] != undefined) payedAmount = preg[3] * 1;

                if(botUserId * 1 == botUser['id'])
                {
                    let exstPaidInvoice = await query('SELECT * FROM `paid_invoices` WHERE `invoice_id` = ?', [invoiceId]);
                    
                    if(exstPaidInvoice.length == 0)
                    {
                        var getReqData = new URLSearchParams({
                            invoice_ids: invoiceId,
                        });
                        let cryptoBotUrl = CRYPTO_BOT_URL + 'getInvoices?' + getReqData.toString();


                        await axios.get(cryptoBotUrl, axiosOptions)
                        .then(res =>
                        {
                            if(res.data != undefined && res.data.result != undefined)
                            {
                                let invoiceRes = res.data.result;
                                console.log(invoiceRes);
                                if(invoiceRes['items'] != undefined && invoiceRes['items'].length > 0)
                                {
                                    let indInvoice = invoiceRes['items'][0];
                                    if(indInvoice['status'] != undefined && indInvoice['status'] == 'paid')
                                    {
                                        if(exstPaidInvoice.length == 0)
                                        {
                                            if(payedAmount == 0) payedAmount = indInvoice['amount'];
                                            query('INSERT INTO `paid_invoices` SET `invoice_id` = ?, `amount` = ?, `uId` = ?', [indInvoice['invoice_id'], payedAmount, botUser['id']]);
                                            query('UPDATE `bot_users` SET `balance` = `balance` + ? WHERE `id` = ?', [payedAmount * 1, botUser['id']]);

                                            tgText = '✅ Счёт оплачен';
                                            btns = [{"profile": "💼 Профиль"}];

                                            let toChatText = "#Баланс\n["+ botUser['name'] +" "+ botUser['sname'] +"](tg://user?id="+ botUser['uid'] +") пополнил счет на *"+ payedAmount +" $*";
                                            botFuncs.sendPaysToChat(toChatText, bot, PAYS_CHAT_ID);
                                        }
                                        else sendMsg = '⚠️ Счёт уже был оплачен';
                                    }
                                    else sendMsg = '⚠️ Счёт не оплачен';
                                }
                                else sendMsg = '⚠️ Счёт не оплачен';
                            }
                            else sendMsg = 'Error';
                        }) 
                        .catch(err =>
                        {
                            console.log(err);
                            sendMsg = 'Error';
                        });
                    }
                    else sendMsg = '⚠️ Счёт уже был оплачен';
                }
                else sendMsg = 'Access denied';
            }
            else if(isAdmin)
            {
                if(cmd == '🔐 Админка')
                {
                    tgText = cmd;
                    btns = [
                        ["📧 Рассылка", "🛠 Подписки"],
                        ["👥 Пользователи"],
                    ];
                    let btnLine = {};
                    btnLine[PAYS_CHAT_LINK] = "💵 Оплаты";
                    btnLine["🛒 Цены"] = "🛒 Цены";
                    btns.push(btnLine);
                }
                else if(cmd == "📧 Рассылка")
                {
                    tgText = "Рассылки:\n";
                    let allBtns = await botFuncs.getSpamBtns(query);
                    if(allBtns.length > 1)
                    {
                        for(let btnKey in allBtns)
                        {
                            if(btnKey == 0) continue;
                            let btn = allBtns[btnKey];
                            for(let indBtnKey in btn)
                            {
                                let btnText = btn[indBtnKey];
                                tgText += "\n" + btnText;
                            }
                        }
                    }
                    btns = [];
                    btns.push(allBtns[0]);
                    btns.push({"🔐 Админка":"◀️ Назад"});
                }
                else if(cmd == "➕ Создать новую")
                {
                    tgText = 'Отправьте одним сообщением содержимое рассылки (файл + описание или только одно из них)';
                    newUserInput = 'get_spam_msg';
                    btns = [
                        {"📧 Рассылка": "❌ Отменить"},
                    ];
                }
                else if(cmd.match(/send_spam_([0-9]+)/))
                {
                    let copy_mId = cmd.match(/send_spam_([0-9]+)/)[1];

                    let exstSpam = await query("SELECT * FROM `spam` WHERE `mId` = ?", [copy_mId]);
                    if(exstSpam.length == 0)
                    {
                        await query("INSERT INTO `spam` SET `fromChatId` = ?, `mId` = ?", [botUser['uid'], copy_mId]);
                        let exstSpam = await query("SELECT * FROM `spam` WHERE `mId` = ?", [copy_mId]);
                        if(exstSpam.length > 0)
                        {
                            exstSpam = exstSpam[0];
                            tgText = "Рассылка №"+ exstSpam['id'] +" успешно запущена";
                            btns = await botFuncs.getSpamBtns(query);
                            btns.push({"🔐 Админка":"◀️ Назад"});
                        }
                        else tgText = "Не удалось запустить рассылку";
                    }
                    else sendMsg = 'Wait';
                }

                else if(cmd == "🛠 Подписки")
                {
                    tgText = "Отправьте что-то из: *ID, Username, Имя*";
                    newUserInput = "search_user_to_manage";
                    btns = [
                        {"🔐 Админка": "◀️ Назад"},
                    ];
                }
                else if(cmd.match(/^subs_user:([0-9]+)/))
                {
                    let botUserId = cmd.match(/^subs_user:([0-9]+)/)[1];
                    let exstBotUser = await query("SELECT * FROM `bot_users` WHERE `id` = ?", [botUserId]);
                    if(exstBotUser.length > 0)
                    {
                        exstBotUser = exstBotUser[0];
                        let userPayedDomains = {};
                        if(!botFuncs.empty(exstBotUser['payed_domains'])) userPayedDomains = botFuncs.decodeToDb(exstBotUser['payed_domains']);
                        
                        let subsText = "";
                        for(let domain in botDataObj['domains_info'])
                        {
                            let domainInfo = botDataObj['domains_info'][domain];
                            if(userPayedDomains[domain] === undefined || userPayedDomains[domain] < botFuncs.time()) userPayedDomains[domain] = botFuncs.time();
                            if(userPayedDomains[domain] <= botFuncs.time()) subsText += "\n*" + domainInfo['name'] + ":* Отсутсвует";
                            else subsText += "\n*" + domainInfo['name'] + ":* " + botFuncs.normDateFromTime(userPayedDomains[domain]);
                        }
                        
                        tgText = "["+ exstBotUser['name'] +" "+ exstBotUser['sname'] +"](tg://user?id="+ exstBotUser['uid'] +")\n\n*Подписки:*" + subsText;
                        tgText += "\n\n*Баланс:* $" + exstBotUser['balance'];

                        let allTopups = await query("SELECT SUM(amount) AS all_amount FROM `paid_invoices`");
                        allTopups = allTopups[0].all_amount;
                        tgText += "\n*Всего пополнений на сумму:* $" + allTopups;
                        tgText += "\n*Всего потрачено:* $" + (allTopups - exstBotUser['balance']).toFixed(2);
                        
                        btns = [];
                        let btnLine = {};
                        btnLine["del_sub:" + exstBotUser['id']] = "✖️ Забрать подписку";
                        btns.push(btnLine);
                        btnLine = {};
                        btnLine["add_sub:" + exstBotUser['id']] = "➕ Добавить подписку";
                        btns.push(btnLine);
                        btnLine = {};
                        btnLine["del_hours:" + exstBotUser['id']] = "🕟 Забрать часы";
                        btns.push(btnLine);
                        btnLine = {};
                        btnLine["add_hours:" + exstBotUser['id']] = "➕ Добавить часы";
                        btns.push(btnLine);
                        btns.push({"🔐 Админка":"❌ Отменить"});
                    }
                    else answCallText = "Пользователь не найден в базе";
                }
                else if(cmd.match(/^(del|add)_(sub|hours):([0-9]+)/))
                {
                    let matches = cmd.match(/^([^_]+)_([^:]+):([0-9]+)/);
                    let addOrDel = matches[1];
                    let subOrHours = matches[2];
                    let botUserId = matches[3];

                    tgText = "*Выберите сервис:*";
                    btns = [];
                    let btnLine = {};
                    btnLine['sub:' + addOrDel + ':'+ subOrHours +':'+ botUserId +':vinted'] = "VINTED";
                    btnLine['sub:' + addOrDel + ':'+ subOrHours +':'+ botUserId +':etsy'] = "ETSY";
                    btns.push(btnLine);
                    btnLine = {};
                    btnLine['sub:' + addOrDel + ':'+ subOrHours +':'+ botUserId +':subito.it'] = "🇮🇹 SUBITO.IT";
                    btns.push(btnLine);
                    btnLine = {};
                    btnLine['subs_user:'+ botUserId] = "◀️ Назад";
                    btns.push(btnLine);
                }
                else if(cmd.match(/^sub:([^:]+):([^:]+):([0-9]+):([^:]+)/))
                {
                    let matches = cmd.match(/^sub:([^:]+):([^:]+):([0-9]+):([^:]+)/);
                    let addOrDel = matches[1];
                    let subOrHours = matches[2];
                    let botUserId = matches[3];
                    let domain = matches[4];

                    let exstBotUser = await query("SELECT * FROM `bot_users` WHERE `id` = ?", [botUserId]);
                    if(exstBotUser.length > 0)
                    {
                        exstBotUser = exstBotUser[0];
                        let userPayedDomains = {};
                        if(!botFuncs.empty(exstBotUser['payed_domains'])) userPayedDomains = botFuncs.decodeToDb(exstBotUser['payed_domains']);

                        if(subOrHours == "sub")
                        {
                            if(addOrDel == "del") userPayedDomains[domain] = 0;
                            else if(addOrDel == "add")
                            {
                                newUserInput = "get_days_to_add:" + botUserId + ":" + domain;
                                tgText = "*Введите кол-во дней, которое необходимо добавить пользователю:*";
                            }
                        }
                        else if(subOrHours == "hours")
                        {
                            if(addOrDel == "del")
                            {
                                newUserInput = "get_hours_to_del:" + botUserId + ":" + domain;
                                tgText = "*Введите кол-во часов, которое необходимо ЗАБРАТЬ у пользователя:*";
                            }
                            else if(addOrDel == "add")
                            {
                                newUserInput = "get_hours_to_add:" + botUserId + ":" + domain;
                                tgText = "*Введите кол-во часов, которое необходимо добавить пользователю:*";
                            }
                        }

                        if(newUserInput.length == 0)
                        {
                            tgText = "*Успешно!*";
                            await query("UPDATE `bot_users` SET `payed_domains` = ? WHERE `id` = ?", [botFuncs.encodeToDb(userPayedDomains), botUserId]);
                        }
                        btns = [];
                        let btnLine = {};
                        btnLine['subs_user:'+ botUserId] = "◀️ К пользователю";
                        btns.push(btnLine);
                    }
                    else answCallText = "Пользователь не найден в базе";
                }

                else if(cmd == "👥 Пользователи" || cmd.match(/^adm_users:page:([0-9]+)/))
                {
                    let matches = cmd.match(/^adm_users:page:([0-9]+)/);

                    let allBotUsers = await query("SELECT COUNT(*) AS count FROM `bot_users`");
                    let allBotUsersCount = allBotUsers[0].count;
                    let allTopups = await query("SELECT SUM(amount) AS all_amount FROM `paid_invoices`");

                    let page = 1;
                    if(matches) page = matches[1] * 1;
                    if(page < 1) page = 1;
                    let onePage = 10;
                    let maxPage = Math.ceil(allBotUsersCount / onePage);
                    let offset = (page - 1) * onePage;
                    let backPage = page - 1;
                    if(backPage < 1) backPage = maxPage;
                    let nextPage = page + 1;
                    if(nextPage > maxPage) nextPage = 1;

                    tgText = "*Всего пользователей:* " + allBotUsersCount;
                    tgText += "\n*Всего пополнений:* $" + allTopups[0].all_amount;
                    btns = [];

                    let botUsers = await query("SELECT * FROM `bot_users` ORDER BY `id` DESC LIMIT ? OFFSET ?", [onePage, offset]);
                    if(botUsers.length > 0)
                    {
                        let btnLine = {};
                        for(let botUserKey in botUsers)
                        {
                            btnLine = {};
                            let botUserInd = botUsers[botUserKey];
                            if(botUserInd['username'].length == 0) botUserInd['username'] = "-";
                            else botUserInd['username'] = "@" + botUserInd['username'];
                            btnLine['subs_user:' + botUserInd['id']] = botUserInd['username'] + " | " + botUserInd['name'] + " " + botUserInd['sname'] + " | $" + botUserInd['balance'];
                            btns.push(btnLine);
                        }
                        btnLine = {};
                        btnLine['adm_users:page:' + backPage] = "⬅️";
                        btnLine['adm_users:page:'] = page + "/" + maxPage;
                        btnLine['adm_users:page:' + nextPage] = "➡️";
                        btns.push(btnLine);
                        btns.push({"search_users":"🔍 Поиск"});
                    }
                    btns.push({"🔐 Админка": "◀️ Назад"});
                }
                else if(cmd == "search_users")
                {
                    tgText = "Введите что-то одно из: *ID, Username, Имя*";
                    newUserInput = "get_search_users";
                    btns = [
                        {"👥 Пользователи": "❌ Отменить действие"},
                    ];
                }

                else if(cmd == "🛒 Цены")
                {
                    tgText = "*В каком сервисе поменять цены?*";
                    btns = [
                        {"change_price:vinted":"VINTED", "change_price:etsy":"ETSY"},
                        {"change_price:subito.it":"🇮🇹 SUBITO.IT"},
                        {"🔐 Админка": "◀️ Назад"},
                    ];
                }
                else if(cmd.match(/^change_price:([^:]+)/))
                {
                    let domain = cmd.match(/^change_price:([^:]+)/);
                    domain = domain[1];
                    // let domainName = domain.replace(/\.[^:]+/, "");

                    if(SETTINGS[domain + "_prices"] != undefined)
                    {
                        tgText = "*Выберите:*";
                        let newBtns = [];
                        for(let dayToPay in daysToPay)
                        {
                            let dayToPayVal = daysToPay[dayToPay];
                            let btnLine = {};
                            btnLine['change_ind_price:'+ dayToPay +':' + domain] = dayToPay +" "+ dayToPayVal +" ["+ SETTINGS[domain + "_prices"][dayToPay + "_day"] +" $]";
                            newBtns.push(btnLine);
                        }
                        newBtns.push({"🛒 Цены": "◀️ Назад"});
                        btns = newBtns;
                    }
                    else answCallText = "Сервис не найден в базе";
                }
                else if(cmd.match(/^change_ind_price:([^:]+):([^:]+)/))
                {
                    console.log('here 32243232');
                    let matches = cmd.match(/^change_ind_price:([^:]+):([^:]+)/);
                    let dayToPay = matches[1];
                    let domain = matches[2];

                    if(SETTINGS[domain + "_prices"] != undefined)
                    {
                        tgText = "*Введите новую цену:*";
                        newUserInput = "get_ind_price_val:" + dayToPay + ":" + domain;
                        let btnLine = {};
                        btnLine['change_price:' + domain] = "◀️ Назад";
                        btns = [btnLine];
                    }
                    else answCallText = "Сервис не найден в базе";
                }
            }
            else if(botUser['new_user']) tgText = "Привет! "+ tgText;

            await query("UPDATE `bot_users` SET `input` = ?, `input_data` = ?, `settings` = ?, `domains_settings` = ? WHERE `id` = ?",
                        [newUserInput, botFuncs.encodeToDb(inputData), botFuncs.encodeToDb(botUser['settings']), botFuncs.encodeToDb(botUser['domains_settings']), botUser['id']]);

            if(btns.length > 0)
            {
                options = {
                    "reply_markup": botFuncs.getBtnsReplyMarkup(btns)
                }
            }
            else if(kbds.length > 0)
            {
                options = {
                    "reply_markup": botFuncs.getKbdsReplyMarkup(kbds)
                }
            }

            options['parse_mode'] = "markdown";
            options['disable_web_page_preview'] = true;
            options['message_id'] = mId;
            options['chat_id'] = botUser['uid'];

            if(delMsg == true) bot.deleteMessage(botUser['uid'], mId);
            
            if(tgText !== false)
            {
                tgText = botFuncs.preg_replace("/{limit_bot_see}/", botUser['settings']['limit_bot_see'], tgText);
                tgText = botFuncs.preg_replace("/{ads_send_max_count}/", botUser['settings']['ads_send_max_count'], tgText);
                tgText = botFuncs.preg_replace("/{balance}/", botUser['balance'], tgText);

                if(answCallText !== false) bot.answerCallbackQuery(callId, {text: answCallText, show_alert: true});
                else
                {
                    bot.answerCallbackQuery(callId);

                    console.log(sendMsg, delMsg, cmdsKey[cmd], cmdData);
                    // console.log(answerType);
                
                    if(sendMsg == false || (sendMsg !== false && delMsg == true) || !botFuncs.empty(cmdsKey[cmd]) || (sendMsg != false && cmdData['file'] !== undefined))
                    {
                        let cmdAnswer = cmdData['answer'];
                        let answerType = cmdData['answer_type'];
                        if(delMsg && sendMsg !== false || (sendMsg != false && cmdData['file'] !== undefined))
                        {
                            cmdAnswer = sendMsg;
                            answerType = "sendVideo";
                        }

                        if(cmdData['file'] !== undefined)
                        {
                            if(cmdAnswer !== undefined) options['caption'] = cmdAnswer;
                            console.log(options);
                            if(cmdData['file'].match(/mp4/i))
                            {
                                if(answerType !== undefined)
                                {
                                    let sendFile = botFuncs.getSendTgFile(REAL_PATH + cmdData['file'], FILESID_FILE);

                                    let sendResInd;
                                    if(answerType == "sendVideo") sendResInd = await bot.sendVideo(botUser['uid'], sendFile, options);

                                    if(!botFuncs.empty(sendResInd))
                                    {
                                        let fileTypeArr = ["document", "photo", "video"];
                                        for(let fileTypeKey in fileTypeArr)
                                        {
                                            let fileType = fileTypeArr[fileTypeKey];
                                            if(sendResInd[fileType] == undefined) continue;
                
                                            if(!botFuncs.empty(sendResInd[fileType]))
                                            {
                                                if(!botFuncs.empty(sendResInd[fileType]['file_id']) && !botFuncs.empty(sendResInd[fileType]['file_name']))
                                                {
                                                    botFuncs.putFileFileIds(REAL_PATH +"bot_files/"+ sendResInd[fileType]['file_name'], sendResInd[fileType]['file_id'], FILESID_FILE);
                                                }
                                                if(!botFuncs.empty(sendResInd[fileType][0]) && !botFuncs.empty(sendResInd[fileType][0]['file_id']) && !botFuncs.empty(sendResInd[fileType][sendResInd[fileType].length - 1]['file_name']))
                                                {
                                                    botFuncs.putFileFileIds(REAL_PATH +"bot_files/"+ sendResInd[fileType][sendResInd[fileType].length - 1]['file_name'], sendResInd[fileType][sendResInd[fileType].length - 1]['file_id'], FILESID_FILE);
                                                }
                                            }
                                        }
                                    }
                                }
                                else
                                {
                                    // if(botFuncs.empty(tgText)) return;

                                    if(botFuncs.empty(newMsg['text'])) bot.editMessageCaption(tgText, options);
                                    else if(!botFuncs.empty(newMsg['text'])) bot.editMessageText(tgText, options);
                                    else if(!botFuncs.empty(tgText)) bot.sendMessage(botUser['uid'], tgText, options);
                                }
                            }
                        }
                        else
                        {
                            if(botFuncs.empty(tgText)) return;

                            if(!botFuncs.empty(newMsg['caption'])) bot.editMessageCaption(tgText, options);
                            else if(!botFuncs.empty(newMsg['text'])) bot.editMessageText(tgText, options);
                            else if(!botFuncs.empty(tgText)) bot.sendMessage(botUser['uid'], tgText, options);
                        }
                    }
                    else
                    {
                        if(botFuncs.empty(cmdsKey[cmd]) && botFuncs.empty(sendMsg)) sendMsg = tgText;
                        if(!botFuncs.empty(sendMsg)) bot.sendMessage(botUser['uid'], sendMsg, options);
                    }
                }
            }
        }
        


        // let res = await bot.sendMessage(botUser['uid'], `Вы запустили бота!`);
        
    }
    catch(error)
    {
        console.log(error);
    }

});





















