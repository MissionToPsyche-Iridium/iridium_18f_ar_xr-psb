// TC-002
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'

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
  
      //Move the cursor to orbitC location
      await page.mouse.move(300,300);
      await page.mouse.down();
      await page.mouse.move(350,510);
      await page.mouse.up();
  
      //Click the cursor
      await page.mouse.down();
      await page.mouse.up();
  
      //Get orbit C's color
      const orbitCColor = await page.evaluate(() => {
          const orbitC = document.querySelector('#orbitC');
          return orbitC.getAttribute('color');
      });
  
      //Check if orbit C has been highlighted
      expect(orbitCColor).toBe('#f9a000'); // Replace with the expected color value*/
    
    }, 10000);
  });

  describe("Orbit C motion test", () => {

    test('Scene responds to motion', async () => {

      //Move the cursor to orbitC location
      await page.mouse.move(300,300);
      await page.mouse.down();
      await page.mouse.move(500,500);
      await page.mouse.up();
  
      //Highlight orbitC
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

});