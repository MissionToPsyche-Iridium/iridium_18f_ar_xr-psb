document.addEventListener('DOMContentLoaded', () => {
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    const psyche = document.getElementById('psyche');
    let currentOrbit = null;
    let moveInterval = null;
    const btnToggle = document.querySelector("#btnToggle");
    const hamburgerIcon = document.querySelector("#hamburgerIcon");
    const closeIcon = document.querySelector("#closeIcon");
    const navigationMenu = document.querySelector(".navigation__menu");

    btnToggle.addEventListener("click", () => {
        navigationMenu.classList.toggle("active");
        hamburgerIcon.classList.toggle("hidden");
        closeIcon.classList.toggle("hidden");
    });

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

    // Function to move object through a selected orbit
    function moveObjectThroughOrbit(orbitId) {
        const orbit = document.getElementById(orbitId);
        const radius = parseFloat(orbit.getAttribute('radius-outer')) - 0.1;
        let angle = 0;
        const orbitY = orbit.object3D.position.y;

        movingObject.setAttribute('visible', 'true');
        movingObject.setAttribute('position', `0 ${orbitY} -4`);

        if (moveInterval) clearInterval(moveInterval);
        moveInterval = setInterval(() => {
            angle += 0.01;
            const x = radius * Math.cos(angle);
            const z = radius * Math.sin(angle);
            movingObject.setAttribute('position', `${x} ${orbitY} ${z - 4}`);
            if (angle > Math.PI * 2) angle = 0;
        }, 16);
    }

    // Function to transition to selected orbit
    function transitionToOrbit(orbitId) {
        if (currentOrbit === orbitId) return;
        currentOrbit = orbitId;
        moveObjectThroughOrbit(orbitId);
    }

    // Function to pan the camera to Psyche
    function panToPsyche() {
        const psychePosition = psyche.getAttribute('position');
        const targetPosition = {
            x: parseFloat(psychePosition.x),
            y: parseFloat(psychePosition.y) + 1.5,
            z: parseFloat(psychePosition.z) + 2
        };
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
                camera.setAttribute('look-at', '#psyche');
            }
        }, 10);
    }

    // Function to add event listeners to the orbits
    function addOrbitEventListeners() {
        orbits.forEach(id => {
            const orbit = document.getElementById(id);
            orbit.addEventListener('click', (event) => {
                event.stopPropagation();
                highlightOrbit(id);
                transitionToOrbit(id);
                panToPsyche();
            });
        });
    }

    // Initialize event listeners for orbits
    addOrbitEventListeners();

    // Export functions for menu interactions
    window.highlightOrbit = highlightOrbit;
    window.transitionToOrbit = transitionToOrbit;
    window.panToPsyche = panToPsyche;
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
    
    
});
