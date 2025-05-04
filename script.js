import { initNavigationMenu, toggleMenu } from "./menuScript.js";
var countDownDate = new Date("Aug 1, 2029 0:0:0"); //Arrives in late July
let linkTargetOrbitId = null;

// Touchscreen method
AFRAME.components["look-controls"].Component.prototype.onTouchMove = function (t) {
    if (this.touchStarted && this.data.touchEnabled) {
        this.pitchObject.rotation.x += .6 * Math.PI * (t.touches[0].pageY - this.touchStart.y) / this.el.sceneEl.canvas.clientHeight;
        this.yawObject.rotation.y += /*  */ Math.PI * (t.touches[0].pageX - this.touchStart.x) / this.el.sceneEl.canvas.clientWidth;
        this.pitchObject.rotation.x = Math.max(Math.PI / -2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        this.touchStart = {
            x: t.touches[0].pageX,
            y: t.touches[0].pageY
        }
    }
}

//Observer pattern
class OrbitObserver {
    constructor() {
        this.subscribers = {};
    }

    subscribe(event, callback){
        if(!this.subscribers[event]){
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
    }

    unsubscriber(event, callback){
        if(this.subscribers[event]){
            this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
        }
    }

    notify(event, data){
        if(this.subscribers[event]){
            this.subscribers[event].forEach(callback => callback(data));
        }
    }
}

//Global observer instance
const orbitObserver = new OrbitObserver();

document.addEventListener('DOMContentLoaded', () => {
    const hasSeenIntro = sessionStorage.getItem("introShown");

    // If first sessioon show intro
    if (!hasSeenIntro) {
        sessionStorage.setItem("introShown", "true");
        loadIntroduction();
    }
    
    initNavigationMenu();

    //Subscribe functions to orbit selection event
    orbitObserver.subscribe("orbitSelected", highlightOrbit);
    orbitObserver.subscribe("orbitSelected", transitionToOrbit);
    orbitObserver.subscribe("orbitSelected", updateBannerText);
    orbitObserver.subscribe("orbitSelected", panToPsyche);
    orbitObserver.subscribe("orbitSelected", orbitPopupText);
    orbitObserver.subscribe("orbitSelected", loadOrbitDetails);
    orbitObserver.subscribe("orbitSelected", changeButtonPicture);

    //Attach event listeners
    textSizeToggle();
    
    const orbits = ['orbitA', 'orbitB', 'orbitC', 'orbitD'];
    const movingObject = document.getElementById('moving-object');
    const camera = document.getElementById('camera');
    let currentOrbit = null;
    let moveInterval = null;
    const orbitLinks = document.querySelectorAll('[data-orbit]');
    const orbitText = document.getElementById("orbit-text");
    const orbitTitle = document.getElementById("orbit-title");
    const seeMoreBtn = document.getElementById("see-more-btn");
    const orbitBox = document.querySelector(".orbit-description");
    const popupBox = document.getElementById("instructionPopup");
    const instrumentButton = document.getElementById("instrumentButton");
    
    // Check if there's a stored orbit
    let storedOrbit = sessionStorage.getItem("selectedOrbit");
    if (storedOrbit && storedOrbit !== "null") {

        // Set inital camera position
        camera.setAttribute('position', {
            x: 0,
            y: 1.1,
            z: -1
        });

        // Save orbit
        linkTargetOrbitId = storedOrbit; 

        if(linkTargetOrbitId){
            //Perform view change
            orbitObserver.notify("orbitSelected", storedOrbit);
        }

        // Clear stored value after applying the functions
        sessionStorage.removeItem("selectedOrbit");
    }
 
    // Event listeners for each orbit click
    orbits.forEach(orbitId => {
        const orbit = document.getElementById(orbitId + "-wrapper");
        
        // If on mobile ignore, covered by touchStart method
        if(!isMobile()){
            orbit.addEventListener('click', (event) => {
                linkTargetOrbitId = orbitId; 

                //Perform view change
                event.stopPropagation();
                orbitObserver.notify("orbitSelected", orbitId);
            });
        }
    });
    
    // Event listeners for each navigation menu link
    orbitLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();  // Prevent default link behavior (page reload)
            event.stopPropagation();

            //Get orbit Id
            const orbitId = link.getAttribute('data-orbit');

            linkTargetOrbitId = orbitId; 

            //Perform view change
            toggleMenu();
            orbitObserver.notify("orbitSelected", orbitId);
        });
    });

    // Move the spacecraft through the selected orbit
    function moveObjectThroughOrbit(orbitId) {
        const orbit = document.getElementById(orbitId);
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
                movingObject.setAttribute('position', `${x} ${y + orbitY - 0.3} ${orbitZ}`);
               
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
        const steps = 20;
        let step = 0;

        // Diable look controls while switcing to prevent screen jitter
        camera.setAttribute('look-controls', 'enabled', false);

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

                // Re-enable look controls
                camera.setAttribute('look-controls', 'enabled', true);
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
            orbitBox.classList.add("show");
        });
    }

    // Transition to selected orbit
    function transitionToOrbit(orbitId) {
        if (currentOrbit === orbitId) return;
        currentOrbit = orbitId;

        // hide countdown timer when transitioning to an orbit
        document.querySelector(".countdown-timer-box").style.display = "none";
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

    // Fetch pop-up text
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
                popupBox.style.display = "block";
            })
        .catch(error => console.error("Error loading text file:", error));            

        // Hide the popup after 5 seconds
        setTimeout(() => {
            popupBox.style.display = "none";
        }, 5000);
    }

    //logic for instrument button
    if (instrumentButton) {
        //Check for mouse click
        instrumentButton.addEventListener("pointerdown", function(event) {
            if (event.pointerType === "mouse") {
                //Redirect with orbit info as a query parameter
                window.location.href = `instrumentView.html?orbit=${encodeURIComponent(linkTargetOrbitId)}`;
            }
        });
    } else {
        console.log("Instrument Button NOT Found! Check your HTML.");
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
                orbitText.classList.remove("expanded");
                orbitText.classList.add("collapsed");

                // Ensure "See More" button remains visible
                seeMoreBtn.style.display = "block";
                seeMoreBtn.innerText = "+";
            })
            .catch(error => {
                orbitText.innerText = "Orbit information unavailable.";
                console.error("Error loading orbit file:", error);
            });
    }

    // Expand/Collapse functionality
    seeMoreBtn.addEventListener("click", function () {

        if (orbitText.classList.contains("expanded")) {
            // If expanded, collapse it
            orbitBox.classList.remove("expanded");
            orbitText.classList.remove("expanded");
            orbitText.classList.add("collapsed");
            seeMoreBtn.innerText = "+";
        } else {
            // If collapsed, expand it
            orbitBox.classList.add("expanded");
            orbitText.classList.remove("collapsed");
            orbitText.classList.add("expanded");
            seeMoreBtn.innerText = "-";
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

    // Update button picture
    function changeButtonPicture(orbitId){
        const instrumentPictureFile = `images/instruments/${orbitId}.png`;
    
        //Map instruments to the orbit ID
        const instrumentMap = {
            "orbitA": "magnetometer",
            "orbitB": "multispectral imager",
            "orbitC": "x band-radio",
            "orbitD": "spectrometers"
        };

        // Get instrumetn name
        const instrumentName = instrumentMap[orbitId];

        // create image element and insert image
        let img = instrumentButton.querySelector("img");
        if (!img) {
            img = document.createElement("img");
        }
        instrumentButton.textContent = "";
        instrumentButton.appendChild(img);

        //Set image attributes
        img.src = instrumentPictureFile;
        img.alt = `Go to ${instrumentName}`;
        img.style.height = "40px";
    }

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

    // Read on-screen text to user
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
        const buttons = [instrumentButton, document.getElementById("textSizeBtn"), document.getElementById("speakButton"),document.getElementById("helpButton"), document.getElementById("see-more-btn") ];

        //Check if pressing button
        for (let button of buttons) {
            if (button && (event.target === button || button.contains(event.target))) {
                // if instrument button, redirect
                if(button.id === "instrumentButton"){
                    window.location.href = `instrumentView.html?orbit=${encodeURIComponent(linkTargetOrbitId)}`;
                }

                // Stop selection of elements behind button
                event.stopPropagation();
                return;
            }
        }

        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;

        const scene = document.querySelector("a-scene");
        const cameraEl = document.getElementById('camera'); // Get the camera entity
        
        // Check if camera is intialized
        if (!cameraEl || !cameraEl.components.camera || !cameraEl.components.camera.camera ) {
            alert("Camera not properly initialized!");
            return;
        }

        // St up for raycasting from mouse
        const camera = cameraEl.components.camera.camera;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const canvas = scene.renderer.domElement;
        const rect = canvas.getBoundingClientRect();

        // Bounding box for easier touch detection
        mouse.x = ((touchX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touchY - rect.top) / rect.height) * 2 + 1;

        // Get selected orbit hitboc
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.object3D.children, true);
        const orbitSelection = intersects.find(i => i.object.el && i.object.el.classList.contains("hitbox"));

        // Check if selected element is orbit hitbox
        if (orbitSelection) {
            // Get orbit element
            const wrapper = orbitSelection.object.el.parentEl;
            const torus = wrapper.querySelector("a-torus:not(.hitbox)");

            // Ensure it is correct element
            if (torus) {
                // Get orbit ID
                const orbitId = torus.id;

                //Store current orbit ID for instrument view linking
                linkTargetOrbitId = orbitId; 

                // Change orbit view
                orbitObserver.notify("orbitSelected", orbitId);
            } else {
                console.warn("Hitbox hit but no torus found in wrapper.");
            }
        } else {
            console.log("No hitbox hit.");
        }
    });

    //Check is using mobile
    function isMobile() {
        return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
    }
});

