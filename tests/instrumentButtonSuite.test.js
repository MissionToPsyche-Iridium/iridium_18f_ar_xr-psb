// TS-006
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5501/index.html'

describe('AR Web App', () => {
    let browser;
    let page;

    //Open browser and page first
    beforeAll(async () => {

    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
        headless: false,
        args: ['--ignore-certificate-errors'],
        ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
    });

    //Open new page
    page = await browser.newPage();

    //Open the application url
    await page.goto(url);

    },10000);

    afterAll(async () => {
    await browser.close();
    });

    describe("Main view instrument button", () => {
        test('Main view insturment button navigates to instrument page', async () => {

            //Check if overlay is visible
            const isOverlayVisible = await page.evaluate(() => {
                const overlay = document.querySelector('#closeOverlay');
                if(!overlay) return false;

                const isVisible = overlay.getAttribute('visible') !== 'false';
                return isVisible;
            });
            expect(isOverlayVisible).toBe(true);

            //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Get button element
            const instrumentButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(instrumentButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await instrumentButton.click(),
            ]);
            
            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);

        }, 10000);
    });

    describe("orbit A instrument button", () => {
        test('Orbit A insturment button navigates to magnetometer page', async () => {

            //Select Orbit A
            await page.evaluate(() => {
                const hitbox = document.querySelector('#orbitA-wrapper .hitbox');
                if (hitbox) {
                hitbox.emit('click');
                }
            });

            //Get button element
            const instrumentButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(instrumentButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await instrumentButton.click(),
            ]);
            
            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

            //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);

            //Wait for the page to load
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

        }, 10000);
    });

    describe("orbit B instrument button", () => {
        test('Orbit B insturment button navigates to multispectral imager page', async () => {

            //Select Orbit B
            await page.evaluate(() => {
                const hitbox = document.querySelector('#orbitB-wrapper .hitbox');
                if (hitbox) {
                hitbox.emit('click');
                }
            });

            //Get button element
            const instrumentButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(instrumentButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await instrumentButton.click(),
            ]);
            
            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

            //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);

            //Wait for the page to load
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

        }, 10000);
    });

    describe("orbit C instrument button", () => {
        test('Orbit C insturment button navigates to X-band radio page', async () => {

            //Select Orbit C
            await page.evaluate(() => {
                const hitbox = document.querySelector('#orbitC-wrapper .hitbox');
                if (hitbox) {
                hitbox.emit('click');
                }
            });

            //Get button element
            const instrumentButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(instrumentButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await instrumentButton.click(),
            ]);
            
            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

            //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);

            //Wait for the page to load
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

        }, 10000);
    });

    describe("orbit D instrument button", () => {
        test('Orbit D insturment button navigates to gamma-ray spectrometer page', async () => {

            //Select Orbit D
            await page.evaluate(() => {
                const hitbox = document.querySelector('#orbitD-wrapper .hitbox');
                if (hitbox) {
                hitbox.emit('click');
                }
            });

            //Get button element
            const instrumentButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(instrumentButton).not.toBeNull();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await instrumentButton.click(),
            ]);
            
            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

            //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);
            
            //Wait for the page to load
            /*await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));*/

        }, 10000);
    });
});