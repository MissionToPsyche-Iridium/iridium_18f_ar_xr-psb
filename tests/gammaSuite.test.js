// TS-010
let url = 'https://127.0.0.1:5501/index.html'
const { closeOrbitOverlayIfVisible } = require('./utils/overlayUtils');

describe('AR Web App', () => {
    beforeAll(async () => {
        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });

        await closeOrbitOverlayIfVisible(page);
    });
        
    afterAll(async () => {
    });

    describe("Gamma-ray Spectrometer instrument video test", () => {
        test('Gamma-ray Spectrometer instrument video plays with page is loaded', async () => {
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
        }, 10000);
    });

    describe("Gamma-ray Spectrometer render test", () => {
        test('Gamma-ray Spectrometer 3D object renders when Magnetometer page is loaded', async () => {
            //Verify gamma-ray spectrometer model loaded
            const gammaExists = await page.$('#gamma');
      	    await expect(gammaExists).not.toBeNull();

	        //Check if gamma-ray spectrometer is visible
      	    const isGammaVisible = await page.evaluate(() => {
        	    const gamma = document.querySelector('#gamma');
        	    if(!gamma) return false;

        	    const isVisible = gamma.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isGammaVisible).toBe(true);
        }, 10000);
    });

    describe("Gamma-ray Spectrometer touch and motion response", () => {
        test('Gamma-ray Spectrometer responds to user motion and touch', async () => {
            //Wait for the page
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 200)
            ));

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const gamma = document.querySelector('#gamma');
        	    return gamma ? gamma.getAttribute('position') : null;
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
        	    const gamma = document.querySelector('#gamma');
        	    return gamma ? gamma.getAttribute('position') : null;
      	    });
  
      	    // Ensure the model position has changed
      	    expect(updatedPosition).not.toBe(initialPosition);
        }, 10000);
    });

    describe("Gamma-ray Spectrometer navigation menu test", () => {
        test('Navigation menu expands and displays instrument links', async () => {
            //Ensure the menu starts collapsed
            await page.waitForSelector('#navbarNavInstrument', { hidden: true });
        
            // Open the menu
            await page.click('#btnToggle');
            await page.waitForSelector('#navbarNavInstrument', { visible: true });
            
            //Check that all instrument links are present
            const expectedLinks = [
                { instrument: 'spacecraft', text: 'Psyche Spacecraft' },
                { instrument: 'magnetometer', text: 'Magnetometer' },
                { instrument: 'multispectral', text: 'Multispectral Imager' },
                { instrument: 'xband-radio', text: 'X-band Radio' },
                { instrument: 'gamma', text: 'Gamma Ray Spectrometer' },
                { instrument: 'neutron', text: 'Neutron Spectrometer' },
            ];
        
            for (const { instrument, text } of expectedLinks) {
                const link = await page.$(`a[data-instrument="${instrument}"]`);
                expect(link).not.toBeNull();
        
                const linkText = await link.evaluate(el => el.textContent.trim());
                expect(linkText).toBe(text);
            }
        
            // Check the info icon exists
            const infoIcon = await page.$('.info-icon img[alt="Info"]');
            expect(infoIcon).not.toBeNull();

            //Wait for the nav menu to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
        
            // Close the menu
            await page.click('#btnToggle');
            await page.waitForSelector('#navbarNavInstrument', { hidden: true });
        }, 10000);
    });

    describe("Gamma-ray Spectrometer view exit page", () => {
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