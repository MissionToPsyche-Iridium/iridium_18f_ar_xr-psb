// menu_script.js
document.addEventListener('DOMContentLoaded', () => {
    const btnToggle = document.getElementById("btnToggle");
    const hamburgerIcon = document.getElementById("hamburgerIcon");
    const closeIcon = document.getElementById("closeIcon");
    const navigationMenu = document.querySelector(".navigation__menu");

    // Function to toggle the menu and the visibility of the icons
    function toggleMenu() {
        // Toggle the menu visibility
        navigationMenu.classList.toggle("active");

        // Toggle the visibility of the hamburger and close icons
        hamburgerIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
    }

    // Add event listener to the hamburger button
    btnToggle.addEventListener("click", toggleMenu);

    // Add event listener to the close button (close the menu when clicked)
    closeIcon.addEventListener("click", toggleMenu);

    // Function to handle orbit selection from the menu
    function handleOrbitSelection(orbitId) {
        // Highlight the selected orbit
        if (window.highlightOrbit) {
            window.highlightOrbit(orbitId);
        }
    
        if (window.moveObjectThroughOrbit) {
            window.moveObjectThroughOrbit(orbitId);
        }

        // Trigger any other functions, like transitioning or showing popups
        if (window.transitionToOrbit) {
            window.transitionToOrbit(orbitId);
        }
    
        // Close the menu after selection
        navigationMenu.classList.remove('active');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
    

    // Set up event listeners for each menu item
    document.querySelectorAll('.navigation__item a').forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Get the orbit ID from the data-orbit attribute
            const orbitId = link.getAttribute('data-orbit');

            // If the orbit ID exists and is valid, proceed
            if (orbitId) {
                handleOrbitSelection(orbitId);
            }
        });
    });
});
