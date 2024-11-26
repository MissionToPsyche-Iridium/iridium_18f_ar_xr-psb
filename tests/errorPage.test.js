// TC-004
//using puppeteer
const puppeteer = require('puppeteer');
let url = 'http://127.0.0.1:3000/error.html'

describe('Error page', () => {
  let browser;
  let page;

  // Set up Puppeteer
  beforeAll(async () => {

    //Use default browser, Chrome
    //Specify if headless mode
    //Ignore HTTPS certificate and errors since useing self published certificate for AR
    browser = await puppeteer.launch({
        headless: false,
        args: ['--ignore-certificate-errors'],
        ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
      });
    page = await browser.newPage(); // Create a new page instance
    //Open the application url
    await page.goto(url);
  });

  // Close the browser after tests
  afterAll(async () => {
    await browser.close();
  });

  test('Displays error page when assets fail to load', async () => {
    // Intercept and block requests to simulate asset loading failure
    await page.setRequestInterception(true); // Enable request interception
    page.on('request', (request) => {
      if (request.url().endsWith('.js') || request.url().endsWith('.css')) {
        // Block JavaScript and CSS files
        request.abort();
      } else {
        request.continue(); // Allow other requests
      }
    });

    // Navigate to app's main page 
    await page.goto(url);

    // Wait for the error page to load and check header
    await page.waitForSelector('h1');
    const headerText = await page.$eval('h1', (el) => el.textContent);
    expect(headerText).toBe('Oops! Something went wrong.'); 

    // check paragraph
    const paragraphText = await page.$eval('p', (el) => el.textContent);
    expect(paragraphText).toBe('Check back later!');
  });
});
