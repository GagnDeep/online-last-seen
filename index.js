const puppeteer = require('puppeteer')
const login = require('./whatsapp_login');
const axios = require('axios');


async function introDelay(ms) {
    let promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise
}


async function startStalking(mobile) {

    let arr = [];

    let page = await login();

    if (page) {
        let isFound = await openPersonPage(mobile, page)

        if (isFound) {
            checkOnline(page, mobile)
        }
    }
}

async function checkOnline(page, mobile) {

    let onlineStatus = await page.$('html');
    let alreadyOnline = false;

    let obj = {}
    let connectedState = true

    let i = setInterval(async () => {

        let isConnected = await checkConnected(page);

        if (isConnected !== connectedState) {
            connectedState = isConnected;
            console.log('connected: ' + connectedState);
            await axios.post('https://online-57da3.firebaseio.com/connected.json', { isConnected: connectedState })
        }

        let onlineText = "offline";
        try {
            onlineText = await onlineStatus.$eval('span._315-i', node => node && node.textContent);
            let online = onlineText === 'online' ? true : false;

            if (online && !alreadyOnline) {
                alreadyOnline = true;
                obj = { online: new Date() }
            }
        } catch (err) {
            if (alreadyOnline) {
                alreadyOnline = false
                obj.offline = new Date();

                try {
                    console.log(obj)
                    // await axios.post("https://online-57da3.firebaseio.com/online.json", obj);
                    // clearInterval(i);
                    // let message = `online ${(obj.offline - obj.online) / 60}`
                    // sendNotification('7889135688', mobile, page, message)
                }
                catch (err) {
                    console.log('error while posting object', err)
                }
            }
        }
    }, 2500)
}

async function checkConnected(page) {
    try {
        let isConnected = await page.$('span[data-icon=alert-phone]');
        return !isConnected;
    } catch (err) {
        console.log('error while checking connection', err);
        return -1;
    }
}
async function sendNotification(sendTo, stalkNumber, page, message) {
    await openPersonPage(sendTo, page);
    await sendMessage(message, page)
    await openPersonPage(stalkNumber, page);
    checkOnline(page, stalkNumber);
}

async function sendMessage(message, page) {
    await page.keyboard.type(message)
    await page.keyboard.press('Enter');
}


async function openPersonPage(mobile, page) {
    try {
        //clicking on search bar
        await page.click('input[type=text]')

        // searhing for that mobile number
        await page.keyboard.type(mobile)
        const isLoaded = await isSearched(page);

        if (!isLoaded) return false;

        await page.keyboard.press('Enter')

        // check if person exists
        try {
            if (await page.$('div._3dwyT')) {
                throw new Error("Person not found")
            } else {
                return true
            }
        }
        catch (err) {
            console.log(err);
            return false
        }


    } catch (err) {
        console.log("Failed on clicking on search", err)
        return false;
    }
}

async function isSearched(page, tries = 0) {
    if (tries > 30) return false;

    let isLoaded = page.$('span[data-icon=x-alt]')

    if (isLoaded) return true;

    await introDelay(500);
    await isSearched(page, tries + 1)
}

startStalking("8968044978")
