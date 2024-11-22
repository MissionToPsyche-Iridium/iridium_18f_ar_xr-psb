import { navigationMenu } from "./menu_script.js";

document.addEventListener('DOMContentLoaded', () => {
    
    navigationMenu();
    
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    const psyche = document.getElementById('psyche');
    let currentOrbit = null;
    let moveInterval = null;
    //const btnToggle = document.querySelector("#btnToggle");



    // Event listeners for each orbit click
    orbits.forEach(id => {
        const orbit = document.getElementById(id);
        orbit.addEventListener('click', (event) => {
            event.stopPropagation();
            highlightOrbit(id);
            transitionToOrbit(id);
            panToPsyche();
            orbitPopupText(id);
        });
    });

    // Function to move the object through the selected orbit
    function moveObjectThroughOrbit(orbitId) {
        const orbit = document.getElementById(orbitId);
        const radius = parseFloat(orbit.getAttribute('radius-outer')) - 0.1;
        let angle = 0;
    
        // Get the y position of the orbit
        const orbitY = orbit.object3D.position.y;
    
        // Set the object visibility to true and position it based on the orbit level
        movingObject.setAttribute('visible', 'true');
        movingObject.setAttribute('position', `0 ${orbitY} -4`);
    
        // Clear any previous movement if switching orbits
        if (moveInterval) clearInterval(moveInterval);
    
        // Move object along the orbit, accounting for orbit type
        moveInterval = setInterval(() => {
            angle += 0.01;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
    
            // Adjust the object's position based on the orbit
            if (orbitId === "orbitD") {
                // Circular motion along the YZ-plane (with x constant)
                const y = radius * Math.sin(angle);  // Vertical (up/down) motion based on sine
                const z = radius * Math.cos(angle);  // Horizontal (forward/backward) motion based on cosine
                movingObject.setAttribute('position', `${x} ${y + orbitY} ${z - 4}`);
            } else if (orbitId === "orbitC" || orbitId === "orbitB" || orbitId === "orbitA") {
                // For orbit C, B, and A, rotate around the Y-axis, which means moving along the Y-axis
                 // Use y for vertical motion for these orbits
                movingObject.setAttribute('position', `${x} ${orbitY} ${z - 4}`);
            }
    
            // Reset angle after one full orbit
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

    function orbitPopupText(orbitID){
        const popup = document.getElementById("instructionPopup");
        let filePath;

        //Check which orbit it is
        if (orbitID == "orbitA") {
            filePath = 'resources/orbitA.txt';
        }
        if (orbitID == "orbitB") {
            filePath = 'resources/orbitB.txt';
        }
        if (orbitID == "orbitC") {
            filePath = 'resources/orbitC.txt';
        }
        if (orbitID == "orbitD"){
            filePath = 'resources/orbitD.txt';
        }
            
        //Get the popup text
        fetch(filePath)
            //Get text
            .then(response => response.text())

            //Put text in popup and display it
            .then(text => {
                popup.textContent = text;
                popup.style.display = "block"; // Show the popup
            })
        .catch(error => console.error("Error loading text file:", error));            

        // Hide the popup after 5 seconds
        setTimeout(() => {
            popup.style.display = "none";
        }, 5000);
    }
    window.moveObjectThroughOrbit = moveObjectThroughOrbit;
    window.highlightOrbit = highlightOrbit;
});