//Countdown timer
var countdownTimer = setInterval(function() {
    var currentDate = new Date();
    var years = countDownDate.getFullYear() - currentDate.getFullYear();
    var months = countDownDate.getMonth() - currentDate.getMonth();
    var days = countDownDate.getDate() - currentDate.getDate();
    var hours = countDownDate.getHours() - currentDate.getHours();
    var minutes = countDownDate.getMinutes() - currentDate.getMinutes();
    var seconds = countDownDate.getSeconds() - currentDate.getSeconds();

    // Calculate time left
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

    // Display the result
    document.getElementById("countdown-timer").innerHTML = "T- " + years + " years " + months + " months " + days + " days "; // + hours + "h "
    //+ minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (years === 0 & months === 0 & days === 0 & hours === 0 & minutes === 0 & seconds === 0) {
        clearInterval(countdownTimer);
        document.getElementById("countdown-timer").innerHTML = "Arrived at Psyche!";
    }
}, 1000)

let isSpeaking = false;
let speech = null;

// Text to speech
document.getElementById("speakButton").addEventListener("click", () => {     
    // Check if already speaking
    if (isSpeaking) {
        // Interrupt ongoing speech
        window.speechSynthesis.cancel();
        isSpeaking = false; 
        return;
    }

    // Get text to be spoken
    let textElement = document.getElementById("orbit-text");
    let textToSpeak = textElement.textContent || textElement.innerText;

    // Check if text-to-speech is supported
    if ('speechSynthesis' in window) {
        // Ensure any ongoing speech is stopped before starting new speech
        window.speechSynthesis.cancel();

        speech = new SpeechSynthesisUtterance(textToSpeak);
        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        // Set flag to track speech state
        isSpeaking = true; 

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
    } 
    else {
        alert("Speech synthesis is not supported in this browser.");
    }
});

