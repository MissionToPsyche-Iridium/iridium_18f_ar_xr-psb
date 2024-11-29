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
  
    await page.mouse.move(300,300);
    await page.mouse.down();
    await page.mouse.move(410,500);
    await page.mouse.up();

    await page.mouse.down();
    await page.mouse.up();

    const orbitDColor = await page.evaluate(() => {
        const orbitD = document.querySelector('#orbitD');
        return orbitD.getAttribute('color');
      });

    // Assertion to check if the color changed as expected
    expect(orbitDColor).toBe('#FFD700'); // Replace with the expected color value
  
  }, 10000);
});