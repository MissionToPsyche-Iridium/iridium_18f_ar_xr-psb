// TS-002
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5501/index.html'

describe('Orbit A scene interaction', () => {
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
  },10000);

  afterAll(async () => {
    await browser.close();
  });

  describe("Orbit A popup test", () => {
    test('Instruction popup appears and disappears after 5 seconds', async () => {
      //Select OrbitA
      await page.evaluate(() => {
        const hitbox = document.querySelector('#orbitA-wrapper .hitbox');
        if (hitbox) {
           hitbox.emit('click');
        }
      });
      
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

  describe("Orbit A visual components", () => {
    test('Orbit A objects render', async () => {
      //Check is entites exists
      const asteroidExists = await page.$('#psyche');
      await expect(asteroidExists).not.toBeNull();

      const orbitDExists = await page.$('#orbitD');
      expect(orbitDExists).not.toBeNull();

      const orbitCExists = await page.$('#orbitC');
      expect(orbitCExists).not.toBeNull();

      const orbitBExists = await page.$('#orbitB');
      expect(orbitBExists).not.toBeNull();

      const orbitAExists = await page.$('#orbitA');
      expect(orbitAExists).not.toBeNull();

      const satelliteExists = await page.$('#moving-object');
      expect(satelliteExists).not.toBeNull()

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

      //Check if orbit A is visible
      const isSatelliteVisible = await page.evaluate(() => {
        const satellite = document.querySelector('#moving-object');
        if(!satellite) return false;

        const isVisible = satellite.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isSatelliteVisible).toBe(true);  // Ensure it's visible

    }, 10000);
  });

  describe("Orbit A device touch and movement response test", () => {
    test('Orbit A response to device touch and movement', async () => {
     
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

  describe("Orbit A highlight test", ()=>{
    test('Orbit A is highlighted and spacecraft object is visible when selected', async() => {
  
      //Get orbit A's color
      const orbitAColor = await page.evaluate(() => {
          const orbitA = document.querySelector('#orbitA');
          return orbitA.getAttribute('color');
      });
  
      //Check if orbit A has been highlighted
      expect(orbitAColor).toBe('#f9a000'); 
    
      //Check if spacecraft is visible
      const isSpacecraftVisible = await page.evaluate(() => {
        const spacecraft = document.querySelector('#moving-object');
        if(!spacecraft) return false;

        const isVisible = spacecraft.getAttribute('visible') !== 'false';
        return isVisible;
      });

      expect(isSpacecraftVisible).toBe(true);

    }, 10000);
  });

  describe("Orbit A instrument button", () => {
    test('Instrument view button for orbit A is displayed', async () => {
      //Get button element
      const instrumentButton = await page.$('#instrumentButton');

      //Ensure the button exists and is visible
      expect(instrumentButton).not.toBeNull();

      const isButtonVisible = await page.evaluate(button => {
        if (!button) return false;
        const style = window.getComputedStyle(button);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, instrumentButton);
    }, 10000);
  });

  describe("Orbit A navigation menu test", () => {
    test('Navigation menu expands and displays orbit links', async () => {
      //Ensure the menu starts collapsed
      let menu = await page.$('#navbarNav');
      let isVisible = await menu.evaluate(el => window.getComputedStyle(el).display !== 'none');
      expect(isVisible).toBe(false);

      //Open the menu
      await page.click('#btnToggle');
      await page.waitForSelector('#navbarNav', { visible: true });

      //Check that all orbit links are present
      const expectedLinks = [
        { orbit: 'orbitA', text: 'Orbit A: Characterization' },
        { orbit: 'orbitB', text: 'Orbit B: Topography' },
        { orbit: 'orbitC', text: 'Orbit C: Gravity Science' },
        { orbit: 'orbitD', text: 'Orbit D: Elemental Mapping' },
      ];

      for (const { orbit, text } of expectedLinks) {
        const link = await page.$(`a[data-orbit="${orbit}"]`);
        expect(link).not.toBeNull();
  
        const linkText = await link.evaluate(el => el.textContent.trim());
        expect(linkText).toBe(text);
      }
  
      // Check the info icon exists
      const infoIcon = await page.$('.info-icon img[alt="Info"]');
      expect(infoIcon).not.toBeNull();
  
      // Close the menu
      await page.click('#btnToggle');
      await page.waitForFunction(() => {
        const menu = document.querySelector('#navbarNav');
        return menu && window.getComputedStyle(menu).display === 'none';
      });
    }, 10000);
  });
});