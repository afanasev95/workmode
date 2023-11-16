import mysql from 'mysql2'
import 'dotenv/config'
import util from 'util'

import botFuncsAll from './../class/botFuncs.mjs'
let botFuncs = new botFuncsAll()

const DB_USER = process.env.DB_USER;
const DB_NAME = process.env.DB_NAME;
const DB_PASS = process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT;

const conn = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  charset : 'utf8mb4',
  port: DB_PORT
});
const query = util.promisify(conn.query).bind(conn);

const MAX_ITEMS_CHECK = 50;
const MAX_CHECK_TIME_TO_BACKS = 30; // in minutes
const CHECK_INERVAL = 10; // in minutes




let ProxiessArr = [
    // {
    //     "server":"alisa.ltespace.com:15558",
    //     "login":"nbrte5qd",
    //     "pass":"hos53oag",
    // }
    {
        "server":"196.17.168.212:8000",
        "login":"zYhcVu",
        "pass":"2xY66s",
    }
];

async function getLink(searchData, proxyInd)
{
    let catLinks = {};
    let preset = {};
    if(searchData['links'] === undefined || searchData['preset'] === undefined)
    {
        console.log("LINKS UNDEFINED OR PRESET");
        return false;
    }

    catLinks = botFuncs.decodeToDb(searchData['links']);
    let catLink = catLinks[0];

    preset = botFuncs.decodeToDb(searchData['preset']);
    if(preset['max_active_ads_of_seller'] === undefined || !botFuncs.isInt(preset['max_active_ads_of_seller'])) preset['max_active_ads_of_seller'] = 0;

    if(preset['min_date_pub_ad'] === undefined) preset['min_date_pub_ad'] = botFuncs.time();
    else preset['min_date_pub_ad'] = botFuncs.strtotime_parsed(preset['min_date_pub_ad']);
    
    console.log(preset);

    let catId = 0;
    let catIdMatch = catLink.match(/\/([0-9]+)[^\/]+$/);
    if(catIdMatch) catId = catIdMatch[1];
    else
    {
        catIdMatch = catLink.match(/catalog\[\]=([0-9]+)/);
        if(catIdMatch) catId = catIdMatch[1];
    }

    if(catId == 0)
    {
        console.log("NO CATID");
        return false;
    }

    var getReqData = new URLSearchParams({
        "page" : "1",
        "per_page" : "96",
        "search_text" : "",
        "catalog_ids" : catId,
        "color_ids" : "",
        "brand_ids" : "",
        "size_ids" : "",
        "material_ids" : "",
        "video_game_rating_ids" : "",
        "status_ids" : "",
        "order" : "newest_first",
    });
    let apiLink = "https://www."+ searchData['domain'] +"/api/v2/catalog/items?" + getReqData.toString();

    // if(!link.match(/order=newest_first/))
    // {
    //     if(!link.match(/\?/)) link += "?order=newest_first";
    //     else link += "&order=newest_first";
    // }

    catLink = "https://www."+ searchData['domain'] +"/catalog?search_text=&catalog[]="+ catId +"&order=newest_first";

    console.log(catLink);
    console.log(apiLink);

    let browser = await puppeteer.launch(
        {
            // headless: "new",
            // executablePath: '/usr/bin/chromium-browser',
            headless: false,
            args: [
                '--no-sandbox',
                '--proxy-server=http://' + proxyInd['server'],
                
                // '--user-data-dir=/Users/afanasev/Documents/work/itdevs.tech/tests/workmodenode/pup_profiles/profile_n',
                '--aggressive-cache-discard',
                '--disable-cache',
                '--disable-application-cache',
                '--disable-offline-load-stale-cache',
                '--disable-gpu-shader-disk-cache',
                '--media-cache-size=0',
                '--disk-cache-size=0',
                '--disable-extensions',
                '--disable-component-extensions-with-background-pages',
                '--disable-default-apps',
                '--mute-audio',
                '--no-default-browser-check',
                '--autoplay-policy=user-gesture-required',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-notifications',
                '--disable-background-networking',
                '--disable-breakpad',
                '--disable-component-update',
                '--disable-domain-reliability',
                '--disable-sync',
            ]
        }
    );

    try
    {
        let page = await browser.newPage();
    
        await page.authenticate({
            username: proxyInd['login'],
            password: proxyInd['pass'],
        })

        console.log('start');
        await page.goto("view-source:" + catLink, {waitUntil: "networkidle2", timeout: 25000});
        console.log('end');

        console.log('html');
        let html = await page.evaluate(() => document.querySelector('*').outerHTML);

        let matches = html.match(/MainStore<\/span>[^<]*<\/span>(\{[^<]+)</);
        if(!matches)
        {
            console.log("NO MATCHES");
            await browser.close();
            browser = false;
            return false;
        }

        let urlEncodeStr = matches[1];
        let obj = botFuncs.decodeToDb(urlEncodeStr);

        if(obj['items'] !== undefined && obj['items']['catalogItems'] !== undefined && obj['items']['catalogItems']['byId'] !== undefined)
        {
            let items = obj['items']['catalogItems']['byId'];
            // console.log(items);

            let exstAdIdsArr = [];
            if(searchData['checkedAdIds'] !== null) exstAdIdsArr = botFuncs.decodeToDb(searchData['checkedAdIds']);
            // let exstItems = await query("SELECT * FROM `parsed_ads` WHERE `searchId` = ?", [searchData['id']]);
            // if(exstItems.length > 0)
            // {
            //     for(let exstItemKey in exstItems)
            //     {
            //         let exstItem = exstItems[exstItemKey];
            //         exstAdIdsArr.push(exstItem['adId']);
            //     }
            // }

            let itemsCheked = 1;
            let itemNum = 1;
            let groupKey = botFuncs.time();
            for(let itemKey in items)
            {
                console.log(itemsCheked);
                itemsCheked++;

                let item = items[itemKey];
                // console.log(item);
                if(botFuncs.in_array(item['id'], exstAdIdsArr)) continue;

                exstAdIdsArr.push(item['id']);

                await query("UPDATE `searchs` SET `checkedAdIds` = ? WHERE `id` = ?", [botFuncs.encodeToDb(exstAdIdsArr), searchData['id']]);

                if(item['photo'] === undefined || item['photo']['high_resolution'] === undefined || item['photo']['high_resolution']['timestamp'] === undefined) continue;

                let itemCreateTime = item['photo']['high_resolution']['timestamp'];
                if(itemCreateTime < preset['min_date_pub_ad']) continue;


                // FILL ITEM INFO
                let tempUrl = "https://www."+ searchData['domain'] +"/api/v2/items/"+ item['id'] +"?localize=false";
                console.log(tempUrl);
                await page.goto("view-source:" + tempUrl, {waitUntil: "networkidle2", timeout: 25000});
                let tempItems = await page.evaluate(() => document.querySelector('*').outerHTML);
                let tempItemsMatches = tempItems.match(/"line-content\">(\{[^<]+)</);
                if(!tempItemsMatches) console.log("NO MATCHES tempItems");
                urlEncodeStr = tempItemsMatches[1];
                let tempItemsObj = botFuncs.decodeToDb(urlEncodeStr);
                if('item' in tempItemsObj === false)
                {
                    console.log("NO KEY item");
                    continue;
                }
                tempItemsObj = tempItemsObj['item'];
                let sellerItemsCount = -1;
                let sellerCommentsCount = -1;
                if('user' in tempItemsObj === true)
                {
                    if(tempItemsObj['user']['item_count'] !== undefined) sellerItemsCount = tempItemsObj['user']['item_count'];
                    if(tempItemsObj['user']['feedback_count'] !== undefined) sellerCommentsCount = tempItemsObj['user']['feedback_count'];
                }
                // FILL ITEM INFO

                if(sellerItemsCount <= preset['max_active_ads_of_seller'])
                {
                    if(sellerCommentsCount <= preset['max_comments_of_seller'])
                    {
                        let adObj = botFuncs.encodeToDb(tempItemsObj);
                        let sqlData = [searchData['u_id'], searchData['id'], searchData['domain'], item['id'], item['url'], adObj, catId, catLink, botFuncs.time(), groupKey];
                        query("INSERT INTO `parsed_ads` SET `uid` = ?, `searchId` = ?, `domain` = ?, `adId` = ?, `adLink` = ?, `adObj` = ?, `catId` = ?, `catLink` = ?, `createTime` = ?, `groupKey` = ?", sqlData);
                        
                        itemNum++;
                        console.log("itemNum:" + itemNum);
                        if(itemNum > MAX_ITEMS_CHECK) break;
                        // break;
                    }
                    else console.log("min max_comments_of_seller");
                }
                else console.log("min max_active_ads_of_seller");
            }

            await query("UPDATE `parsed_ads` SET `status` = 'tosend' WHERE `groupKey` = ?", [groupKey]);
            
        }
        else console.log("NO ITEMS");

        if(browser !== undefined)
        {
            await browser.close();
            browser = false;
        }
    }
    catch(err3)
    {
        console.log("CLOSE");
        console.log(err3);

        if(browser !== undefined)
        {
            await browser.close();
            browser = false;
        }
    }
}

let i = 0;
async function check()
{
    i++;
    console.log(i);
    setTimeout(async function ()
    {
        let lastCheckTime = botFuncs.time() - CHECK_INERVAL * 60;
        let maxToCheckTime = botFuncs.time() - MAX_CHECK_TIME_TO_BACKS * 60;
        let searchDataDb = await query("SELECT * FROM `searchs` WHERE `lastCheck` < ? AND `status` = 'new' AND `domain` LIKE '%vinted%' AND `parse_type` = 'in_back' ORDER BY `lastCheck` ASC LIMIT 1", [lastCheckTime]);
        if(searchDataDb.length > 0)
        {
            searchDataDb = searchDataDb[0];
            if(searchDataDb['createTime'] >= maxToCheckTime)
            {
                console.log(searchDataDb);
                await query("UPDATE `searchs` SET `lastCheck` = ? WHERE `id` = ?", [botFuncs.time(), searchDataDb['id']]);
                await getLink(searchDataDb, ProxiessArr[0]);
            }
            else
            {
                await query("UPDATE `searchs` SET `status` = 'end' WHERE `id` = ?", [searchDataDb['id']]);
                console.log("SET STATUS: END");
            }
        }
        else console.log("Wait link");

        await check();
    }
    , 5000);
}
await check();