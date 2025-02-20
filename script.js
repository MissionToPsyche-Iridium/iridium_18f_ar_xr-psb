import { initNavigationMenu, toggleMenu } from "./menuScript.js";
var countDownDate = new Date("Aug 1, 2029 0:0:0"); //Arrives in late July

document.addEventListener('DOMContentLoaded', () => {
    
    initNavigationMenu();
    textSizeToggle();
    textToSpeak();
    
    
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
    const instrumentButton = document.getElementById("instrumentButton");
    
    // Check if there's a stored orbit from reference page and apply the functions
    let storedOrbit = sessionStorage.getItem("selectedOrbit");
    if (storedOrbit) {

        camera.setAttribute('position', {
            x: 0,
            y: 1.1,
            z: -1
        });
        highlightOrbit(storedOrbit);
        transitionToOrbit(storedOrbit);
        updateBannerText(storedOrbit);
        panToPsyche(storedOrbit);
        orbitPopupText(storedOrbit);

        // Clear stored value after applying the functions
        sessionStorage.removeItem("selectedOrbit");
    }
 
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
    

    // Event listeners for each navigation menu link
    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {

            event.preventDefault();  // Prevent default link behavior (page reload)
            event.stopPropagation();
            const orbitId = link.getAttribute('data-orbit');
            console.log(orbitId);

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
        //const radius = parseFloat(orbit.getAttribute('radius')) - 0.1;
        const radius = parseFloat(orbit.getAttribute('radius'));
        let angle = 0;
    
        // Get the y position of the orbit (hardcoded due for switching from reference)
        const orbitY = -1;
        const orbitZ = -4;
    
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
                //const z = radius * Math.cos(angle);  // Horizontal (forward/backward) motion based on cosine
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
        const psychePosition = {x:0,y:-1.2,z:-4}
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
        
            orbitBox.classList.add("show"); // toggle visibility so orbit info box can be seen
            //loadOrbitDetails(selectedId);
        });
    }

    // Transition to selected orbit
    function transitionToOrbit(orbitId) {
        if (currentOrbit === orbitId) return;
        currentOrbit = orbitId;
        moveObjectThroughOrbit(orbitId);
    }

    // Show the popup when the page loads
    window.addEventListener('load', () => {
        popupBox.style.display = "block"; // Show the popup
    
        // Hide the popup after 5 seconds
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 5000);
    });

    function orbitPopupText(orbitID){
        let filePath;

        // Check which orbit it is
        if (orbitID == "orbitA") {
            filePath = 'texts/orbitA/orbitAInstructions.txt';
        }
        if (orbitID == "orbitB") {
            filePath = 'texts/orbitB/orbitBInstructions.txt';
        }
        if (orbitID == "orbitC") {
            filePath = 'texts/orbitC/orbitCInstructions.txt';
        }
        if (orbitID == "orbitD"){
            filePath = 'texts/orbitD/orbitDInstructions.txt';
        }
            
        // Get the popup text
        fetch(filePath)
            //Get text
            .then(response => response.text())

            //Put text in popup and display it
            .then(text => {
                popupBox.textContent = text;
                popupBox.style.display = "block"; // Show the popup
            })
        .catch(error => console.error("Error loading text file:", error));            

        // Hide the popup after 20 seconds
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 20000);
    }

    //logic for instrument button
    if (instrumentButton) {
        console.log("Instrument Button Found!"); // Debugging log
        instrumentButton.addEventListener("click", function() {
            window.location.href = "Instrumentview.html";
        });
    } else {
        console.log("Instrument Button NOT Found! Check your HTML.");
    }

    // Function to load orbit details
    function loadOrbitDetails(orbitId) {
        const descriptionFile = `texts/${orbitId}/${orbitId}Description.txt`;

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

    // Allows users to switch to larger text size for greater readability
    function textSizeToggle(){
        document.getElementById("textSizeBtn").addEventListener("click", () => {

            if(orbitText.style.fontSize === "16px" || orbitText.style.fontSize === ""){
                orbitText.style.fontSize = "20px";
            }
            else{
                orbitText.style.fontSize = "16px";
            }
        });
    }

    function textToSpeak(){
        document.getElementById("speakButton").addEventListener("click", () => {
            
            // Get the text content of the element
            let textToSpeak = orbitText.textContent || orbitText.innerText;
            
            // Check if SpeechSynthesis is supported
            if ('speechSynthesis' in window) {
                let speech = new SpeechSynthesisUtterance(textToSpeak);
                
                // Optional: Adjust the properties like rate, pitch, volume, etc.
                speech.rate = 1; // Speed of speech (1 is normal)
                speech.pitch = 1; // Pitch of voice (1 is normal)
                speech.volume = 1; // Volume of voice (1 is normal)
        
                // Speak the text
                window.speechSynthesis.speak(speech);
            } else {
                alert("Speech synthesis is not supported in this browser.");
            }
        });
    }
});



