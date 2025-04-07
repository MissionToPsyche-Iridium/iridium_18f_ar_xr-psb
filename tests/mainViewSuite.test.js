// TC-001
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

  describe("Main view asset render test", () => {

    test('Asteroid object and orbits are rendered on screen', async () => {
      
      //Check is entites exists
      const asteroidExists = await page.$('#psyche');
      expect(asteroidExists).not.toBeNull();

      const orbitDExists = await page.$('#orbitD');
      expect(orbitDExists).not.toBeNull();

      const orbitCExists = await page.$('#orbitC');
      expect(orbitCExists).not.toBeNull();

      const orbitBExists = await page.$('#orbitB');
      expect(orbitBExists).not.toBeNull();

      const orbitAExists = await page.$('#orbitA');
      expect(orbitAExists).not.toBeNull();

      //Ensure the model has been loaded using the `model-loaded` event
      const asteroidLoaded = await page.evaluate(() => {
        return new Promise((resolve) => {
          const asteroid = document.querySelector('#psyche');
          if (!asteroid) resolve(false);

          //Listen for the 'model-loaded' event
          asteroid.addEventListener('model-loaded', () => resolve(true));
        });
      });

      //Check if asteroid is visible
      const isAsteroidVisible = await page.evaluate(() => {
        const asteroid = document.querySelector('#psyche');
        if(!asteroid) return false;

        const isVisible = asteroid.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isAsteroidVisible).toBe(true);  // Ensure it's visible

      //Check if orbit D is visible
      const isOrbitDVisible = await page.evaluate(() => {
        const orbitD = document.querySelector('#orbitD');
        if(!orbitD) return false;

        const isVisible = orbitD.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isOrbitDVisible).toBe(true);  // Ensure it's visible

      //Check if orbit C is visible
      const isOrbitCVisible = await page.evaluate(() => {
        const orbitC = document.querySelector('#orbitC');
        if(!orbitC) return false;

        const isVisible = orbitC.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isOrbitCVisible).toBe(true);  // Ensure it's visible

      //Check if orbit B is visible
      const isOrbitBVisible = await page.evaluate(() => {
        const orbitB = document.querySelector('#orbitB');
        if(!orbitB) return false;

        const isVisible = orbitB.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isOrbitBVisible).toBe(true);  // Ensure it's visible

      //Check if orbit A is visible
      const isOrbitAVisible = await page.evaluate(() => {
        const orbitA = document.querySelector('#orbitA');
        if(!orbitA) return false;

        const isVisible = orbitA.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isOrbitAVisible).toBe(true);  // Ensure it's visible

    }, 10000);
  });

  describe("Main view touch response test", () => {

    test('Scene responds to touch', async () => {
  
      //Get Orbit D's hitbox and click it
      await page.evaluate(() => {
        const hitbox = document.querySelector('#orbitD-wrapper .hitbox');
        if (hitbox) {
          hitbox.emit('click');
        }
      });
      
      //Get orbit D's color attribute after the interaction
      const orbitDColor = await page.evaluate(() => {
          const orbitD = document.querySelector('#orbitD');
          return orbitD.getAttribute('color');
      });

      //Check if orbit D has been highlighted with the expected color value
      expect(orbitDColor).toBe('#f9a000');
    }, 10000);

  });

  describe("Main view motion response test", () => {

    test('Scene responds to motion', async () => {
   
      //Get initial camera position
      const initialPosition = await page.evaluate(() => {
        const camera = document.querySelector('#camera');
        return camera ? camera.getAttribute('position') : null;
      });
  
      //Ensure initial position exists
      expect(initialPosition).not.toBeNull();
  
      //Move the scene with the mouse
      await page.mouse.move(300,300);
      await page.mouse.down();
      await page.mouse.move(500,500);
      await page.mouse.up();
  
      //Get the updated camera position
      const updatedPosition = await page.evaluate(() => {
        const camera = document.querySelector('#camera');
        return camera ? camera.getAttribute('position') : null;
      });
  
      // Ensure the camera position has changed
      expect(updatedPosition).not.toBe(initialPosition);    
    }, 10000);

  });

  describe("Main view popup test", () => {

    test('Instruction popup appears and disappears after 5 seconds', async () => {
      //Get popup object
      const popupVisible = await page.$('#instructionPopup');
  
      //Ensure popup is visible
      const popupDisplay = await page.evaluate(popup => popup.style.display, popupVisible);
      expect(popupDisplay).toBe('block');  
  
      //Wait for 5 seconds for timeout
      await page.evaluate(() => new Promise(resolve => 
        setTimeout(resolve, 5500)
      ));
  
      //Ensure the popup is hidden after the timeout
      const popupDisplayAfter5s = await page.evaluate(popup => popup.style.display, popupVisible);
      expect(popupDisplayAfter5s).toBe('none');
    }, 10000);
  });
});