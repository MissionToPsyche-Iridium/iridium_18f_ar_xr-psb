// TS-011
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

    describe("Psyche neutron spectrometer visual representation", () => {
        test('Neutron spectrometer model is rendered when selected', async () => {

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

            //Wait for the page to load
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

	        //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Open navigation menu
            await page.click('#btnToggle');

            //Click the Neutron Spectrometer link.
            await page.evaluate(() => {
                const neutronLink = document.querySelector('a[data-instrument="neutron"]');
                if (neutronLink) {
                  neutronLink.click();
                }
            });

            //Verify neutron spectrometer model loaded
            const neutronExists = await page.$('#neutron');
      	    await expect(neutronExists).not.toBeNull();

	        //Check if neutron spectrometer is visible
      	    const isNeutronVisible = await page.evaluate(() => {
        	    const neutron = document.querySelector('#neutron');
        	    if(!neutron) return false;

        	    const isVisible = neutron.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isNeutronVisible).toBe(true);

        }, 10000);
    });

    describe("Psyche neutron spectrometer response", () => {
        test('Neutron spectrometer responds to user motion and touch', async () => {

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const neutron = document.querySelector('#neutron');
        	    return neutron ? neutron.getAttribute('position') : null;
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
        	    const neutron = document.querySelector('#neutron');
        	    return neutron ? neutron.getAttribute('position') : null;
      	    });
  
      	    // Ensure the model position has changed
      	    expect(updatedPosition).not.toBe(initialPosition);

        }, 10000);
    });

    describe("Psyche neutron spectrometer webpage information ", () => {
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
            expect(titleText).toBe('Neutron Spectrometer');

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
            expect(descriptionText).toBe('In Orbit D, the neutron spectrometer measures the major elemental composition of Psyche by detecting neutrons that are emitted when cosmic rays interact with the asteroid’s surface. Equipped with multiple filters, this instrument can differentiate between neutrons of various energy levels, which correspond to different elements. When used alongside the multispectral imager, the spectrometer’s data helps build a comprehensive picture of Psyche’s mineral and elemental makeup\.');

        }, 10000);
    });

    describe("Neutron spectrometer sample data", () => {
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
            expect(descriptionText).toBe('Figure 4, B. from (Peplowski Et. Al., 2022) shows the neutron count per second across multiple channels with the 3 spectrometer filters shown in different colors\.');

        }, 10000);
    });

    describe("Neutron spectrometer view exit page", () => {
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
            //Get orbit D's color
            const orbitDColor = await page.evaluate(() => {
                const orbitD = document.querySelector('#orbitD');
                return orbitD.getAttribute('color');
            });

            //Check if orbit D has been highlighted
            expect(orbitDColor).toBe('#f9a000');
        }, 10000);
    });
});