import { initNavigationMenu, toggleMenu } from "./menuScript.js";
var countDownDate = new Date("Aug 1, 2029 0:0:0"); //Arrives in late July
let linkTargetOrbitId = null;

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
    const tutorialShown = sessionStorage.getItem('tutorialShown');
    //storing something in sessionStorage not sure if this is the best
    if (!tutorialShown) {
       
        loadTutorial();
        
        sessionStorage.setItem('tutorialShown', 'true');
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
    if (storedOrbit && storedOrbit !== "null") {

        //Set inital camera position
        camera.setAttribute('position', {
            x: 0,
            y: 1.1,
            z: -1
        });

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
        if(!isMobile()){
        orbit.addEventListener('click', (event) => {
            console.log(camera.getAttribute("position"))

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

        camera.setAttribute('look-controls', 'enabled', 'false');

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
                //camera.setAttribute('look-at', '#psyche');
                camera.setAttribute('look-controls', 'enabled', 'true');
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

                // orbitText.style.maxHeight = "120px";
                // orbitText.style.overflow = "hidden";

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
            /* if expanded, collapse it*/
            orbitBox.classList.remove("expanded");
            orbitText.classList.remove("expanded");
            orbitText.classList.add("collapsed");
            seeMoreBtn.innerText = "+";
            // orbitText.style.maxHeight = "120px";
            // orbitText.style.overflow = "hidden";
        } else {
            /*if collapsed, expand it*/
            orbitBox.classList.add("expanded");
            orbitText.classList.remove("collapsed");
            orbitText.classList.add("expanded");
            seeMoreBtn.innerText = "-";
            //orbitText.style.maxHeight = "none"; // Fully expand
            //orbitText.style.overflow = "visible";
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

    function changeButtonPicture(orbitId){
        const instrumentPictureFile = `images/instruments/${orbitId}.png`;
    
        //Map instruments to the orbit ID
        const instrumentMap = {
            "orbitA": "magnetometer",
            "orbitB": "multispectral imager",
            "orbitC": "x band-radio",
            "orbitD": "spectrometers"
        };

        const instrumentName = instrumentMap[orbitId];

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

    //window.moveObjectThroughOrbit = moveObjectThroughOrbit;
    //window.highlightOrbit = highlightOrbit;

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
        const buttons = [instrumentButton, document.getElementById("textSizeBtn"), document.getElementById("speakButton")];

        //Check if pressing button
        for (let button of buttons) {
            if (button && (event.target === button || button.contains(event.target))) {
                if(button.id === "instrumentButton"){
                    window.location.href = `instrumentView.html?orbit=${encodeURIComponent(linkTargetOrbitId)}`;
                }
                event.stopPropagation();
                return; // Stop further processing
            }
        }

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
        const orbitSelection = intersects.find(i => i.object.el && i.object.el.classList.contains("hitbox"));

        if (orbitSelection) {
            const wrapper = orbitSelection.object.el.parentEl;
            const torus = wrapper.querySelector("a-torus:not(.hitbox)");

            if (torus) {
                const orbitId = torus.id;
                linkTargetOrbitId = orbitId; //Store current orbitID for instrument view linking
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





let currentSlide = 0;
    const tutorialSlides = [
        { type: "video", src: "https://www.youtube.com/embed/VIDEO_ID_1" },
        { type: "gif", src: "https://media.giphy.com/media/EXAMPLE_1/giphy.gif" },
        { type: "video", src: "https://www.youtube.com/embed/VIDEO_ID_2" },
        { type: "gif", src: "https://media.giphy.com/media/EXAMPLE_2/giphy.gif" }
    ];
    
    // Load the tutorial modal
    function loadTutorial() {
        showSlide(currentSlide);
        new bootstrap.Modal(document.getElementById("tutorialModal")).show();
    }
    
    // Show a specific slide
    function showSlide(index) {
        const slide = tutorialSlides[index];
        const mediaContainer = document.getElementById("mediaContainer");
        mediaContainer.innerHTML = ""; // Clear previous content
    
        if (slide.type === "video") {
            const iframe = document.createElement("iframe");
            iframe.src = slide.src;
            iframe.width = "560";
            iframe.height = "315";
            iframe.allow = "autoplay; encrypted-media";
            iframe.allowFullscreen = true;
            mediaContainer.appendChild(iframe);
        } else if (slide.type === "gif") {
            const img = document.createElement("img");
            img.src = slide.src;
            img.style.width = "100%";
            mediaContainer.appendChild(img);
        }
    }
    

    const prevBtn = document.querySelector("#prevBtn");
    const nextBtn = document.querySelector("#nextBtn");
    
    // Add event listeners
    prevBtn.addEventListener("click", prevSlide);
    nextBtn.addEventListener("click", nextSlide);
    
    

    // Move to the next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % tutorialSlides.length;
        showSlide(currentSlide);
    }
    
    // Move to the previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + tutorialSlides.length) % tutorialSlides.length;
        showSlide(currentSlide);
    }
    
    // Clear the media when the modal is closed
    document.getElementById("tutorialModal").addEventListener("hidden.bs.modal", function () {
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