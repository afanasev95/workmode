export let botDataObj = {}
export default { variableName: botDataObj } 


botDataObj["BOT_ADMINS"] = [1634278303, 5647945663];
botDataObj['BOT_NAME'] = "Air Team Parser";
botDataObj['BOT_USERNAME'] = "workmodenodebot";
botDataObj['menu_gif'] = "menu_gif.MP4";


botDataObj['hours_to_inviter'] = {
    1:4,
    3:14,
    7:28,
    31:80,
};
botDataObj['channel'] = "";

const ZONES = {

    "vinted": {
        "dop_info": {
            "head_text": "*▶ Фильтры площадки:*\n— Кол-во объявлений у продавца\n— Дата публикации товара\n— Кол-во комментариев у продавца\n— Выбор домена\n\n💰 *Ваш баланс: {balance}*",
            "cat_link_example": "https://www.{fullDomain}/catalog?search_text=&catalog[]=1918",
            "cats_links":{
                "Home":"https://www.{fullDomain}/catalog/1918-home",
                "Entertainment":"https://www.{fullDomain}/catalog/2309-entertainment",
                "Men":"https://www.{fullDomain}/catalog/5-men",
                "Woman":"https://www.{fullDomain}/catalog/1904-women",
            }
        },
        "zones":{
            "pl": {
                "emj":"🇵🇱",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"Польша",
                "country_1":"Польше", // Время в ...
            },
            "fr": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "at": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "cz": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "be": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "de": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "it": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "lt": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "lu": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "es": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "sk": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "nl": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "co.uk": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "pt": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "com": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "hu": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "se": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ro": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "dk": {
                "emj":"",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"",
                "country_1":"", // Время в ...
            },
        }
    },
    "subito": {
        "dop_info": {
            "head_text": "*▶ Фильтры площадки:*\n— Кол-во объявлений у продавца\n— Дата регистрации продавца\n— Дата публикации товара\n— Исключение продавцов с рейтингом\n\n💰 *Ваш баланс: {balance}*",
            "cat_link_example": "https://www.{fullDomain}/annunci-italia/vendita/arredamento-casalinghi/?advt=0",
            "cats_links":{
                "🪑 Мебель":"https://www.{fullDomain}/annunci-italia/vendita/arredamento-casalinghi/?advt=0",
                "📷 Электроника":"https://www.{fullDomain}/annunci-italia/vendita/elettronica/?advt=0",
                "📱 Телефоны":"https://www.{fullDomain}/annunci-italia/vendita/telefonia/?advt=0",
                "🏡 Сад":"https://www.{fullDomain}/annunci-italia/vendita/giardino-fai-da-te/?advt=0",
            }
        },
        "zones":{
            "it": {
                "emj":"🇮🇹",
                "time_zone":-3600,
                "time_zone_plus": 3600 * 0,
                "country":"Италия",
                "country_1":"Италии", // Время в ...
            }
        }
    },
    // "etsy": ["at","au","be","th","ch","de","es","fr","hk","hu","id","ie","it","lt","lv","ma","nl","pl","pt","ro","se","tr","uk","us","gr","il","my","cn","ca","eu",],

    "etsy": {
        "dop_info": {
            "head_text": "??",
            "cat_link_example": "https://www.etsy.com/c/electronics-and-accessories",
            "cats_links":{
                "Clothing":"https://www.etsy.com/c/clothing",
                "Electronics & Accessories":"https://www.etsy.com/c/electronics-and-accessories",
                "Shoes":"https://www.etsy.com/c/shoes",
                "Accessories":"https://www.etsy.com/c/accessories",
            }
        },
        "zones":{
            "at": {
                "emj":"🇦🇹",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"Австрия",
                "country_1":"Австрии", // Время в ...
            },
            "au": {
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "at":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "au":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "be":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "th":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ch":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "de":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "es":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "fr":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "hk":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "hu":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "id":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ie":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "it":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "lt":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "lv":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ma":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "nl":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "pl":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "pt":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ro":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "se":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "tr":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "uk":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "us":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "gr":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "il":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "my":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "cn":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "ca":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
            "eu":{
                "emj":"",
                "time_zone": -3600,
                "time_zone_plus": 0,
                "country":"",
                "country_1":"", // Время в ...
            },
        }
    }
};
botDataObj['zones'] = ZONES;

