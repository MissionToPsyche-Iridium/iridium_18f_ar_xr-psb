module.exports = {
    launch: {
      headless: false, // Set to false if you want to see the browser for debugging
      slowMo: 50, // Adds a delay between actions
      args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox'],
      ignoreHTTPSErrors: true,  // This disables HTTPS certificate checking
    },
    browserContext: 'default',
  };