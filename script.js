import { initNavigationMenu, toggleMenu } from "./menu_script.js";

document.addEventListener('DOMContentLoaded', () => {
    
    initNavigationMenu();
    textSizeToggle()
    
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    const psyche = document.getElementById('psyche');
    let currentOrbit = null;
    let moveInterval = null;
    const orbitLinks = document.querySelectorAll('[data-orbit]');

    // Check if there's a stored orbit from reference page and apply the functions
    const storedOrbit = sessionStorage.getItem("selectedOrbit");
    if (storedOrbit) {
        highlightOrbit(storedOrbit);
        transitionToOrbit(storedOrbit);
        updateBannerText(storedOrbit);
        panToPsyche(storedOrbit);
        orbitPopupText(storedOrbit);

        // Clear stored value after applying the functions
        sessionStorage.removeItem("selectedOrbit");
    }

    if(window.location.pathname.includes("index.html")){    
        // Event listeners for each orbit click
        orbits.forEach(orbitId => {
            const orbit = document.getElementById(orbitId);
            orbit.addEventListener('click', (event) => {
                event.stopPropagation();
                highlightOrbit(orbitId);
                transitionToOrbit(orbitId);
                updateBannerText(orbitId);
                panToPsyche(orbitId);
                orbitPopupText(orbitId);
            });
        });
    }
    

    // Event listeners for each navigation menu link
    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {

            event.preventDefault();  // Prevent default link behavior (page reload)
            event.stopPropagation();
            const orbitId = link.getAttribute('data-orbit');

            sessionStorage.setItem("selectedOrbit", orbitId);

            if(window.location.pathname.includes("References.html")){
                window.location.href = "index.html"
                return;
            }

            toggleMenu();
            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            updateBannerText(orbitId);
            panToPsyche(orbitId);
            orbitPopupText(orbitId);
        });
    });

    // Function to move the object through the selected orbit
    function moveObjectThroughOrbit(orbitId) {
        const orbit = document.getElementById(orbitId);
        const radius = parseFloat(orbit.getAttribute('radius')) - 0.1;
        let angle = 0;
    
        // Get the y position of the orbit
        const orbitY = orbit.object3D.position.y;
        const orbitX = orbit.object3D.position.x;
        const orbitZ = orbit.object3D.position.z;
    
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
                movingObject.setAttribute('position', `${x} ${y + orbitY} ${orbitZ}`);
               
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
    function panToPsyche(orbitId) {
        const psychePosition = psyche.getAttribute('position');
        const cameraRig = document.getElementById('cameraRig');
        var targetPosition;

        if (orbitId === "orbitA") {
            targetPosition = { x: parseFloat(psychePosition.x), y: parseFloat(psychePosition.y) + 2, z: parseFloat(psychePosition.z) + 4 };
        } else if (orbitId === "orbitB") {
            targetPosition = { x: parseFloat(psychePosition.x), y: parseFloat(psychePosition.y) + 1.75, z: parseFloat(psychePosition.z) + 3.5 };
        } else if (orbitId === "orbitC") {
            targetPosition = { x: parseFloat(psychePosition.x), y: parseFloat(psychePosition.y) + 1.5, z: parseFloat(psychePosition.z) + 3 };
        } else if (orbitId === "orbitD") {
            targetPosition = { x: parseFloat(psychePosition.x), y: parseFloat(psychePosition.y) + 1.5, z: parseFloat(psychePosition.z) + 2 };
        } else {
            console.error("Invalid orbitId:", orbitId);
            return;
        }

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
            orbit.setAttribute('color', id === selectedId ? '#f9a000' : '#ffffff');
            orbit.setAttribute('opacity', id === selectedId ? '0.7' : '0.25');
        });
    }

    // Transition to selected orbit
    function transitionToOrbit(orbitId) {
        if (currentOrbit === orbitId) return;
        currentOrbit = orbitId;
        moveObjectThroughOrbit(orbitId);
    }

    if(window.location.pathname.includes("index.html")){
        // Show the popup when the page loads
        window.addEventListener('load', () => {
            const popup = document.getElementById("instructionPopup");
            popup.style.display = "block"; // Show the popup
        
            // Hide the popup after 5 seconds
            setTimeout(() => {
                popup.style.display = "none";
            }, 5000);
        });
    }

    function orbitPopupText(orbitID){
        const popup = document.getElementById("instructionPopup");
        let filePath;

        // Check which orbit it is
        if (orbitID == "orbitA") {
            filePath = 'resources/orbitA/orbitAInstructions.txt';
        }
        if (orbitID == "orbitB") {
            filePath = 'resources/orbitB/orbitBInstructions.txt';
        }
        if (orbitID == "orbitC") {
            filePath = 'resources/orbitC/orbitCInstructions.txt';
        }
        if (orbitID == "orbitD"){
            filePath = 'resources/orbitD/orbitDInstructions.txt';
        }
            
        // Get the popup text
        fetch(filePath)
            //Get text
            .then(response => response.text())

            //Put text in popup and display it
            .then(text => {
                popup.textContent = text;
                popup.style.display = "block"; // Show the popup
            })
        .catch(error => console.error("Error loading text file:", error));            

        // Hide the popup after 20 seconds
        setTimeout(() => {
            popup.style.display = "none";
        }, 20000);
    }

    // Change banner text
    function updateBannerText(orbitID){
        const bannerText = document.getElementById("bannerText"); 

        if (orbitID == "orbitA") {
            bannerText.textContent = "Orbit A";
        }
        if (orbitID == "orbitB") {
            bannerText.textContent = "Orbit B";
        }
        if (orbitID == "orbitC") {
            bannerText.textContent = "Orbit C";
        }
        if (orbitID == "orbitD"){
            bannerText.textContent = "Orbit D";
        }
    }
    window.moveObjectThroughOrbit = moveObjectThroughOrbit;
    window.highlightOrbit = highlightOrbit;
});

function textSizeToggle(){
    document.getElementById("textSizeBtn").addEventListener("click", () => {
        let textElement = document.getElementById("bannerText");

        if(textElement.style.fontSize === "16px" || textElement.style.fontSize === ""){
            textElement.style.fontSize = "24px";
        }
        else{
            textElement.style.fontSize = "16px";
        }
    });
}

function displayErrorPage(){
    window.location.href = "/error.html";
}