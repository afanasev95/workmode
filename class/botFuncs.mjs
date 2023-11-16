import fs from 'fs'

export default class botFuncsAll
{
    constructor()
    {
    }
    
    encodeToDb = (val) =>
    {
        val =  JSON.stringify(val);
        return encodeURIComponent(val);
    }
    decodeToDb = (val) =>
    {
        try
        {
            if(this.tryJSON(val)) return JSON.parse(val);

            val = decodeURIComponent(val);
            return JSON.parse(val);
        }
        catch(e)
        {
            return JSON.parse(val);
        }
    }
    tryJSON = (tjsn) =>
    {
        try
        {
            return JSON.parse(tjsn);
        }
        catch(e)
        {
            return false
        }
    }
    exstFile = (fileName) => 
    {
        try
        {
            fs.readFileSync(fileName);
            return true;
        }
        catch
        {
            return false;
        }
    }
    getFile = (fileName) => 
    {
        return fs.readFileSync(fileName, "utf8");
    }
    getJson = (fileName) => 
    {
        return JSON.parse(this.getFile(fileName));
    }
    delFile = async (fileName) => 
    {
        if(this.exstFile(fileName)) fs.unlink(fileName, function (err) {
            if (err) throw err;
            console.log('File deleted!');
          });
    }
    writeFile = async (fileName, content) => 
    {
        return fs.writeFileSync(fileName, content)
    }
    writeJson = (fileName, arr) => 
    {
        return this.writeFile(fileName, JSON.stringify(arr))
    }
    getFileFileIds(file = '', filesFile)
    {
        let fileIds = {};
        if(!this.exstFile(filesFile))
        {
            this.writeJson(filesFile, fileIds);
        }
        else fileIds = this.getJson(filesFile);

        
        if(!this.empty(fileIds[file])) return fileIds[file];
        else return "";
    }
    putFileFileIds = (file = '', fileId = '', filesFile) =>
    {
        let fileIds = {};
        if(this.exstFile(filesFile)) fileIds = this.getJson(filesFile);
        
        if(!this.empty(fileIds[file])) return;

        fileIds[file] = fileId;
        this.writeJson(filesFile, fileIds);
    }
    getSendTgFile = (file = '', filesFile) =>
    {
        let fileId = this.getFileFileIds(file, filesFile);
        if(!this.empty(fileId)) return fileId;
        else return file;
    }
    strtotime = (str) =>
    {
        let time = Date.parse(str);
        if(time > 0) return Math.round(time / 1000 + 3600 * 3);
        else return false;
    }
    strtotime_parsed = (str) =>
    {
        str = str.replace(/^([0-9]{1,2})-([0-9]{1,2})/g, "$2-$1");
        str = str.replace(/-/g, ".");
        let time = Date.parse(str);
        if(time > 0) return Math.round(time / 1000);
        else return false;
    }
    time = () =>
    {
        return Math.round(new Date().getTime() / 1000);
    }
    date_from_time = (time) =>
    {
        let date = new Date((time + 3600 * 3) * 1000);
        let monthsArr = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

        let hours = date.getHours();
        if(hours < 10) hours = "0" + hours;
        let minutes = date.getMinutes();
        if(minutes < 10) minutes = "0" + minutes;

        return date.getDate()+" "+ monthsArr[date.getMonth()] +" "+ hours +":"+ minutes;
    }
    nowDate = () =>
    {
        let date = new Date();

        let month = date.getMonth();
        month++;
        if(month < 10) month = "0" + month;
        // let hours = date.getHours();
        // if(hours < 10) hours = "0" + hours;
        // let minutes = date.getMinutes();
        // if(minutes < 10) minutes = "0" + minutes;

        return date.getDate() +"-"+ month +"-"+ date.getFullYear();
    }
    nowDateFromTime = (time) =>
    {
        let date = new Date((time + 3600 * 3) * 1000);

        let month = date.getMonth();
        month++;
        if(month < 10) month = "0" + month;

        return date.getDate()+"-"+ month +"-"+ date.getFullYear();
    }
    normDateFromTime = (time) =>
    {
        let date = new Date((time + 3600 * 3) * 1000);

        let days = date.getDate();
        if(days < 10) days = "0" + days;
        let month = date.getMonth();
        month++;
        if(month < 10) month = "0" + month;
        let hours = date.getHours();
        if(hours < 10) hours = "0" + hours;
        let minutes = date.getMinutes();
        if(minutes < 10) minutes = "0" + minutes;

        return days + "." + month + "." + date.getFullYear() + " " + hours + ":" + minutes;
    }
    botDateFromTime = (time) =>
    {
        let date = new Date(time * 1000);

        let days = date.getDate();
        if(days < 10) days = "0" + days;
        let month = date.getMonth();
        month++;
        if(month < 10) month = "0" + month;
        let hours = date.getHours();
        if(hours < 10) hours = "0" + hours;
        let minutes = date.getMinutes();
        if(minutes < 10) minutes = "0" + minutes;

        return date.getFullYear() +"-"+ month +"-"+ days + " " + hours + ":" + minutes + ":00";
    }
    getKbdsReplyMarkup = (kbds) =>
    {
        return {
            "resize_keyboard": true,
            "one_time_keyboard": false,
            "keyboard": kbds
        }
    }
    getBtnsReplyMarkup = (btns) =>
    {
        btns = this.kbds2Btns(btns);
        return {
            "inline_keyboard": btns
        }
    }
    empty = (val) => 
    {
        if(val == undefined || val == null || val.length == 0 || val == 0) return true;
        else return false;
    }
    in_array = (needle, haystack) =>
    {
        var length = haystack.length;
        for(var i = 0; i < length; i++) {
            if(haystack[i] == needle) return true;
        }
        return false;
    }
    isNumeric = (str) => 
    {
        if (typeof str == "number") return true;
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }
    isInt = (str) => 
    {
        if (typeof str == "number") return true;
        if (typeof str != "number" && typeof str != "string") return false;
        if(str.match(/[\.,]+/)) return false;
        if(str.match(/[^0-9]+/)) return false;

        return true;
    }
    array_merge = (array1, array2) => 
    {
        return [...array1, ...array2];
    }
    cmdsToKey = (commands) => 
    {
        let res = {};
        for (let key in commands)
        {
            let cmdF = commands[key]
            if(cmdF['buttons'] != undefined)
            {
                // console.log('buttons');
                // console.log(cmdF['buttons']);
            }
            let cmdKeyF = cmdF['command'];
            if(!this.empty(cmdF['cmd_key']))
            {
                cmdKeyF = cmdF['cmd_key'];
            }
            // console.log(cmdKeyF);

            let command = cmdF['command'];
            if(command.constructor === Array)
            {
                for(let indCommandKey in command)
                {
                    let indCommand = command[indCommandKey];
                    cmdF['command'] = indCommand;
                    res[indCommand] = cmdF;
                }
                cmdF['command'] = cmdKeyF;
                res[cmdKeyF] = cmdF;
            }
            else
            {
                res[cmdF['command']] = cmdF;
                res[cmdKeyF] = cmdF;
            }
        }
        return res;
    }
    preg_match = (pattern, string) =>
    {
        pattern = pattern.replace(/^\//, '');
        pattern = pattern.replace(/\//, '');
        let matches = string.match(new RegExp(pattern))
        if(!matches) return false;
        else return matches;
    }
    preg_replace = (pattern, replace, string) =>
    {
        pattern = pattern.replace(/^\//, '');
        pattern = pattern.replace(/\//, '');
        return string.replace(new RegExp(pattern), replace);
    }
    kbds2Btns = (kbds) =>
    {
        let btns = [];
        if(!this.empty(kbds))
        {
            for(let btnLineKey in kbds)
            {
                let btnLine = kbds[btnLineKey];
                let btnsLine = [];
                for(let btnKey in btnLine)
                {
                    let btn = btnLine[btnKey];
                    let btnCmd = btnKey;
                    let key = "callback_data";

                    if(this.preg_match("/^https:\/\//", btnKey))
                    {
                        key = "url";
                        btnCmd = btnKey;
                    }
                    else if(parseInt(btnKey) >= 0)
                    {
                        btnCmd = btnLine[btnKey];
                    }
                    
                    let indBtn = {};
                    indBtn[key] = btnCmd;
                    indBtn['text'] = btn;
                    btnsLine.push(indBtn);
                }
                btns.push(btnsLine);
            }
        }
        return btns;
    }
    getAdText = (ad = {}, botUser = {}, BOTS_CONFIGS) =>
    {
        if(this.empty(ad)) return "empty ad";

        let resText = "\n";
        for(let key in ad)
        {
            let valData = ad[key];
            if(botUser['settings']['conf_ads'] != undefined && botUser['settings']['conf_ads'][key] != undefined && this.empty(botUser['settings']['conf_ads'][key])) continue;
            if((botUser['settings']['conf_ads'] == undefined || this.empty(botUser['settings']['conf_ads']['dop'])) && this.in_array(key, BOTS_CONFIGS['DOP_KEYS'])) continue;
            
            if(valData.constructor === Object || valData.constructor === Array)
            {
                for(let title in valData)
                {
                    let val = valData[title];
                    if(!this.preg_match("/^https:/", val)) resText += "\n"+ title +" "+ val;
                    else resText += "\n📌 ["+ title +"]("+ val +")";
                }
            }
            else resText += valData;
        }
        resText = this.preg_replace("/\n{3,}/", "\n\n", resText);
        return resText;
    }

    getSpamBtns = async (query) => 
    {
        let btns = [
            ["➕ Создать новую"],
        ];
        let exstSpams = await query("SELECT * FROM `spam` ORDER BY `id` DESC");
        console.log(exstSpams);
        if(exstSpams.length > 0)
        {
            for(let spamKey in exstSpams)
            {
                let spam = exstSpams[spamKey];
                let spamBtnLine = {};
                let spamStatus = 'Завершена';
                if(spam['status'] == 'new') spamStatus = 'В очереди';
                else if(spam['status'] != 'end') spamStatus = 'В процессе';
                spamBtnLine['spam_' + spam['id']] = "Рассылка №"+ spam['id'] +" ("+ spamStatus +")";
                btns.push(spamBtnLine);
            }
        }
        return btns;
    }

    getSettings = async (query) => 
    {
        let settings = {};
        let dbSettings = await query("SELECT * FROM `sets`");
        if(dbSettings.length > 0)
        {
            for(let setKey in dbSettings)
            {
                let set = dbSettings[setKey];
                let jsonVal = this.tryJSON(set['val']);
                if(jsonVal !== false) set['val'] = jsonVal;
                settings[set['key']] = set['val'];
        
            }
        }
        return settings;
    }

    getBlackListMsg = (botUser, matches, cmd = '') =>
    {
        console.log(matches);
        let mode = matches[1];
        let domain = matches[2];

        if(botUser['domains_settings'][domain] == undefined) botUser['domains_settings'][domain] = {};
        if(botUser['domains_settings'][domain]['blacklist'] == undefined) botUser['domains_settings'][domain]['blacklist'] = "";

        if(mode == "_del") botUser['domains_settings'][domain]['blacklist'] = "";
        else if(mode == "upd")
        {
            botUser['domains_settings'][domain]['blacklist'] = cmd;
        }

        let blackList = "Отсутствуют";
        if(!this.empty(botUser['domains_settings'][domain]['blacklist'])) blackList = botUser['domains_settings'][domain]['blacklist'];

        let tgText = "🚫 *Черный список слов*\n\n— Черный список слов исключает из выдачи объявления в которых встречаются слова из списка\n\n📌 *Ваш список слов:*\n" + blackList;

        let btns = [];
        let btnLine = {};
        btnLine['blacklist_edit:' + domain] = "✏️ Редактировать список";
        btns.push(btnLine);
        btnLine = {};
        btnLine['blacklist_del:' + domain] = "🗑 Удалить список";
        btns.push(btnLine);
        btnLine = {};
        btnLine['blacklist_share:' + domain] = "📪 Поделиться списоком слов";
        btns.push(btnLine);
        btnLine = {};
        btnLine[domain] = "◀️ Назад";
        btns.push(btnLine);

        return {'tgText':tgText, 'btns':btns, 'botUser':botUser};
    }

    getSearchStartedText = async (query, domain, links, inputData, botUser) =>
    {
        // let preset = inputData['start_parsing_data'][domain];
        let preset = inputData['start_parsing_data'];
        let parse_type = '';
        if(preset['parsing_type'] !== undefined)
        {
            parse_type = preset['parsing_type'];
            if(parse_type == "Фоновый") parse_type = "in_back";
            else parse_type = "pages";
        }

        await query("INSERT INTO `searchs` SET `u_id` = ?, `uId` = ?, `domain` = ?, `preset` = ?, `links` = ?, `parse_type` = ?, `createTime` = ?",
                    [botUser['uid'], botUser['id'], domain, this.encodeToDb(preset), this.encodeToDb(links), parse_type, this.time()]);
        
        let search = await query("SELECT * FROM `searchs` WHERE `uId` = ? ORDER BY `id` DESC LIMIT 1", [botUser['id']]);
        search = search[0];
        search['preset'] = this.decodeToDb(search['preset']);

        let sendMsg = "🔎 *Поиск объявлений запущен*\n\nℹ️ *Фильтры:*\n📃 Кол-во объявлений: *"+ search['preset']['max_active_ads_of_seller'] +"*";

        if(domain.match(/subito/)) sendMsg += "\n📅 Дата регистрации: *2022*";

        sendMsg += "\n🕜 Дата публикации: *"+ search['preset']['min_date_pub_ad'] +"*";

        if(domain.match(/vinted/)) sendMsg += "\n⭐ Кол-во комментариев: *"+ search['preset']['max_comments_of_seller'] +"*\n🔎 Способ парсинга: *"+ search['preset']['parsing_type'] +"*";
        if(domain.match(/subito/)) sendMsg += "\n⭐ Без рейтинга: *Нет*";

        search['links'] = this.decodeToDb(search['links']);
        links = search['links'].join("\n");
        sendMsg += "\n\n🔗 *Ссылки:*\n" + links;

        return sendMsg;
    }

    getSearchPredStartData = (domain, BOTS_CONFIGS, needFullText = false) =>
    {
        let sendMsgStart = "🔎 *Запуск поиска объявлений*\n\n";
        let tempKbds = [["🗂 Вставить ссылки из прошлого парсинга"]];
        let btns = [];
        let sendMsg = "— Пример: *"+ BOTS_CONFIGS['domains_info'][domain]['cat_link_example'] +"*\n\n💡 *Введите ссылки на категории или ключевые слова[Max: 10]*";
        
        if(BOTS_CONFIGS['domains_info'][domain]['cats_links'] != undefined)
        {
            let btnLine = {};
            let forNum = 0;
            for(let catName in BOTS_CONFIGS['domains_info'][domain]['cats_links'])
            {
                forNum++;
                btnLine["cat_links:"+ domain +":" + catName] = catName;
                if(forNum == 2)
                {
                    btns.push(btnLine);
                    btnLine = {};
                    forNum = 0;
                }
            }
            btns.push({"cancel":"❌ Отменить действие"});
        }

        if(needFullText) sendMsg = sendMsgStart + sendMsg;

        return {"kbds":tempKbds, "btns":btns, "sendMsg":sendMsg, "newUserInput":"start_parsing:"+ domain +":get_cat_links"};
    }

    sendPaysToChat = (text, bot, PAYS_CHAT_ID) => 
    {
        bot.sendMessage(PAYS_CHAT_ID, text, {parse_mode:"Markdown"});
    }


    getManyServicesBtns = (BOTS_CONFIGS, domainName, dopCmd = '') =>
    {
        let btns = [];
        let btnLine = {};
        let forNum = 1;
        for(let zoneKey in BOTS_CONFIGS['zones'][domainName]['zones'])
        {
            let zoneData = BOTS_CONFIGS['zones'][domainName]['zones'][zoneKey];
            let domain = domainName + "." + zoneKey
            let domainBig = domain.toUpperCase();
            btnLine[dopCmd + domain] = zoneData['emj'] + " "+ domainBig;

            if(forNum % 2 == 0)
            {
                btns.push(btnLine);
                btnLine = {};
            }
            forNum++;
        }
        if(Object.keys(btnLine).length !== 0) btns.push(btnLine);

        return btns;
    }
}