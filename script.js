import { initNavigationMenu, toggleMenu } from './navigationMenu.js';

document.addEventListener('DOMContentLoaded', () => {
    
    initNavigationMenu();
    
    
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    const psyche = document.getElementById('psyche');
    let currentOrbit = null;
    let moveInterval = null;
    const orbitLinks = document.querySelectorAll('[data-orbit]');
    

    // Event listeners for each orbit click
    orbits.forEach(id => {
        const orbit = document.getElementById(id);
        orbit.addEventListener('click', (event) => {
            event.stopPropagation();
            highlightOrbit(id);
            transitionToOrbit(id);
            panToPsyche();
        });
    });

    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();  // Prevent default link behavior (page reload)
            event.stopPropagation();
            const orbitId = link.getAttribute('data-orbit');

            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            panToPsyche();
            toggleMenu();
        });
    });

    // Function to move the object through the selected orbit
    function moveObjectThroughOrbit(orbitId) {
        const orbit = document.getElementById(orbitId);
        const radius = parseFloat(orbit.getAttribute('radius-outer')) - 0.1;
        let angle = 0;

        // Get the y position of the orbit
        const orbitY = orbit.object3D.position.y;

        // Set the object visibility to true and position based on orbit level
        movingObject.setAttribute('visible', 'true');
        movingObject.setAttribute('position', `0 ${orbitY} -4`);

        // Clear any previous movement if switching orbits
        if (moveInterval) clearInterval(moveInterval);

        // Move object along the orbit
        moveInterval = setInterval(() => {
            angle += 0.01;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            movingObject.setAttribute('position', `${x} ${orbitY} ${z - 4}`);
            if (angle > Math.PI * 2) angle = 0;
        }, 16);
    }

    // Smooth camera pan and rotate to look at Psyche
    function panToPsyche() {
        const psychePosition = psyche.getAttribute('position');
        const targetPosition = { x: parseFloat(psychePosition.x), y: parseFloat(psychePosition.y) + 1.5, z: parseFloat(psychePosition.z) + 2 };
        const startPosition = camera.getAttribute('position');
        const steps = 90;
        let step = 0;

        const interval = setInterval(() => {
            if (step < steps) {
                const t = step / steps;
                camera.setAttribute('position', {
                    x: startPosition.x + (targetPosition.x - startPosition.x) * t,
                    y: startPosition.y + (targetPosition.y - startPosition.y) * t,
                    z: startPosition.z + (targetPosition.z - startPosition.z) * t
                });
                step++;
            } else {
                clearInterval(interval);
                // Set the camera to look at the Psyche object after panning
                camera.setAttribute('look-at', '#psyche');
            }
        }, 10);
    }

    // Highlight selected orbit
    function highlightOrbit(selectedId) {
        orbits.forEach(id => {
            const orbit = document.getElementById(id);
            orbit.setAttribute('color', id === selectedId ? '#FFD700' : '#ffffff');
            orbit.setAttribute('opacity', id === selectedId ? '1' : '0.2');
        });
    }

    // Transition to selected orbit
    function transitionToOrbit(orbitId) {
        if (currentOrbit === orbitId) return;
        currentOrbit = orbitId;
        moveObjectThroughOrbit(orbitId);
    }

    // JavaScript to show the popup when the page loads
    window.addEventListener('load', () => {
        const popup = document.getElementById("instructionPopup");
        popup.style.display = "block"; // Show the popup
    
        // Hide the popup after 5 seconds
        setTimeout(() => {
            popup.style.display = "none";
        }, 5000);
    });
    
    
});


