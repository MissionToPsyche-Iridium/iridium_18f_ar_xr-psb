import { initNavigationMenu, toggleMenu } from "./menuScript.js";
 
let videoUrls = {
    "orbitA": "videos/psycheMagnetometerClip.mp4",
    "orbitB": "videos/psycheSpectrometerClip.mp4",
    "orbitC": "https://www.youtube.com/embed/VIDEO_ID_C",
    "orbitD": "videos/psycheSpectrometerClip.mp4"
};
let videoUrl = null;
 let selectedInstrument = null; // Track the currently selected instrument
 let isDragging = false;
 let previousMouseX = 0;
 let previousMouseY = 0;
 const navigationMenu = document.querySelector(".navigation__menu");
 
 //Observer pattern
 class InstrumentObserver {
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
 const instrumentObserver = new InstrumentObserver();
 
 document.addEventListener("DOMContentLoaded", () => {
 
     initNavigationMenu();
 
     instrumentObserver.subscribe("instrumentSelected", loadInstrumentDetails);
     instrumentObserver.subscribe("instrumentSelected", loadSampleData);
 
     console.log("Instrument View Loaded"); // Debugging check
     //Extract the query parameter from the URL
     const urlParams = new URLSearchParams(window.location.search);
     //Get the value of the "orbit" parameter
     const orbit = urlParams.get("orbit");
 
     const instruments = {
         spacecraft: document.querySelector("#spacecraft"),
         gamma: document.querySelector("#gamma"),
         neutron: document.querySelector("#neutron"),
         magnetometer: document.querySelector("#magnetometer"),
         multispectral: document.querySelector("#multispectral-imager"),
         "xband-radio": document.querySelector("#xband-radio")
     };
 
     const instrumentTitle = document.getElementById("instrument-details-title");
     const instrumentDetailsText = document.getElementById("instrumentdetails");
     const instrumentDetailsBox = document.querySelector(".instrument-details");
     const seeMoreBtn1 = document.getElementById("see-more-btn1");
     const returnToOrbitButton = document.getElementById("instrumentButton");
 
     const sampleDataTitle = document.getElementById("sample-data-title");
     const sampleDataText = document.getElementById("sampledatatext");
     const sampleDataBox = document.querySelector(".sample-data");
     const seeMoreBtn2 = document.getElementById("see-more-btn2");
 
     const directionalLight = document.querySelector("#dynamic-directional-light");
     const pointLight = document.querySelector("#dynamic-point-light");
 
     const camera = document.querySelector("[camera]");
     if (camera) {
         camera.setAttribute("look-controls", "enabled", false);
         camera.setAttribute("wasd-controls", "enabled", false);
     }
 
    /* setTimeout(() => {
         // Set default view to the spacecraft
         Object.keys(instruments).forEach(id => {
             if (instruments[id]) {
                 instruments[id].setAttribute("visible", id === "spacecraft" ? "true" : "false");
             }
         });
         selectedInstrument = instruments.spacecraft;
         loadInstrumentDetails("spacecraft");
         console.log("Checking instrument models after DOM load:", instruments);
     }, 1000); */
 
     function loadInstrumentDetails(instrumentId) {
         const descriptionFile = `texts/${instrumentId}/${instrumentId}Details.txt`;
 
         console.log(instrumentId);
         fetch(descriptionFile)
             .then(response => {
                 if (!response.ok) throw new Error("File not found");
                 return response.text();
             })
             .then(data => {
                 const instrumentNames = {
                 spacecraft: "Psyche Spacecraft",
                 gamma: "Gamma Ray Spectrometer",
                 neutron: "Neutron Spectrometer",
                 magnetometer: "Magnetometer",
                 multispectral: "Multispectral Imager",
                 "xband-radio": "X-band Radio"
               };
 
                 instrumentTitle.innerText = instrumentNames[instrumentId] || instrumentId.replace(/-/g, " ");
                 instrumentDetailsText.innerText = data;
 
                 //instrumentDetailsBox.classList.add("show");
                 instrumentDetailsBox.classList.remove("d-none");
                 instrumentDetailsBox.classList.remove("expanded");
                 instrumentDetailsText.style.maxHeight = "120px";
                 instrumentDetailsText.style.overflow = "hidden";
 
                 seeMoreBtn1.style.display = "block";
                 seeMoreBtn1.onclick = function() {
                     if (instrumentDetailsBox.classList.contains("expanded")) {
                         instrumentDetailsBox.classList.remove("expanded");
                         instrumentDetailsBox.classList.add("collapsed");
                         updateSampleDataBoxPosition();
                         seeMoreBtn1.innerText = "+";
                     } else {
                         // if other box is expanded, collapse it
                         if (sampleDataBox.classList.contains("expanded")) {
                             sampleDataBox.classList.remove("expanded");
                             sampleDataBox.classList.add("collapsed");
                             seeMoreBtn2.innerText = "+";
                         }
                         instrumentDetailsBox.classList.add("expanded");
                         instrumentDetailsBox.classList.remove("collapsed");
                         updateSampleDataBoxPosition();
                         seeMoreBtn1.innerText = "-";
                     }
                 };
                 seeMoreBtn1.innerText = "+";
             })
 
             .catch(error => {
                 instrumentDetailsText.innerText = "Instrument information unavailable.";
                 console.error("Error loading instrument file:", error);
             });
     }
 
     function loadSampleData(instrumentId) {
         const dataFile = `texts/${instrumentId}/${instrumentId}SampleData.png`;
 
         fetch(dataFile)
             .then(response => {
                 if (!response.ok) throw new Error("File not found");
                 return response.blob();
             })
             .then(blob => {
                 const imageUrl = URL.createObjectURL(blob);
                 const imgElement = document.createElement("img");
                 imgElement.src = imageUrl;
                 imgElement.style.maxWidth = "100%";
                 imgElement.style.maxHeight = "auto";
                 sampleDataTitle.innerText = "Sample Data";
 
                 sampleDataText.innerHTML = "";
                 sampleDataText.appendChild(imgElement);
 
                 sampleDataBox.classList.remove("d-none");
                 sampleDataBox.classList.remove("expanded");
                 sampleDataBox.classList.add("collapsed");
                 sampleDataText.style.maxHeight = "120px";
                 sampleDataText.style.overflow = "hidden";
 
                 seeMoreBtn2.style.display = "block";
                 seeMoreBtn2.onclick = function() {
                     if (sampleDataBox.classList.contains("expanded")) {
                         sampleDataBox.classList.remove("expanded");
                         sampleDataBox.classList.add("collapsed");
                         seeMoreBtn2.innerText = "+";
                     } else {
                         sampleDataBox.classList.add("expanded");
                         sampleDataBox.classList.remove("collapsed");
                         sampleDataText.style.maxHeight = ""; // Remove restriction
                         sampleDataText.style.overflow = "auto"; // Enable scrolling
 
                         // if other box is expanded, collapse it
                         if (instrumentDetailsBox.classList.contains("expanded")) {
                             instrumentDetailsBox.classList.remove("expanded");
                             instrumentDetailsBox.classList.add("collapsed");
                             updateSampleDataBoxPosition();
                             seeMoreBtn1.innerText = "+";
                         }
                         seeMoreBtn2.innerText = "-";
                     }
                 };
                 seeMoreBtn2.innerText = "+";
             })
             .catch(error => {
                 sampleDataText.innerText = "Sample data unavailable.";
                 console.error("Error loading sample data file:", error);
             });
     }
 
     console.log("Orbit parameter:", orbit);
     if (orbit) {
         showInstrument(orbit);
         console.log(orbit);
     } else {
         console.log("No orbit parameter found in URL.");
     }
 
     //Navigation menu event listener
     const instrumentButtons = document.querySelectorAll("[data-instrument]");
     instrumentButtons.forEach(button => {
         button.addEventListener("click", event => {
             const instrumentId = event.target.getAttribute("data-instrument");
             console.log(`Instrument Selected: ${instrumentId}`);
             toggleMenu();
 
             // Update the light for the selected instrument
             updateLightForInstrument(instrumentId);
 
             Object.keys(instruments).forEach(id => {
                 if (instruments[id]) {
                     instruments[id].setAttribute("visible", "false");
                     console.log(`Hiding model: ${id}`);
                 }
             });
 
             if (instruments[instrumentId]) {
                 selectedInstrument = instruments[instrumentId];
                 selectedInstrument.setAttribute("visible", "true");
                 if(instrumentId != "spacecraft"){
                     instrumentObserver.notify("instrumentSelected", instrumentId);
                 }
                 else{
                     instrumentDetailsBox.classList.add("d-none");
                     sampleDataBox.classList.add("d-none");
                 }
             } else {
                 console.warn(`No model found for ${instrumentId}`);
             }
         });
     });
 
     if (returnToOrbitButton) {
         returnToOrbitButton.addEventListener("click", () => {
             if(selectedInstrument){
             const currentOrbit = selectedInstrument.getAttribute("orbit");
             console.log("Returning to " + currentOrbit);
             sessionStorage.setItem("selectedOrbit",  currentOrbit);
             }
             window.location.href = "index.html"; // Update this to the correct orbit view page if needed // Ensure this is the correct path to orbit view
         });
     } else {
         console.warn("Return to Orbit button not found!");
     }
 
     document.addEventListener("mousedown", (event) => {
         isDragging = true;
         previousMouseX = event.clientX;
         previousMouseY = event.clientY;
     });
 
     document.addEventListener("mouseup", () => {
         isDragging = false;
     });
 
     document.addEventListener("mousemove", (event) => {
         event.preventDefault(); // Prevent unintended camera movement
         if (isDragging && selectedInstrument) {
             const deltaX = event.clientX - previousMouseX;
             const deltaY = event.clientY - previousMouseY;
             previousMouseX = event.clientX;
             previousMouseY = event.clientY;
 
             let currentRotation = selectedInstrument.getAttribute("rotation") || { x: 0, y: 0, z: 0 };
             if (typeof currentRotation === "string") {
                 let rotationParts = currentRotation.split(" ").map(Number);
                 currentRotation = { x: rotationParts[0] || 0, y: rotationParts[1] || 0, z: rotationParts[2] || 0 };
             }
 
             currentRotation.x -= deltaY * 0.5;
             currentRotation.y -= deltaX * 0.5;
             selectedInstrument.setAttribute("rotation", `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`);
         }
     });
 
 
     function showInstrument(orbit) {
         // Hide all instruments first
         const instruments = document.querySelectorAll("[id$='-spectrometer'], #magnetometer, #multispectral-imager, #xband-radio");
         instruments.forEach(inst => inst.setAttribute("visible", "false"));
 
         // Select the correct instrument to show
         let instrumentId;
         switch (orbit) {
             case "orbitA":
                 instrumentId = "magnetometer";
                 videoUrl = videoUrls["orbitA"];
                 break;
             case "orbitB":
                 console.log("displaying multispectral");
                 instrumentId = "multispectral-imager";
                 videoUrl = videoUrls["orbitB"];
                 break;
             case "orbitC":
                 instrumentId = "xband-radio";
                 console.log("displaying xband");
                 videoUrl = videoUrls["orbitC"];
                 break;
             case "orbitD":
                 instrumentId = "gamma";
                 console.log("displaying gamma");
                 videoUrl = videoUrls["orbitA"];

                 break;
             default:
                 if (spacecraft) {
                 spacecraft.setAttribute("visible", "true");
             }
                 console.log("Invalid orbit parameter.");
                 return;
         }
 
         // Make the selected instrument visible
         selectedInstrument = document.getElementById(instrumentId);
         const instrumentLink = selectedInstrument.getAttribute("data")
 
         if(selectedInstrument != "spacecraft"){
             instrumentObserver.notify("instrumentSelected", instrumentLink);
         }
         else{
             instrumentDetailsBox.classList.add("d-none");
             sampleDataBox.classList.add("d-none");
         }
 
         if (selectedInstrument) {
             selectedInstrument.setAttribute("visible", "true");
             console.log(`Showing: ${instrumentId}`);
             console.log(`Showing: ${videoUrl}`);
             loadVideoOnPageLoad()
         } else {
             console.log(`Instrument with ID '${instrumentId}' not found!`);
         }
   }
 
     function updateSampleDataBoxPosition() {
         const detailsBoxHeight = instrumentDetailsBox.offsetHeight;
         sampleDataBox.style.top = `${instrumentDetailsBox.offsetTop + detailsBoxHeight + 5}px`; // Add 5px spacing
     }
 
     // Dynamic lighting for instruments needing brighter lighting
     // point light always same position; directional may need updating
     function updateLightForInstrument(instrumentId) {
       switch (instrumentId) {
           case "magnetometer":
               directionalLight.setAttribute("intensity", "5.0");
               directionalLight.setAttribute("position", "-3 -2 1");
               pointLight.setAttribute("intensity", "7.0");
               break;
           case "multispectral":
               directionalLight.setAttribute("intensity", "2.0");
               directionalLight.setAttribute("position", "1 3 -4");
               pointLight.setAttribute("intensity", "5.0");
               break;
           case "xband-radio":
               directionalLight.setAttribute("intensity", "2.0");
               directionalLight.setAttribute("position", "-4 2 -1");
               pointLight.setAttribute("intensity", "5.0");
               break;
            case "neutron":
                directionalLight.setAttribute("intensity", "1.5");
                directionalLight.setAttribute("position", "-5.5 -1 2");
                pointLight.setAttribute("intensity", "7.0");
                break;
           default:
               directionalLight.setAttribute("intensity", "1.5");
               directionalLight.setAttribute("position", "-2.5 2 1");
               pointLight.setAttribute("intensity", "1.0");
               break;
         }
     }
    

    

     function loadVideoOnPageLoad() {
        // Get the video element by ID
        const videoIframe = document.getElementById("videoIframe");
        if (videoIframe) {
            console.log(`Showing: ${videoUrl}`);  // Debugging statement
            if (videoUrl) {
                videoIframe.src = videoUrl;
                new bootstrap.Modal(document.getElementById("videoModal")).show();
                console.log("Video loaded and modal shown.");
            } else {
                console.log("Video URL is empty.");
            }
        } else {
            console.log("Video element not found.");
        }
    }
    
    document.getElementById("videoModal").addEventListener("hidden.bs.modal", function () {
        
        // Remove any lingering modal backdrop
        const modalBackdrops = document.getElementsByClassName("modal-backdrop");
        while (modalBackdrops.length) {
            modalBackdrops[0].parentNode.removeChild(modalBackdrops[0]);
        }
    
        // Set focus back to the A-Frame scene for full control
        const aScene = document.querySelector("a-scene");
        if (aScene) {
            aScene.focus();
            console.log("Focus returned to A-Frame scene.");
        }
    });

     
 });