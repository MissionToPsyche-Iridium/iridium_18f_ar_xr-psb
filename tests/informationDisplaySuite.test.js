// TS-006
const puppeteer = require('puppeteer');
let url = 'https://127.0.0.1:5501/index.html'

describe('Orbit A scene interaction', () => {
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

    //Check if overlay is visible
    const isOverlayVisible = await page.evaluate(() => {
      const overlay = document.querySelector('#closeOverlay');
      if(!overlay) return false;

      const isVisible = overlay.getAttribute('visible') !== 'false';
      return isVisible;
    });
    expect(isOverlayVisible).toBe(true);

    //Click outside overlay to close it
    await page.mouse.move(30,30);
    await page.mouse.down();
    await page.mouse.up();
  },10000);

  afterAll(async () => {
    await browser.close();
  });

  describe("Orbit A information display", () => {
    const orbits = ['A', 'B', 'C', 'D'];
    test.each(orbits)('Information specific to orbit A is displayed', async (name) => {
        //Get Orbit hitbox and click it
        await page.evaluate((orbitName) => {
            const hitbox = document.querySelector(`#orbit${orbitName}-wrapper .hitbox`);
            if (hitbox) {
            hitbox.emit('click');
            }
        }, name);

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

        //Wait for the text box to expand 
        await page.evaluate(() => new Promise(resolve => 
            setTimeout(resolve, 500)
        ));

        //Verify if the text box has expanded 
        const isExpanded = await page.evaluate(() => {
            const el = document.querySelector('.orbit-description');
            return el?.classList.contains('expanded');
        });
        expect(isExpanded).toBe(true);
    }, 10000);
  });

  

});