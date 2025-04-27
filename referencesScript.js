
const orbitLinks = document.querySelectorAll('[data-orbit]');

// Event listeners for each navigation menu link
orbitLinks.forEach(link => {
    link.addEventListener('click', (event) => {

        event.preventDefault();  // Prevent default link behavior (page reload)
        event.stopPropagation();
        const orbitId = link.getAttribute('data-orbit');
        console.log(orbitId);

        // Save orbit
        sessionStorage.setItem("selectedOrbit", orbitId);

        // Redirect to orbit view page
        window.location.href = "index.html"
    });
});