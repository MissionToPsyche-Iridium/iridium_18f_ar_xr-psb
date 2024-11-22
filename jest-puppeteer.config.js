module.exports = {
    launch: {
      headless: true, // Set to false if you want to see the browser for debugging
      slowMo: 50, // Adds a delay between actions (useful for debugging)
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for CI/CD
    },
    browserContext: 'default',
  };