botDataObj['domains_info'] = {};


for(let domainKey in ZONES)
{
    // console.log(ZONES);
    var domainDopInfoNew;
    var domainData = {};
    for(let zonesObjKey in ZONES[domainKey]['zones'])
    {
        domainData = {};
        // console.log(zonesObjKey);
        let fullDomain = domainKey + '.' + zonesObjKey;
        let fullDomainBig = fullDomain.toUpperCase();

        domainDopInfoNew = {};
        // console.log(domainDopInfoNew);
        domainDopInfoNew = ZONES[domainKey]['dop_info'];
        // console.log(domainDopInfoNew);


        // let cat_link_example = ZONES[domainKey]['dop_info']['cat_link_example'];
        // console.log(ZONES[domainKey]['dop_info']['cat_link_example']);
        // domainDopInfoNew['cat_link_example'] = cat_link_example.replace(/\{fullDomain\}/, fullDomain);
        // console.log(ZONES[domainKey]['dop_info']['cat_link_example']);

        for(let domainDopInfoNewKey in domainDopInfoNew)
        {
            if(typeof domainDopInfoNew[domainDopInfoNewKey] === "string")
            {
                // console.log('ZONES:');
                // console.log(ZONES);
                // console.log('ZONES END');
                domainDopInfoNew[domainDopInfoNewKey] = ZONES[domainKey]['dop_info'][domainDopInfoNewKey].replace(/\{fullDomain\}/, fullDomain);
            }
            
            if(domainDopInfoNewKey == "cats_links" && ZONES[domainKey]['dop_info'][domainDopInfoNewKey] !== undefined)
            {
                for(let domainDopInfoNewKey2 in ZONES[domainKey]['dop_info'][domainDopInfoNewKey])
                {
                    domainDopInfoNew[domainDopInfoNewKey][domainDopInfoNewKey2] = ZONES[domainKey]['dop_info'][domainDopInfoNewKey][domainDopInfoNewKey2].replace(/\{fullDomain\}/, fullDomain);
                }
            }
        }

        let objZones = ZONES[domainKey]['zones'][zonesObjKey];
        Object.assign(domainData, objZones, domainDopInfoNew);

        domainData["name"] = ZONES[domainKey]['zones'][zonesObjKey]['emj'] + " " + fullDomainBig;
        domainData["name_link"] = ZONES[domainKey]['zones'][zonesObjKey]['emj'] + " ["+ fullDomainBig +"](https://"+ fullDomain +")";
        botDataObj['domains_info'][fullDomain] = domainData;

    }

};

// console.log(botDataObj['domains_info']);

botDataObj['BOT_USERS_DEF_SETS'] = {
    "bot_see": 1,
    "limit_bot_see": 100,
    "ads_send_max_count": 50,
    "conf_ads": {
        "photo": 1,
        "seller_name": 1,
        "price": 1,
        "location": 1,
        "desc": 1,
        "item_name": 1,
        "pub_date": 1,
        "seller_reg_date": 1,
        "seller_ads_count": 1,
        "ad_views_count": 1,
        "dop": 1,
        "files_info": 1,
    }
};
botDataObj['DOP_KEYS'] = [
    "buy_count",
    "sell_count",
    "online",
    "comments_count",
];
botDataObj['CONF_ADS_BTNS'] = [
    {
        "photo": "Фото",
        "seller_name": "Имя",
        "price": "Цена",
    },
    {
        "location": "Локация",
        "desc": "Описание",
    },
    {
        "item_name": "Название товара",
    },
    {
        "pub_date": "Дата публикации",
        "seller_reg_date": "Дата регистрации",
    },
    {
        "seller_ads_count": "Кол-во объявлений",
        "ad_views_count": "Кол-во просмотров",
    },
    {
        "dop": "Отображать дополнительное",
    },
    {
        "files_info": "Информация в файлах",
    },
];

