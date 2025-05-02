//Close tutorial video overlay in orbit view
async function closeOrbitOverlayIfVisible(page) {
    const isOverlayVisible = await page.evaluate(() => {
      const overlay = document.querySelector('#closeOverlay');
      if (!overlay) return false;
      return overlay.getAttribute('visible') !== 'false';
    });
  
    if (isOverlayVisible) {
      await page.mouse.move(30, 30);
      await page.mouse.down();
      await page.mouse.up();
    }
}
  
module.exports = { closeOrbitOverlayIfVisible };