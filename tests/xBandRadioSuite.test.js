// TS-009
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

    describe("Psyche x-band radio visual representation", () => {
        test('X-band radio model is rendered when selected', async () => {

            //Check if overlay is visible
            const isOverlayVisible = await page.evaluate(() => {
                const overlay = document.querySelector('#closeOverlay');
                if(!overlay) return false;

                const isVisible = overlay.getAttribute('visible') !== 'false';
                return isVisible;
            });
            expect(isOverlayVisible).toBe(true);

            //Click outside overlay to close it
            await page.mouse.move(30,30);
            await page.mouse.down();
            await page.mouse.up();

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

            //Wait for the box to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

	        //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Verify x-band radio model loaded
            const xbandRadioExists = await page.$('#xband-radio');
      	    await expect(xbandRadioExists).not.toBeNull();

	        //Check if x-band radio is visible
      	    const isXbandRadioVisible = await page.evaluate(() => {
        	    const xbandRadio = document.querySelector('#xband-radio');
        	    if(!xbandRadio) return false;

        	    const isVisible = xbandRadio.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isXbandRadioVisible).toBe(true);

        }, 10000);
    });

    describe("Psyche x-band radio response", () => {
        test('X-band radio responds to user motion and touch', async () => {

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const xbandRadio = document.querySelector('#xband-radio');
        	    return xbandRadio ? xbandRadio.getAttribute('position') : null;
      	    });
  
      	    //Ensure initial position exists
      	    expect(initialPosition).not.toBeNull();
  
      	    //Move the scene with the mouse
      	    await page.mouse.move(300,300);
      	    await page.mouse.down();
      	    await page.mouse.move(500,500);
      	    await page.mouse.up();
  
      	    //Get the updated model position
      	    const updatedPosition = await page.evaluate(() => {
        	    const xbandRadio = document.querySelector('#xband-radio');
        	    return xbandRadio ? xbandRadio.getAttribute('position') : null;
      	    });
  
      	    // Ensure the model position has changed
      	    expect(updatedPosition).not.toBe(initialPosition);

        }, 10000);
    });

    describe("Psyche x-band radio webpage information ", () => {
        test('Details box is shown and correct description is displayed when selected', async () => {

            await page.waitForSelector('#instrument-details');

            //Verify details box is visible
      	    const isDetailsBoxVisible = await page.evaluate(() => {
        	    const detailsBox = document.querySelector('#instrument-details');
                if(!detailsBox) return false;

        	    const style = window.getComputedStyle(detailsBox);
                return style.display !== 'none' && style.visibility !== 'hidden';
      	    });
      	    expect(isDetailsBoxVisible).toBe(true);

            //Check box title
            const titleText = await page.$eval('#instrument-details-title', el => el.textContent.trim());
            expect(titleText).toBe('X-band Radio');

            //Get button element
            const seeMoreButton = await page.waitForSelector('#see-more-btn1');

            //Ensure the button exists and is visible
            expect(seeMoreButton).not.toBeNull();

            //Click the button
            await seeMoreButton.click();

            //Wait for the text box to expand 
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

            //Check contents
            const descriptionText = await page.$eval('#instrumentdetails', el => el.textContent.trim());
            expect(descriptionText).toBe('During Orbit C, the X-band radio system is utilized for gravity science investigations. It works by sending radio waves between the spacecraft and Earth. By precisely measuring the Doppler shifts in these radio signals, scientists can detect tiny changes in the spacecraft’s velocity caused by variations in Psyche’s gravitational pull. These measurements help map the mass distribution and internal structure of the asteroid\.');

        }, 10000);
    });

    describe("X-band radio sample data", () => {
        test('Sample data box is shown and correct description is displayed when selected', async () => {

            await page.waitForSelector('#sample-data');

            //Verify sample data box is visible
      	    const isDataBoxVisible = await page.evaluate(() => {
        	    const dataBox = document.querySelector('#sample-data');
        	    if(!dataBox) return false;

        	    const style = window.getComputedStyle(dataBox);
                return style.display !== 'none' && style.visibility !== 'hidden';
      	    });
      	    expect(isDataBoxVisible).toBe(true);

            //Check box title
            const titleText = await page.$eval('#sample-data-title', el => el.textContent.trim());
            expect(titleText).toBe('Sample Data');

            //Get button element
            const seeMoreButton = await page.waitForSelector('#see-more-btn2');

            //Ensure the button exists and is visible
            expect(seeMoreButton).not.toBeNull();

            //Click the button
            await seeMoreButton.click();

            //Wait for the text box to expand 
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

            //Check contents
            const descriptionText = await page.$eval('#sample-data-text', el => el.textContent.trim());
            expect(descriptionText).toBe('Figure 5 of (Zuber Et. Al., 2022) Gravitation power spectra shows variations in the gravitational field where the harmonic degree corresponds to gravitational features and the RMS magnitude shows how strong  those features are\.');

        }, 10000);
    });

    describe("X-band radio view exit page", () => {
        test('User is returned to Orbit View when button is selected', async () => {

            //Get orbit button element
            await page.waitForSelector('#instrumentButton');
            const orbitButton = await page.$('#instrumentButton');
            
            //Ensure the button exists and is visible
            expect(orbitButton).not.toBeNull();

	        //Click button and wiat for page navigation
            await Promise.all([
                page.waitForNavigation({waitUntil: 'domcontentloaded'}),
                await orbitButton.click(),
            ]);

	        //Verify return to orbit view page
            //Get orbit C's color
            const orbitCColor = await page.evaluate(() => {
                const orbitC = document.querySelector('#orbitC');
                return orbitC.getAttribute('color');
            });

            //Check if orbit C has been highlighted
            expect(orbitCColor).toBe('#f9a000');
        }, 10000);
    });
});