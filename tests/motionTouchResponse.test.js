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
    await page.goto(url);  // Use your actual HTTPS URL
  });

  afterAll(async () => {
    //await browser.close();
  });

  test('Scene responds to motion and touch', async () => {
    const centralObject = await page.$('#psyche');
    expect(centralObject).not.toBeNull();

    const initialPosition = await page.evaluate((element) => {
        return element.getAttribute('position');
    }, centralObject);

    await page.mouse.move(300,300);
    await page.mouse.down();
    await page.mouse.move(500,500);
    await page.mouse.up();

    const finalPosition = await page.evaluate((element) => {
        return element.getAttribute('position');
    }, centralObject);

    expect(initialPosition).not.toEqual(finalPosition);

    console.log('Initial Position:', initialPosition);
    console.log('Final Position:', finalPosition);
    
  }, 10000);
});