let currentSlide = 0;

const introSlides = [
    { type: "video", src: "https://www.youtube.com/embed/AwCiHscmEQE?si=PgwzvjLPpVTy8Gt4", text: "On October 13, 2023, NASA\'s Psyche mission took flight."},
    { type: "gif", src: "images/psycheLaunchPress.jpg", text: "Aboard a SpaceX Falcon Heavy rocket, the spacecraft began its 6-year journey." },
    { type: "video", src: "https://www.youtube.com/embed/M7KqDsykb3o?si=_oQh1kQ5j3YRh86_", text: "The Psyche spacecraft is on a 2.5 billion-mile journey to a metal-rich asteroid named Psyche."},
    { type: "video", src: "https://www.youtube.com/embed/y__vwRQ3PVg?start=66&end=96", text: "Upon arrival, the spacecraft will follow four orbital paths using various scientific instruments to gather data." },
    { type: "video", src: "https://www.youtube.com/embed/y__vwRQ3PVg?start=20&end=66", text: "Scientists believe there\'s much to learn from the Psyche asteroid — including how planets form!"},
    {type: "end", text: "Now it\'s your turn to explore. Start your journey to a metal world!", buttonText: "START"}
];

// Load the introduction modal
function loadIntroduction() {
    showSlide(currentSlide);
    new bootstrap.Modal(document.getElementById("introModal")).show();
}

