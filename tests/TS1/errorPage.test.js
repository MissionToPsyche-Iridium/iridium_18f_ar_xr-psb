// TC-004
//using puppeteer
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'// to test main page can open error page

describe('Error page', () => {
  let browser;
  let page;

  // Set up Puppeteer
  beforeAll(async () => {
    console.log('Launching browser...'); // debug
    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
      headless: false,
      args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
    });
    console.timeEnd('Browser Launch Time'); //debug

    page = await browser.newPage();
    console.time('Navigation Time');//debug
    //await page.goto(url);
    //console.timeEnd('Navigation Time');//debug
  }, 40000);

  // Close the browser after tests
  afterAll(async () => {
    await browser.close();
  },10000);

  test('Displays error page when assets fail to load', async () => {
    // Intercept and block requests to simulate asset loading failure
    await page.setRequestInterception(true); // Enable request interception
    page.on('request', (request) => {
      if (request.url().endsWith('.js') || request.url().endsWith('.css')) {
        // Block JavaScript and CSS files to simulate errors
        request.abort();
      } else {
        request.continue(); // Allow other requests
      }
    });

    // Navigate to app's main page, important assests should be blocked
    await page.goto(url);

    // Wait for the error page to load and check header
    await page.waitForSelector('h1');
    const headerText = await page.$eval('h1', (el) => el.textContent);
    expect(headerText).toBe('Oops! Something went wrong.'); 

    // check paragraph
    const paragraphText = await page.$eval('p', (el) => el.textContent);
    expect(paragraphText).toBe('Check back later!');
  }, 10000);
});
