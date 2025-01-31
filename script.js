import { initNavigationMenu, toggleMenu } from "./menu_script.js";

document.addEventListener('DOMContentLoaded', () => {
    
    initNavigationMenu();
    
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    const psyche = document.getElementById('psyche');
    let currentOrbit = null;
    let moveInterval = null;
    const orbitLinks = document.querySelectorAll('[data-orbit]');
    const orbitText = document.getElementById("orbit-text");
    const orbitTitle = document.getElementById("orbit-title");
    const seeMoreBtn = document.getElementById("see-more-btn");
    const orbitBox = document.querySelector(".orbit-description");
    const popupBox = document.getElementById("instructionPopup"); // Ensure pop-up remains functional

    // Check if there's a stored orbit from reference page and apply the functions
    const storedOrbit = sessionStorage.getItem("selectedOrbit");
    if (storedOrbit) {
        highlightOrbit(storedOrbit);
        transitionToOrbit(storedOrbit);
        updateBannerText(storedOrbit);
        panToPsyche();
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
                panToPsyche();
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
            panToPsyche();
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
        console.log("intial position:", startPosition); // debug
        console.log("returned position:", camera.getAttribute('position')); // debug
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
        displayInteractiveElement(orbitId); // Add this line
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

    // Function to load orbit details
    function loadOrbitDetails(orbitId) {
        const descriptionFile = `resources/${orbitId}/${orbitId}Description.txt`;

        fetch(descriptionFile)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })
            .then(data => {
                orbitTitle.innerText = orbitId.replace("orbit", "Orbit ");
                orbitText.innerText = data;

                // Reset description box to default state
                orbitBox.classList.remove("expanded");
                orbitText.style.maxHeight = "120px";
                orbitText.style.overflow = "hidden";

                // Ensure "See More" button remains visible
                seeMoreBtn.style.display = "block";
                seeMoreBtn.innerText = "See More";
            })
            .catch(error => {
                orbitText.innerText = "Orbit information unavailable.";
                console.error("Error loading orbit file:", error);
            });
    }
    
    // Ensure pop-up remains functional
    function showPopupMessage(message) {
        popupBox.innerText = message;
        popupBox.style.display = "block"; // Ensure it's visible
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 5000); // Hide after 5 seconds
    }

    // Expand/Collapse functionality
    seeMoreBtn.addEventListener("click", function () {
        if (orbitBox.classList.contains("expanded")) {
            orbitBox.classList.remove("expanded");
            seeMoreBtn.innerText = "See More";
            orbitText.style.maxHeight = "120px";
            orbitText.style.overflow = "hidden";
        } else {
            orbitBox.classList.add("expanded");
            seeMoreBtn.innerText = "See Less";
            orbitText.style.maxHeight = "none"; // Fully expand
            orbitText.style.overflow = "visible";
        }
    });

    // Update description when clicking orbit rings in UI
    orbits.forEach(orbitId => {
        const orbit = document.getElementById(orbitId);
        orbit.addEventListener('click', (event) => {
            event.stopPropagation();
            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            updateBannerText(orbitId);
            panToPsyche();
            loadOrbitDetails(orbitId); // Ensures description box updates
        });
    });

    // Update description when clicking orbit links in the navigation menu
    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const orbitId = link.getAttribute("data-orbit");
            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            updateBannerText(orbitId);
            loadOrbitDetails(orbitId); // Ensures description box updates
        });
    });

    // Load stored orbit if coming from another page
    storedOrbit = sessionStorage.getItem("selectedOrbit");
    if (storedOrbit) {
        highlightOrbit(storedOrbit);
        transitionToOrbit(storedOrbit);
        updateBannerText(storedOrbit);
        panToPsyche();
        loadOrbitDetails(storedOrbit);
        sessionStorage.removeItem("selectedOrbit");
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

// Function to display a clickable element when an orbit is selected
function displayInteractiveElement(orbitId) {
    // Remove any existing interactive elements
    const existingElement = document.querySelector('#interactiveElement');
    if (existingElement) existingElement.parentNode.removeChild(existingElement);

    // Create a new interactive element
    const interactiveElement = document.createElement('a-entity');
    interactiveElement.setAttribute('id', 'interactiveElement');
    interactiveElement.setAttribute('data-raycastable', ''); 
    interactiveElement.classList.add('clickable'); 

    // Customize the interactive element based on the selected orbit
    switch (orbitId) {
        case 'orbitA':
            interactiveElement.setAttribute('geometry', 'primitive: sphere; radius: 0.3');
            interactiveElement.setAttribute('material', 'color: green; opacity: 0.8');
            interactiveElement.setAttribute('position', '0 1 -3');
            break;
        case 'orbitB':
            interactiveElement.setAttribute('geometry', 'primitive: sphere; radius: 0.4');
            interactiveElement.setAttribute('material', 'color: blue; opacity: 0.8');
            interactiveElement.setAttribute('position', '1 1.5 -3.5');
            break;
        case 'orbitC':
            interactiveElement.setAttribute('geometry', 'primitive: sphere; radius: 0.35');
            interactiveElement.setAttribute('material', 'color: red; opacity: 0.8');
            interactiveElement.setAttribute('position', '-1 0.8 -2.5');
            break;
        case 'orbitD':
            interactiveElement.setAttribute('geometry', 'primitive: sphere; radius: 0.5');
            interactiveElement.setAttribute('material', 'color: yellow; opacity: 0.8');
            interactiveElement.setAttribute('position', '0.5 1.2 -3');
            break;
        default:
            console.error('Unknown orbit ID:', orbitId);
    }

    // Add click behavior for the element
    interactiveElement.addEventListener('click', () => {
        displayInfoWindow(orbitId);
    });

    // Add the element to the scene
    const scene = document.querySelector('a-scene');
    scene.appendChild(interactiveElement);
}

// Function to display the information window
function displayInfoWindow(orbitId) {
    // Remove any existing info windows
    const existingWindow = document.querySelector('#infoWindow');
    if (existingWindow) document.body.removeChild(existingWindow);

    // Create a new info window
    const infoWindow = document.createElement('div');
    infoWindow.setAttribute('id', 'infoWindow');
    infoWindow.style.position = 'fixed';
    infoWindow.style.top = '50%';
    infoWindow.style.left = '50%';
    infoWindow.style.transform = 'translate(-50%, -50%)';
    infoWindow.style.width = '300px';
    infoWindow.style.padding = '20px';
    infoWindow.style.backgroundColor = '#333';
    infoWindow.style.color = '#fff';
    infoWindow.style.borderRadius = '8px';
    infoWindow.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    infoWindow.style.zIndex = '1000';

    // Set the information based on the orbit ID
    switch (orbitId) {
        case 'orbitA':
            infoWindow.textContent = 'Orbit A: ';
            break;
        case 'orbitB':
            infoWindow.textContent = 'Orbit B: ';
            break;
        case 'orbitC':
            infoWindow.textContent = 'Orbit C: ';
            break;
        case 'orbitD':
            infoWindow.textContent = 'Orbit D: ';
            break;
        default:
            infoWindow.textContent = 'Unknown Orbit';
    }

    // Add a close button to the info window
    const closeButton = document.createElement('button');
    closeButton.textContent = '×'; 
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.padding = '5px 10px';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontWeight = 'bold';
    
    closeButton.addEventListener('click', () => {
        document.body.removeChild(infoWindow);
    });

    infoWindow.appendChild(closeButton);
    document.body.appendChild(infoWindow);
}

function displayErrorPage(){
    window.location.href = "/error.html";
}