// Show a specific slide
function showSlide(index) {
    const slide = introSlides[index];
    const mediaContainer = document.getElementById("mediaContainer");
    
    // Clear previous content
    mediaContainer.innerHTML = "";

    // Check slide type
    if (slide.type === "video") {
        const iframe = document.createElement("iframe");
        iframe.src = slide.src;
        iframe.width = "560";
        iframe.height = "315";
        iframe.allow = "autoplay; encrypted-media";
        iframe.allowFullscreen = true;
        mediaContainer.appendChild(iframe);
    } 
    else if (slide.type === "gif") {
        const img = document.createElement("img");
        img.src = slide.src;
        img.style.width = "100%";
        mediaContainer.appendChild(img);
    }

    // If there's accompanying text, add it
    if (slide.text) {
        const textEl = document.createElement("p");
        textEl.innerText = slide.text;
        textEl.className = "slide-description";
        mediaContainer.appendChild(textEl);
    }

    // Disable or enable buttons
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === introSlides.length - 1;

    // Check if final slide
    if (currentSlide === introSlides.length - 1) {
        enterBtn.classList.remove("d-none");
    } else {
        enterBtn.classList.add("d-none");
    }
}

// Add event listeners
prevBtn.addEventListener("click", prevSlide);
nextBtn.addEventListener("click", nextSlide);
document.getElementById("enterBtn").addEventListener("click", () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById("introModal"));
    modal.hide();
});

// Move to the next slide
function nextSlide() {
    if (currentSlide < introSlides.length - 1) {
        currentSlide++;
        showSlide(currentSlide);
    }
}

// Move to the previous slide
function prevSlide() {
    currentSlide = (currentSlide - 1 + introSlides.length) % introSlides.length;
    showSlide(currentSlide);
}

// Clear the media when the modal is closed
document.getElementById("introModal").addEventListener("hidden.bs.modal", function () {
    document.getElementById("mediaContainer").innerHTML = "";
});

const helpButton = document.getElementById("helpButton");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const closeOverlay = document.getElementById("closeOverlay");
const tutorialVideo = document.getElementById("tutorialVideo");

helpButton.addEventListener("click", () => {
    tutorialOverlay.style.display = "flex";
    tutorialVideo.currentTime = 0;
    tutorialVideo.play();
});

closeOverlay.addEventListener("click", () => {
    tutorialVideo.pause();
    tutorialOverlay.style.display = "none";
});

window.addEventListener('DOMContentLoaded', () => {
    const orbitA = document.querySelector('#orbitA');
    const orbitB = document.querySelector('#orbitB');
    const orbitC = document.querySelector('#orbitC');
    const orbitD = document.querySelector('#orbitD');
    
    // Function to transition to a color and then call a callback
    function animateTo(orbit, color, callback) {
      if (!orbit) return; // Ensure orbit exists before applying animation
      
      // Log to debug
      console.log(`Animating ${orbit.id} to color: ${color}`);
      
      // Directly set the emissive color of the material
      orbit.setAttribute('material', 'emissive', color);
      
      // Simulate a delay and then trigger the callback
      setTimeout(() => {
            console.log(`Finished animating ${orbit.id} to ${color}`);
            callback(); // Trigger the callback after the simulated animation
        }, 2400); //where you set time for animation now
    }
    
    // Function to handle the loop with boolean check for color
    function loop(orbit, isGold) {
        if (isGold) {
            animateTo(orbit, '#FFFFFF', () => {
                loop(orbit, false); // Set to false once it's transitioned to white
            });
        } 
        else {
            animateTo(orbit, '#FFFF00', () => {
                loop(orbit, true); // Set to true once it's transitioned to gold
            });
        }
    }
    
    // Start the animation loop for each orbit
    if (orbitA) loop(orbitA, true); // Start orbit A with gold
    if (orbitB) loop(orbitB, true); // Start orbit B with gold
    if (orbitC) loop(orbitC, true); // Start orbit C with gold
    if (orbitD) loop(orbitD, true); // Start orbit D with gold
    
    // Check if any orbits are missing
    if (!orbitA || !orbitB || !orbitC || !orbitD) {
        console.error('One or more orbits not found!');
    }
});
  
  