botDataObj['EXAMPLE_AD'] = {

    "item_name": {"🗂 Название:": "`Świąteczna gwiazda`"},
    "price": {"💵 Цена:": "`50`"},
    "seller_name": {"👨‍💼 Продавец:": "`ester_now`"},
    "location": {"🌍 Локация:": "`Piekary Śląskie`"},
    "buy_count": {"📦 Кол-во купленных:": "*6*"},
    "sell_count": {"📦 Кол-во проданных:": "*34*"},
    "online": {"🔵 В сети:": "*Нет*"},
    "desc": {"📖 Описание:": "*Do sprzedania posiadam ręcznie robioną i zdobioną gwiazdę świąteczną. *"},

    "new_line_0": "\n",
    "!ad_link": {"Ссылка на объявление": "https://telegra.ph/Primer-obyavleniya-12-12"},
    "!photo": {"Ссылка на фото": "https://telegra.ph/Primer-obyavleniya-12-12"},
    "!chat_link": {"Ссылка на чат": "https://telegra.ph/Primer-obyavleniya-12-12"},
    "new_line_1": "\n",

    "pub_date": {"📅 Дата публикации:": "*36 минут назад*"},
    "seller_ads_count": {"📦 Кол-во объявлений:": "*3*"},
    "comments_count": {"🌟 Кол-во комментариев:": "*10*"},

    "!bot_see_count": "\n\n🤖 *Нет просмотров от "+ botDataObj['BOT_NAME'] +"*",
};