var x = setInterval(function() {
    var currentDate = new Date();
    var years = countDownDate.getFullYear() - currentDate.getFullYear();
    var months = countDownDate.getMonth() - currentDate.getMonth();
    var days = countDownDate.getDate() - currentDate.getDate();
    var hours = countDownDate.getHours() - currentDate.getHours();
    var minutes = countDownDate.getMinutes() - currentDate.getMinutes();
    var seconds = countDownDate.getSeconds() - currentDate.getSeconds();

    // Adjust for negative values
    if (seconds < 0) {
        seconds += 60;
        minutes--;
    }
    if (minutes < 0) {
        minutes += 60;
        hours--;
    }
    if (hours < 0) {
        hours += 24;
        days--;
    }
    if (days < 0) {
        let prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        days += prevMonth.getDate(); // Get last month's days
        months--;
    }
    if (months < 0) {
        months += 12;
        years--;
    }

    // Display the result in the element with id="demo"
  document.getElementById("countdown-timer").innerHTML = "T- " + years + "y " + months + "m " + days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (years === 0 & months === 0 & days === 0 & hours === 0 & minutes === 0 & seconds === 0) {
    clearInterval(x);
    document.getElementById("countdown-timer").innerHTML = "Arrived at Psyche!";
  
    }
}, 1000)


//Touch respose *still needs work*
/*document.addEventListener("touchstart", (event) => {
    const touchX = event.touches[0].clientX;
    const touchY = event.touches[0].clientY;

    console.log(`Touch at: X=${touchX}, Y=${touchY}`);

    const scene = document.querySelector("a-scene");
    const cameraEl = document.getElementById('camera'); // Get the camera entity
    
    if (!cameraEl) {
        alert(`No camera found in scene!`);
        return;
    }
    // Access the camera component
    const cameraComponent = cameraEl.components.camera;

    if (!cameraComponent) {
        alert("No camera component found!");
        return;
    }

    const camera = cameraComponent.camera;

    if (!camera) {
        alert("Camera object is missing!");
        return;
    }
    
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const rect = scene.getBoundingClientRect();
    mouse.x = ((touchX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((touchY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (scene.object3D.children.length === 0) {
        console.log("No objects in the scene for raycasting!");
        return;
    }

    const intersects = raycaster.intersectObjects(scene.object3D.children, true);

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object.el;
        // Check if the geometry is TorusGeometry
        //if (selectedObject.geometry && selectedObject.geometry.type === "TorusGeometry") {
            console.log(`Selected TorusGeometry object:`, selectedObject.id);

            const htmlElement = document.getElementById(selectedObject.id);

            if (htmlElement) {
                console.log("Matching HTML element:", htmlElement);
            }

            // Change color or do something with the selected torus object
            //selectedObject.material.color.set("red"); // Change the color to red
        //} else {
        //    console.log("Selected object is not a TorusGeometry.");
       // }
    } else {
        console.log("No objects detected by raycaster.");
    }
});*/

function displayErrorPage(){
    window.location.href = "/error.html";
}
