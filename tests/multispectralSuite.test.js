// TS-008
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

    describe("Psyche multispectral imager visual representation", () => {
        test('Multispectral imager model is rendered when selected', async () => {

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

            //Wait for the box to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

	        //Click outside overlay to close it
            await page.mouse.move(100,30);
            await page.mouse.down();
            await page.mouse.up();

            //Verify multispectral imager model loaded
            const multispectralExists = await page.$('#multispectral-imager');
      	    await expect(multispectralExists).not.toBeNull();

	        //Check if multispectral is visible
      	    const isMultispectralVisible = await page.evaluate(() => {
        	    const multispectral = document.querySelector('#multispectral-imager');
        	    if(!multispectral) return false;

        	    const isVisible = multispectral.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isMultispectralVisible).toBe(true);

        }, 10000);
    });

    describe("Psyche multispectral imager response", () => {
        test('Multispectral imager responds to user motion and touch', async () => {

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const multispectral = document.querySelector('#multispectral-imager');
        	    return multispectral ? multispectral.getAttribute('position') : null;
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
        	    const multispectral = document.querySelector('#multispectral-imager');
        	    return multispectral ? multispectral.getAttribute('position') : null;
      	    });
  
      	    // Ensure the model position has changed
      	    expect(updatedPosition).not.toBe(initialPosition);

        }, 10000);
    });

    describe("Psyche multispectral imager webpage information ", () => {
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
            expect(titleText).toBe('Multispectral Imager');

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
            expect(descriptionText).toBe('During Orbit B, the multispectral imager captures detailed images of Psyche’s surface in multiple wavelengths. This allows scientists to distinguish different minerals based on how they reflect light. Additionally,  the imager’s high resolution helps create precise 3D models of surface features such as craters, ridges, and metallic deposits\.');

        }, 10000);
    });

    describe("Multispectral imager sample data", () => {
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
            expect(descriptionText).toBe('Left is Figure 7 from (Dibb, S. Et. Al., 2023) Imager band depth vs. laboratory band depth. Right is a multispectral image cube of Jupiter’s moon Io taken by Voyager 2 during the Voyager mission\.');

        }, 10000);
    });

    describe("Multispectral imager view exit page", () => {
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
            //Get orbit B's color
            const orbitBColor = await page.evaluate(() => {
                const orbitB = document.querySelector('#orbitB');
                return orbitB.getAttribute('color');
            });

            //Check if orbit B has been highlighted
            expect(orbitBColor).toBe('#f9a000');
        }, 10000);
    });
});