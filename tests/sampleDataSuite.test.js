// T-013
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
            headless: true,
            args: ['--ignore-certificate-errors'],
            ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
        });

        //Open new page
        page = await browser.newPage();

        //Open the application url
        await page.goto(url);

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

        //Wait for the video window to appear
        await page.evaluate(() => new Promise(resolve => 
            setTimeout(resolve, 500)
        ));

        //Check if window is visible
        const isWindowVisible = await page.evaluate(() => {
            const window = document.querySelector('#videoModal');
            if(!window) return false;

            const isVisible = window.getAttribute('visible') !== 'false';
            return isVisible;
        });
        expect(isWindowVisible).toBe(true);

        //Delay
        await page.evaluate(() => new Promise(resolve => 
            setTimeout(resolve, 500)
        ));

        //Close window
        await page.click('#videoModal .btn-close');
    },15000);

    afterAll(async () => {
        await browser.close();
    });

    describe("Instrument sample test", () => {
        const instruments = [
            {
              id: 'magnetometer',
              text: 'Figure 8 from (Weiss B. P. Et. Al., 2023), Top shows the magnetic field strength in nanoTesla of the x, y, and z axis. Bottom shows the power spectral density, describing how the power of the magnetic field across different frequencies.'
            },
            {
              id: 'multispectral',
              text: 'Left is Figure 7 from (Dibb, S. Et. Al., 2023) Imager band depth vs. laboratory band depth. Right is a multispectral image cube of Jupiter’s moon Io taken by Voyager 2 during the Voyager mission.'
            },
            {
              id: 'xband-radio',
              text: 'Figure 5 of (Zuber Et. Al., 2022) Gravitation power spectra shows variations in the gravitational field where the harmonic degree corresponds to gravitational features and the RMS magnitude shows how strong  those features are.'
            },
            {
              id: 'gamma',
              text: 'Figure 4, A. from (Peplowski Et. Al., 2022) shows a portion of the gamma-ray spectrum for high-purity Germanium.'
            },
            {
              id: 'neutron',
              text: 'Figure 4, B. from (Peplowski Et. Al., 2022) shows the neutron count per second across multiple channels with the 3 spectrometer filters shown in different colors.'
            }
          ];
        test.each(instruments)('Sample data specific to selected instrument is displayed', async ({id, text}) => {
            //Click the insturment link.
            await page.evaluate((insturmentName) => {
                const instrumentLink = document.querySelector(`a[data-instrument="${insturmentName}"]`);
                if (instrumentLink) {
                  instrumentLink.click();
                }
            }, id);

            //Get sample data box
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
            expect(descriptionText).toBe(text);
        }, 10000);
    });
});