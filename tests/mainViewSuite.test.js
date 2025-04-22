// T-001
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

  describe("Main view introduction slides test", () => {
    test('Main view display\'s introduction slides when first loaded', async () => {
      //Check if overlay is visible
      const isOverlayVisible = await page.evaluate(() => {
        const overlay = document.querySelector('#closeOverlay');
        if(!overlay) return false;

        const isVisible = overlay.getAttribute('visible') !== 'false';
        return isVisible;
      });
      expect(isOverlayVisible).toBe(true);

      //Slide info
      const introSlides = [
        { type: "video", text: "On October 13, 2023, NASA\'s Psyche mission took flight." },
        { type: "gif", text: "Aboard a SpaceX Falcon Heavy rocket, the spacecraft began its 6-year journey." },
        { type: "video", text: "The Psyche spacecraft is on a 2.5 billion-mile journey to a metal-rich asteroid named Psyche." },
        { type: "video", text: "Upon arrival, the spacecraft will follow four orbital paths using various scientific instruments to gather data." },
        { type: "video", text: "Scientists believe there\'s much to learn from the Psyche asteroid — including how planets form!" },
      ];

      //Check each slide
      for (let i = 0; i < introSlides.length; i++) {
        const slide = introSlides[i];
  
        //Wait for the media container to load
        await page.waitForSelector('#mediaContainer');
  
        //Check slide type and verify modal
        if (slide.type === "video") {
          const iframe = await page.$('#mediaContainer iframe');
          expect(iframe).not.toBeNull();
        } else if (slide.type === "gif") {
          const img = await page.$('#mediaContainer img');
          expect(img).not.toBeNull();
        }
  
        //Check text
        const textElement = await page.waitForSelector('.slide-description');
        const text = await textElement.evaluate(el => el.textContent);
        expect(text).toContain(slide.text);
  
        //Click next if not last slide
        if (i < introSlides.length - 1) {
          await page.click('#nextBtn');
        }
      }

      //Get last slide
      await page.click('#nextBtn');

      //Final slide: check Enter button visible
      const enterButton = await page.waitForSelector('#enterBtn', { state: 'visible' });
      expect(enterButton).not.toBeNull();

      //Click Enter to close
      await enterButton.click();
  
      //Wait for modal to be hidden
      await page.waitForSelector('#introModal', { state: 'hidden' });
    }, 10000);
  });

  describe("Main view countdown timer test", () => {
    test('Countdown timer is displayed in the initial orbital view and shows the correct time', async () => {
      //Get countdown object
      const countdown = await page.$('#countdown');
      expect(countdown).not.toBeNull();
  
      //Check if countdown is visible (using computed style)
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, countdown);
      expect(isVisible).toBe(true);  
  
      //Get the countdown timer text content
      const timeText = await page.$eval('#countdown-timer', el => el.textContent.trim());

      //Ensure it's not empty
      expect(timeText.length).toBeGreaterThan(0);

      //Validate format (e.g., matches hh:mm:ss or mm:ss)
      //const timeFormat = /^(\d{1,2}:)?\d{1,2}:\d{2}$/; // Accepts mm:ss or hh:mm:ss
      //expect(timeText).toMatch(timeFormat);
      
    }, 10000);
  });

  describe("Main view system objects rendering test", () => {
    test('Asteroid and orbits object renderings', async () => {
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

  describe("Main view device touch and movement response test", () => {
    test('Main view response to device touch and movement', async () => {
  
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

  describe("Main view pop-up instructions test", () => {
    test('Pop-up instructions appear and disappear after 5 second ', async () => {
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

  describe("Orbital view transition", () => {
    const orbits = ['A', 'B', 'C', 'D'];

    test.each(orbits)('Orbital view transitions to each orbit when selected ', async (name) => {
      //Get initial camera position
      const initialPosition = await page.evaluate(() => {
        const camera = document.querySelector('#camera');
        return camera ? camera.getAttribute('position') : null;
      });
      
      //Get Orbit hitbox and click it
      await page.evaluate((orbitName) => {
        const hitbox = document.querySelector(`#orbit${orbitName}-wrapper .hitbox`);
        if (hitbox) {
          hitbox.emit('click');
        }
      }, name);
      
      //Get orbit color attribute after the interaction
      const orbitColor = await page.evaluate((orbitName) => {
          const orbit = document.querySelector(`#orbit${orbitName}`);
          return orbit.getAttribute('color');
      }, name);

      //Check if orbit A has been highlighted with the expected color value
      expect(orbitColor).toBe('#f9a000');
  
      //Ensure initial position exists
      expect(initialPosition).not.toBeNull();
  
      //Get the updated camera position
      const updatedPosition = await page.evaluate(() => {
        const camera = document.querySelector('#camera');
        return camera ? camera.getAttribute('position') : null;
      });
  
      // Ensure the camera position has changed
      expect(updatedPosition).not.toBe(initialPosition);
    }, 10000);
  });

  describe("Main navigation menu test", () => {
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