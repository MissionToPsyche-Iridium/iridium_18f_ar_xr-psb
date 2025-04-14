// TS-007
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

    describe("Psyche magnetometer visual representation", () => {
        test('Magnetometer model is rendered when selected', async () => {

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

	        //Select OrbitA
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

            //Wait for the box to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

	        //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Verify magnetometer model loaded
            const magnetometerExists = await page.$('#magnetometer');
      	    await expect(magnetometerExists).not.toBeNull();

	        //Check if Magnetometer is visible
      	    const isMagnetometerVisible = await page.evaluate(() => {
        	    const magnetometer = document.querySelector('#magnetometer');
        	    if(!magnetometer) return false;

        	    const isVisible = magnetometer.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isMagnetometerVisible).toBe(true);

        }, 10000);
    });

    describe("Psyche magnetometer response", () => {
        test('Magentometer responds to user motion and touch', async () => {

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const magnetometer = document.querySelector('#magnetometer');
        	    return magnetometer ? magnetometer.getAttribute('position') : null;
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
        	    const magnetometer = document.querySelector('#magnetometer');
        	    return magnetometer ? magnetometer.getAttribute('position') : null;
      	    });
  
      	    // Ensure the model position has changed
      	    expect(updatedPosition).not.toBe(initialPosition);

        }, 10000);
    });

    describe("Psyche Magnetometer webpage information ", () => {
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
            expect(titleText).toBe('Magnetometer');

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
            expect(descriptionText).toBe('In Orbit A, the magnetometer is tasked with measuring the magnetic field around Psyche with high precision. This instrument records the strength and direction of the magnetic field in three dimensions, which is crucial for detecting subtle magnetic anomalies. These anomalies can provide clues about the asteroid’s past, such as whether it once hosted a molten metallic core or experienced significant impacts that altered its magnetic signature\.');

        }, 10000);
    });

    describe("Magnetometer sample data", () => {
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
            expect(descriptionText).toBe('Figure 8 from (Weiss B. P. Et. Al., 2023), Top shows the magnetic field strength in nanoTesla of the x, y, and z axis. Bottom shows the power spectral density, describing how the power of the magnetic field across different frequencies\.');

        }, 10000);
    });

    describe("Magnetometer view exit page", () => {
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
            //Get orbit A's color
            const orbitAColor = await page.evaluate(() => {
                const orbitA = document.querySelector('#orbitA');
                return orbitA.getAttribute('color');
            });

            //Check if orbit A has been highlighted
            expect(orbitAColor).toBe('#f9a000');
        }, 10000);
    });
});