const puppeteer = require('puppeteer')

async function initialize(url) {

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36")
    await page.goto(url);

    await introDelay(3000)
    await page.screenshot({ path: 'example.png' });
    // await page.waitForNavigation({ waitUntil: 'networkidle2' })
    await introDelay(10000)
    return page
}

async function introDelay(ms) {
    let promise = new Promise((res, rej) => setTimeout(() => res(), ms));
    await promise
}


async function startStalking(mobile) {

    let arr = [];

    page = await initialize("https://web.whatsapp.com");

    await introDelay(5000)

    let isFound = await openPersonPage(mobile)

    if (isFound) {
        checkOnline(page, arr)
    }
}

async function checkOnline(page, arr) {

    let onlineStatus = await page.$('html');
    let alreadyOnline = false
    let i = setInterval(async () => {

        let onlineText = "offline";
        let alreadyOnline = false
        try {
            onlineText = await onlineStatus.$eval('span._315-i', node => node && node.textContent);
            let online = onlineText === 'online' ? true : false;

            if (online && !alreadyOnline) {
                alreadyOnline = true;
                console.log("online")

                arr.push({ online: new Date() })
            }
        } catch (err) {
            if (alreadyOnline) {
                alreadyOnline = false
                console.log("offline", arr)
                arr[arr.length - 1].offline = new Date();

            }
        }
    }, 1000)

}


async function openPersonPage(mobile) {
    try {
        //clicking on search bar
        await page.click('input._2zCfw')

        // searhing for that mobile number
        await page.keyboard.type(mobile)
        await introDelay(3000)
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
        console.log("Failed on clicking on search")
        return false;
    }
}

startStalking("6479018872")