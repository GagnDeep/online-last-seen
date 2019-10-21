const puppeteer = require('puppeteer');

async function initialize() {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage()
        return page;
    }
    catch (err) {
        console.log('error while initializing', err);
        return null
    }
}

async function getToUrl(page, url) {
    try {
        await page.goto(url);
        console.log('successfully reached url ' + url);
        return true;
    }
    catch (err) {
        console.log('error while reaching the ' + url, err)
        return false;
    }
}

module.exports = async function initiateLogin() {
    const page = await initialize();
    const url = 'https://web.whatsapp.com';

    const hasReachedUrl = await getToUrl(page, url)

    if (hasReachedUrl) {
        await page.screenshot({ path: 'qrcode.png' })

        const isLoggedIn = await checkForLogin(page);

        if (isLoggedIn) return page;

    }
    return null;
}

async function checkForLogin(page, tries = 0) {

    if (tries > 30) return false;

    let isLogged = await page.$('input[type=text]')

    if (isLogged) {
        console.log('successfully logged in');
        return true
    } else {
        console.log(`not logged in tries: ${tries}`)
        await delay(1000)
        return await checkForLogin(page, tries + 1)
    }
}

async function delay(ms) {
    const promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise;
}