/* eslint-disable @typescript-eslint/explicit-function-return-type */
import puppeteer from 'puppeteer';
import path from 'path';

const imgPath: string = path.join(__dirname,'..','screenshot.png');
const headlessScreenshot = (url: string, _options = {}) => new Promise(async (res,rej) => {
    try {
        console.log('Called',_options);
        const browser = await puppeteer.launch();
        console.log('Browser launched');
        const page = await browser.newPage();
        console.log('Browsing');
        page.once('console', () => {
            setTimeout(async () =>{
                await page.mouse.click(750, 400);
                await page.screenshot({
                    path: imgPath,
                    clip: {
                        x: 500,
                        y: 300,
                        width: 230,
                        height: 400,
                    }
                });
                res(browser.close());
            }, 1000);
        });
        await page.goto(url);
    } catch (err) {
        rej(err);
    }
});
export default headlessScreenshot;
