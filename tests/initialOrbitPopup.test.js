// TC-003
//using puppeteer
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5500/index.html'

describe('AR Web App', () => {
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

  test('Instruction popup appears and disappears after 5 seconds', async () => {
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