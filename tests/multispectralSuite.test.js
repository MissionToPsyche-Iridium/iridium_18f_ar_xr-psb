// TS-008
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

    describe("Multispectral Imager instrument video test", () => {
        test('Multispectral Imager instrument video plays with page is loaded', async () => {
	        //Select OrbitB
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

            //Dealy
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

            //Close window
            await page.click('#videoModal .btn-close');
        }, 10000);
    });

    describe("Multispectral Imager render test", () => {
        test('Multispectral Imager 3D object renders when Magnetometer page is loaded', async () => {
            //Verify multispectral imager model loaded
            const multispectralExists = await page.$('#multispectral');
      	    await expect(multispectralExists).not.toBeNull();

	        //Check if multispectral is visible
      	    const isMultispectralVisible = await page.evaluate(() => {
        	    const multispectral = document.querySelector('#multispectral');
        	    if(!multispectral) return false;

        	    const isVisible = multispectral.getAttribute('visible') !== 'false';
        	    return isVisible;
      	    });
      	    expect(isMultispectralVisible).toBe(true);
        }, 10000);
    });

    describe("Multispectral Imager touch and motion response", () => {
        test('Multispectral Imager responds to user motion and touch', async () => {
            //Wait for the page
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 100)
            ));

            //Get initial model position
      	    const initialPosition = await page.evaluate(() => {
        	    const multispectral = document.querySelector('#multispectral');
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

    describe("Multispectral Imager navigation menu test", () => {
        test('Navigation menu expands and displays instrument links', async () => {
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));
            
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