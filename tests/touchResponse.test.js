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

  test('Scene responds to touch', async () => {
  
    //Move the cursor to orbitD location
    await page.mouse.move(300,300);
    await page.mouse.down();
    await page.mouse.move(400,500);
    await page.mouse.up();

    //Click the cursor
    await page.mouse.down();
    await page.mouse.up();

    //Get orbit D's color
    const orbitDColor = await page.evaluate(() => {
        const orbitD = document.querySelector('#orbitD');
        return orbitD.getAttribute('color');
    });

    //Check if orbit D has been highlighted
    expect(orbitDColor).toBe('#f9a000'); // Replace with the expected color value
  
  }, 10000);
});