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

  test('Orbit A scene responds to touch', async () => {
  
    //Move the cursor to orbitA location
    await page.mouse.move(300,300);
    await page.mouse.down();
    await page.mouse.move(625,512);
    await page.mouse.up();

    //Click the cursor
    await page.mouse.down();
    await page.mouse.up();

    //Get orbit A's color
    const orbitAColor = await page.evaluate(() => {
        const orbitA = document.querySelector('#orbitA');
        return orbitA.getAttribute('color');
    });

    //Check if orbit A has been highlighted
    expect(orbitAColor).toBe('#f9a000'); // Replace with the expected color value*/
  
  }, 10000);
});