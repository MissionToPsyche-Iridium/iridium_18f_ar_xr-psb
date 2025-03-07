// app.js

// Function to update the content based on the route
function updateContent(route) {
    const contentDiv = document.getElementById('content');
    if (route === 'orbitB') {
        contentDiv.textContent = 'You are viewing Orbit B';
    } else {
        contentDiv.textContent = 'Welcome to the default orbit view!';
    }
}

// Function to handle navigation
function navigateToOrbit(orbitId) {
    // Update the URL using pushState but without reloading the page
    window.history.pushState({ orbit: orbitId }, '', `/${orbitId}`);
    updateContent(orbitId);
}

// Set up button click handler for Orbit B
document.getElementById('orbitBBtn').addEventListener('click', () => {
    navigateToOrbit('orbitB');
});

// Handle route on page load by checking the current path
const currentRoute = window.location.pathname.split('/')[1];
updateContent(currentRoute || 'default');

// Listen for browser navigation (back/forward)
window.addEventListener('popstate', (event) => {
    const orbitId = event.state?.orbit || 'default';
    updateContent(orbitId);
});
