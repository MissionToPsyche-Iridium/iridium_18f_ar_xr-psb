// TS-007
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

    describe("Magnetometer instrument video test", () => {
        test('Magnetometer instrument video plays with page is loaded', async () => {
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

            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

            await page.click('#videoModal .btn-close');
        }, 10000);
    });

    describe("Magnetometer render test", () => {
        test('Magnetometer 3D object renders when Magnetometer page is loaded', async () => {
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

    describe("Magnetometer touch and motion response", () => {
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

    describe("Mmagnetometer navigation menu test", () => {
        test('Navigation menu expands and displays instrument links', async () => {
            //Wait for page to load
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

    describe("Magnetometer view exit page", () => {
        test('User is returned to Orbit View when button is selected', async () => {
            //Wait for the button to appear
            await page.evaluate(() => new Promise(resolve => 
                setTimeout(resolve, 500)
            ));

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