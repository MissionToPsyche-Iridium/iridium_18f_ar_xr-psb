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
  });

  afterAll(async () => {
    //await browser.close();
  });

  describe("Orbit A popup test", () => {
    test('Instruction popup appears and disappears after 5 seconds', async () => {

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
      expect(isSpacecraftVisible).toBe(true);  // Ensure it's visible
    }, 10000);
  });

  describe("Orbit A motion test", () => {
    test('Scene responds to motion', async () => {

      //Move the cursor to orbitA location
      await page.mouse.move(300,300);
      await page.mouse.down();
      await page.mouse.move(625,512);
      await page.mouse.up();
  
      //Highlight orbitA
      await page.mouse.down();
      await page.mouse.up();
     
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


  describe("Orbit A information display", () => {
    test('Information specific to orbit A is displayed', async () => {
      //Get description box object
      const descriptionBoxVisible = await page.$('.orbit-description');
    
      expect(descriptionBoxVisible).not.toBeNull();

      //Ensure description Box is visible
      const isVisible = await page.evaluate(description => {
        if (!description) return false;
        const style = window.getComputedStyle(description);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, descriptionBoxVisible);
      expect(isVisible).toBe(true);

      //Get button element
      const seeMoreButton = await page.$('#see-more-btn');

      //Ensure the button exists and is visible
      expect(seeMoreButton).not.toBeNull();

      const isButtonVisible = await page.evaluate(button => {
        if (!button) return false;
        const style = window.getComputedStyle(button);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      }, seeMoreButton);
  
      expect(isButtonVisible).toBe(true);

      //Click the button
      await seeMoreButton.click();

      //Wait for the text box to expand 
      await page.evaluate(() => new Promise(resolve => 
        setTimeout(resolve, 500)
      ));

      //Verify if the text box has expanded 
      const expanded = await page.evaluate(description => {
        if (!description) return false;
        return description.scrollHeight > description.clientHeight; // Checks if content overflowed
      }, await page.$('.orbit-description'));

      expect(expanded).toBe(true);
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

      await instrumentButton.click();

    }, 10000);
  });
});