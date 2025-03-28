// TC-002
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5501/index.html'

describe('Orbit C scene interaction', () => {
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
    await browser.close();
  });

  describe("Orbit C popup test", () => {
    test('Instruction popup appears and disappears after 5 seconds', async () => {

      //Move the cursor to orbitC location
      await page.mouse.move(300,300);
      await page.mouse.down();
      await page.mouse.move(350,510);
      await page.mouse.up();
  
      //Highlight orbitC
      await page.mouse.down();
      await page.mouse.up();
      
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

  describe("Orbit C highlight test", ()=>{
    test('Orbit C scene responds to touch', async() => {

      //Get orbit C's color
      const orbitCColor = await page.evaluate(() => {
          const orbitC = document.querySelector('#orbitC');
          return orbitC.getAttribute('color');
      });
  
      //Check if orbit C has been highlighted
      expect(orbitCColor).toBe('#f9a000');

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

  describe("Orbit C motion test", () => {
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

  describe("Orbit C information display", () => {
    test('Information specific to orbit C is displayed', async () => {
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

      //Wait for the text box to expand (assuming it gets a new class or changes height)
      await page.evaluate(() => new Promise(resolve => 
        setTimeout(resolve, 500)
      ));

      //Verify if the text box has expanded (adjust the condition based on actual behavior)
      const expanded = await page.evaluate(description => {
        if (!description) return false;
        return description.scrollHeight > description.clientHeight; // Checks if content overflowed
      }, await page.$('.orbit-description'));

      expect(expanded).toBe(true);
    }, 10000);
  });

  describe("Orbit C instrument button", () => {
    test('Instrument view button for orbit C is displayed', async () => {
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

  describe("Orbit C error page", () => {
    test('Error page is displayed when orbit C is not loaded correctly', async () => {
    
    }, 10000);
  });

});