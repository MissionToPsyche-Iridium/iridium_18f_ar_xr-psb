// TC-002
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'

describe('AR scene interaction', () => {
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