botDataObj['commands'] = [
    {
        "command": "no_cmd",
        "cmd_key":"no_cmd",
    },
    {
        "command": ["🚫 Отмена", "cancel", "❌ Отменить действие"],
        "cmd_key": "cancel",
        "answer": "❌"
    },

    {
        "command": "start_kbds",
        "cmd_key":"start_kbds",
        "keyboards":[
            ["🔎 Поиск объявлений"],
            ["💼 Профиль", "⚙️ Настройки"],
            ["ℹ️ Помощь"],
        ]
    },

    

    {
        "command": ["/start"],
        "cmd_key": "start",
        "answer": "🤚 *Добро пожаловать в "+ botDataObj['BOT_NAME'] +"!*",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"video_faq_start": "📹 Видео-уроки", "https://vk.com": "❓ FAQ"},
            {"https://vk.com": "🧾 Пользовательское соглашение"},
        ]
    },

    {
        "command": ["🔎 Поиск объявлений"],
        "cmd_key": "search_ads",
        "answer": "",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"vinted":"VINTED", "etsy":"ETSY"},
            {"subito.it":"🇮🇹 SUBITO.IT"},
            ["🔎 Повторить последний поиск"],
        ]
    },
    {
        "command": ["search_started"],
        "cmd_key": "search_started",
        "keyboards": [["🔴 Остановить поиск объявлений"]]
    },
    {
        "command": ["🔴 Остановить поиск объявлений"],
        "cmd_key": "stop_search",
        "answer": "🔎 *Поиск объявлений останавливается..*",
    },

    {
        "command": ["💼 Профиль"],
        "cmd_key": "profile",
        "answer": "💼 *Профиль*\n\n💰 *Ваш текущий баланс:*\n— {balance} \n\n🚀 *Активные подписки:*\n— Отсутствуют",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            ["💰 Пополнить баланс"],
            ["👬 Реферальная программа"],
            ["🔄 Передать/Сменить подписку"],
        ]
    },
    {
        "command": ["💰 Пополнить баланс"],
        "cmd_key": "topup",
        "answer": "👑 [CryptoBot](https://t.me/CryptoBot)\n\n— Минимум: 0.1\n\n💡 *Введите сумму пополнения в долларах*",
        "newUserInput": "get_add_balance_amount",
        "buttons": [
            {"profile": "◀️ Назад"},
        ]
    },
    {
        "command": ["get_add_balance_amount"],
        "cmd_key": "get_add_balance_amount",
        "answer": "👑 [CryptoBot](https://t.me/CryptoBot)",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"PAY:USDT":"USDT"},
            {"PAY:LTC":"LTC", "PAY:BTC":"BTC", "PAY:ETH":"ETH"},
            {"profile": "❌ Отменить"},
        ]
    },
    {
        "command": ["👬 Реферальная программа"],
        "cmd_key": "ref_prog",
        "answer": "?",
        "buttons": [
            {"activate_inviter_hours": "🤝 Активировать накопленные часы"},
            {"https://t.me/": "📪 Поделиться реферальной ссылкой"},
            {"profile": "◀️ Назад"},
        ]
    },
    {
        "command": ["activate_inviter_hours"],
        "cmd_key": "activate_inviter_hours",
        "answer": "*Выберите какой сервис продлить*",
        "answer_type": "alert",
        "buttons": [
            {"hoursto:vinted":"VINTED", "hoursto:etsy":"ETSY"},
            {"hoursto:subito.it":"🇮🇹 SUBITO.IT"},
            {"ref_prog": "◀️ Назад"},
        ]
        
    },
    {
        "command": ["🔄 Передать/Сменить подписку"],
        "cmd_key": "sendresub",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "answer": "🔄 *Передать/Сменить подписку*\n\n👥 *Передать подписку*\n— Вы можете передать подписку другому пользователю\n\n🔁 *Сменить площадку*\n— Вы можете сменить площадку на одной из подписок\n\n💰 *Передать баланс*\n— Вы можете передать баланс другому пользователю",
        "buttons": [
            {"send_sub": "👥 Передать подписку"},
            {"change_domain": "🔄 Сменить площадку"},
            {"send_balance": "💰 Передать баланс"},
            {"profile": "◀️ Назад"},
        ]
    },
    {
        "command": ["send_balance"],
        "cmd_key": "send_balance",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "answer": "💰 *Передача баланса*\n\n— На балансе: *{balance}* $\n\n💡 *Введите сумму которую хотите передать*",
        "newUserInput": "get_send_balance_amount",
        "buttons": [
            {"sendresub": "◀️ Назад"},
        ]
    },

    {
        "command": ["⚙️ Настройки"],
        "cmd_key": "sets",
        "answer": "⚙️ *Настройки*\n\n— Нажмите на нужный пункт, чтобы активировать или деактировать его работу\n\n[ℹ️ Мануал по настройкам](https://vk.com)",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"conf_ads": "🛠 Конфигуратор объявлений"},
            {"bot_see": "❌ Без просмотров от "+ botDataObj['BOT_NAME']},
            {"limit_bot_see": "👁 Ограничить просмотры"},
            {"ads_send_max_count": "📦 Кол-во объявлений для выдачи"},
        ]
    },
    {
        "command": ["conf_ads"],
        "cmd_key": "conf_ads",
        "answer": "❗️ *Пример объявления с 🇵🇱 VINTED.PL*",
    },
    {
        "command": ["bot_see"],
        "cmd_key": "bot_see",
        "answer": "✅ Теперь Вам будут выдаваться объявления от продавцов, которых не видели другие пользователи Бота",
        "answer_type": "alert"
    },
    {
        "command": ["limit_bot_see"],
        "cmd_key": "limit_bot_see",
        "answer": "👁 *Ограничить просмотры от "+ botDataObj['BOT_NAME'] +"*\nСейчас установлено: *{limit_bot_see}*\n\n— Ограничение будет использоваться на количество просмотров продавца от наших пользователей\nℹ️ *Введите максимальное кол-во просмотров (Не меньше 1):*",
        "newUserInput": "get_limit_bot_see",
        "buttons": [
            {"⚙️ Настройки": "◀️ Назад"},
        ]
    },
    {
        "command": ["get_limit_bot_see"],
        "cmd_key": "get_limit_bot_see",
        "answer": "👁 *Ограничить просмотры от "+ botDataObj['BOT_NAME'] +"*\nСейчас установлено: *{limit_bot_see}*\n\n— Ограничение будет использоваться на количество просмотров продавца от наших пользователей",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"⚙️ Настройки": "◀️ Назад"},
        ]
    },
    {
        "command": ["ads_send_max_count"],
        "cmd_key": "ads_send_max_count",
        "answer": "📦 Кол-во объявлений для выдачи\nСейчас установлено: *{ads_send_max_count}*\n\n— Парсер будет стремиться к выдаче установленного Вами количества объявлений\n\nℹ️ *Введите желаемое количество объявлений (Не больше 50):*",
        "newUserInput": "get_ads_send_max_count",
        "buttons": [
            {"⚙️ Настройки": "◀️ Назад"},
        ]
    },
    {
        "command": ["get_ads_send_max_count"],
        "cmd_key": "get_ads_send_max_count",
        "answer": "👁 *📦 Кол-во объявлений для выдачи*\nСейчас установлено: *{ads_send_max_count}*\n\n— Парсер будет стремиться к выдаче установленного Вами количества объявлений",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"⚙️ Настройки": "◀️ Назад"},
        ]
    },

    {
        "command": ["ℹ️ Помощь"],
        "cmd_key": "help",
        "answer": "",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            {"video_faq": "📹 Видео-уроки", "https://vk.com": "❓ FAQ"},
            ["❗️ У меня проблема/вопрос"],
        ]
    },
    {
        "command": ["📹 Видео-уроки", "video_faq_start"],
        "cmd_key": "video_faq",
        "answer": "📹 *Видео-уроки*\n\n— Для просмотра выберите нужную тему",
        "file": "bot_files/"+ botDataObj['menu_gif'],
        "buttons": [
            ["💰 Как пополнить баланс?"],
            ["🚀 Как купить подписку?"],
            ["🔎 Как запустить парсинг?"],
            ["🔄 Как Передать/Сменить подписку?"],
            ["👀 Хочу объявления без просмотра"],
            {"ℹ️ Помощь": "◀️ Назад"},
        ]
    },
    {
        "command": "💰 Как пополнить баланс?",
        "file": "bot_files/IMG_6935.MP4",
        "answer_type": "sendVideo"
    },
    {
        "command": "🚀 Как купить подписку?",
        "file": "bot_files/IMG_6935.MP4",
        "answer_type": "sendVideo"
    },
    {
        "command": "🔎 Как запустить парсинг?",
        "file": "bot_files/IMG_6935.MP4",
        "answer_type": "sendVideo"
    },
    {
        "command": "🔄 Как Передать/Сменить подписку?",
        "file": "bot_files/IMG_6935.MP4",
        "answer_type": "sendVideo"
    },
    {
        "command": "👀 Хочу объявления без просмотра",
        "file": "bot_files/IMG_6935.MP4",
        "answer_type": "sendVideo"
    },
    {
        "command": ["❗️ У меня проблема/вопрос"],
        "cmd_key": "i_have_problem",
        "answer": "❗️ *У меня проблема/вопрос*\n\n— Выберите интересующую Вас проблему\n\nℹ️ *Если Вашей проблемы нет в списке - нажмите «Другой вопрос»*",
        "buttons": [
            {"https://t.me": "Мне выдает мало объявлений"},
            {"https://t.me/air_team_support": "Другой вопрос"},
            {"ℹ️ Помощь": "◀️ Назад"},
        ]
    },


    {
        "command": ["/time_country"],
        "cmd_key": "time_country",
        "answer": "🕓 Столичное время:\n\n— У вас отсутсвуют подписки"
    },

];
botDataObj['admin_commands'] = [];
