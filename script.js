import { initNavigationMenu, toggleMenu } from "./menuScript.js";
var countDownDate = new Date("Aug 1, 2029 0:0:0"); //Arrives in late July


let linkTargetOrbitId = null;

document.addEventListener('DOMContentLoaded', () => {
    
    initNavigationMenu();

    //Attach event listeners
    textSizeToggle();
  
    
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

        //Set inital camera position
        camera.setAttribute('position', {
            x: 0,
            y: 1.1,
            z: -1
        });

        linkTargetOrbitId = storedOrbit; 
        console.log("Current Orbit ID:", linkTargetOrbitId);

        //Perform view change
        highlightOrbit(storedOrbit);
        transitionToOrbit(storedOrbit);
        updateBannerText(storedOrbit);
        panToPsyche(storedOrbit);
        orbitPopupText(storedOrbit);
        loadOrbitDetails(storedOrbit);

        // Clear stored value after applying the functions
        sessionStorage.removeItem("selectedOrbit");
    }
 
    // Event listeners for each orbit click
    orbits.forEach(orbitId => {
        const orbit = document.getElementById(orbitId + "-wrapper");
        orbit.addEventListener('click', (event) => {


            linkTargetOrbitId = orbitId; 
            console.log("Current Orbit ID:", linkTargetOrbitId);
            //Perform view change
            event.stopPropagation();
            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            updateBannerText(orbitId);
            panToPsyche(orbitId);
            orbitPopupText(orbitId);
            loadOrbitDetails(orbitId);
        });
    });
    
    // Event listeners for each navigation menu link
    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();  // Prevent default link behavior (page reload)
            event.stopPropagation();

            //Get orbit Id
            const orbitId = link.getAttribute('data-orbit');


            linkTargetOrbitId = orbitId; 
            console.log("Current Orbit ID:", linkTargetOrbitId);

            //Perform view change
            toggleMenu();
            highlightOrbit(orbitId);
            transitionToOrbit(orbitId);
            updateBannerText(orbitId);
            panToPsyche(orbitId);
            orbitPopupText(orbitId);
            loadOrbitDetails(orbitId);
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

        //Move the camera based on selected orbit
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

        //Smooth out camera movement
        const interval = setInterval(() => {

            //Check if camera is in final position
            if (step < steps) {

                //Move camera to next position
                const t = step / steps;
                camera.setAttribute('position', {
                    x: startPosition.x + (targetPosition.x - startPosition.x) * t,
                    y: startPosition.y + (targetPosition.y - startPosition.y) * t,
                    z: startPosition.z + (targetPosition.z - startPosition.z) * t
                });
                step++;

            } else {

                //Final position reached
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

            //Change the color
            orbit.setAttribute('color', id === selectedId ? '#f9a000' : '#ffffff');
            orbit.setAttribute('opacity', id === selectedId ? '0.7' : '0.25');
        
            //Show orbit description box
            orbitBox.classList.add("show"); // toggle visibility so orbit info box can be seen
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
        
        // Show the popup
        popupBox.style.display = "block"; 
    
        // Hide the popup after 5 seconds
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 5000);
    });

    function orbitPopupText(orbitId){
        const instructionFile = `texts/${orbitId}/${orbitId}Instructions.txt`;
            
        // Get the popup text file
        fetch(instructionFile)
            //Get text
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })

            //Put text in popup and display it
            .then(text => {
                popupBox.textContent = text;
                popupBox.style.display = "block"; // Show the popup
            })
        .catch(error => console.error("Error loading text file:", error));            

        // Hide the popup after 10 seconds
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 5000);
    }

    //logic for instrument button
    if (instrumentButton) {
        instrumentButton.addEventListener("click", function() {
            //Assume orbit info is stored in a variable
            let currentOrbit = getCurrentOrbit();
    
            //Redirect with orbit info as a query parameter
            window.location.href = `instrumentView.html?orbit=${encodeURIComponent(linkTargetOrbitId)}`;
            console.log(`instrumentView.html?orbit=${encodeURIComponent(linkTargetOrbitId)}`);
        });
    } else {
        console.log("Instrument Button NOT Found! Check your HTML.");
    }
    
    //Function to get orbit
    function getCurrentOrbit() {
        //Retrieve from sessionStorage, API, or a global variable
        return sessionStorage.getItem("currentOrbit") || "defaultOrbit";
    }
    
    // Function to load orbit details
    function loadOrbitDetails(orbitId) {
        const descriptionFile = `texts/${orbitId}/${orbitId}Description.txt`;

        //Get description text file
        fetch(descriptionFile)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })

            //Get text
            .then(data => {

                //Change the title to match orbit and add text
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
    
    // Change banner text
    function updateBannerText(orbitId){
        const bannerText = document.getElementById("bannerText"); 
        const bannerTextFile = `texts/${orbitId}/banner.txt`;
            
        // Get the banner text file
        fetch(bannerTextFile)
            // Get text
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })

            // Put text in banner
            .then(text => {
                bannerText.textContent = text;
            })
        .catch(error => console.error("Error loading text file:", error));
    }
    window.moveObjectThroughOrbit = moveObjectThroughOrbit;
    window.highlightOrbit = highlightOrbit;

    // Allows users to switch to larger text size for greater readability
    function textSizeToggle(){
        document.getElementById("textSizeBtn").addEventListener("click", () => {

            //Check text size and toggle
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

    //Touchscreen functionality
    document.addEventListener("touchstart", (event) => {
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;

        const scene = document.querySelector("a-scene");
        const cameraEl = document.getElementById('camera'); // Get the camera entity
        
        if (!cameraEl || !cameraEl.components.camera || !cameraEl.components.camera.camera ) {
            alert("Camera not properly initialized!");
            return;
        }

        const camera = cameraEl.components.camera.camera;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const canvas = scene.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        mouse.x = ((touchX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touchY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.object3D.children, true);

        const hit = intersects.find(i => i.object.el && i.object.el.classList.contains("hitbox"));

        if (hit) {
            const wrapper = hit.object.el.parentEl;
            const torus = wrapper.querySelector("a-torus:not(.hitbox)");

            if (torus) {
                const orbitId = torus.id;
                highlightOrbit(orbitId);
                transitionToOrbit(orbitId);
                updateBannerText(orbitId);
                panToPsyche(orbitId);
                orbitPopupText(orbitId);
                loadOrbitDetails(orbitId);
            } else {
                console.warn("Hitbox hit but no torus found in wrapper.");
            }
        } else {
            console.log("No hitbox hit.");
        }
    });
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
  document.getElementById("countdown-timer").innerHTML = "T- " + years + " years " + months + " months " + days + " days "; // + hours + "h "
  //+ minutes + "m " + seconds + "s ";

  // If the count down is finished, write some text
  if (years === 0 & months === 0 & days === 0 & hours === 0 & minutes === 0 & seconds === 0) {
    clearInterval(x);
    document.getElementById("countdown-timer").innerHTML = "Arrived at Psyche!";
  
    }
}, 1000)

let isSpeaking = false;
let speech = null;

document.getElementById("speakButton").addEventListener("click", () => {     
    if (isSpeaking) {
        // Interrupt ongoing speech
        window.speechSynthesis.cancel();
        isSpeaking = false; 
        return;
    }

    let textElement = document.getElementById("orbit-text");
    let textToSpeak = textElement.textContent || textElement.innerText;

    if ('speechSynthesis' in window) {
        // Ensure any ongoing speech is stopped before starting new speech
        window.speechSynthesis.cancel();

        speech = new SpeechSynthesisUtterance(textToSpeak);
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        isSpeaking = true; // Set flag to track speech state

        window.speechSynthesis.speak(speech);

        // Ensure the flag resets when speech is done
        speech.onend = () => {
            isSpeaking = false;
        };

        // Handle interruptions properly
        speech.onpause = () => {
            isSpeaking = false;
        };

        speech.oncancel = () => {
            isSpeaking = false;
        };
    } else {
        alert("Speech synthesis is not supported in this browser.");
    }
});
