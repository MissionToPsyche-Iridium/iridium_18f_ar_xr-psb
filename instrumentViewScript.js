import { initNavigationMenu, toggleMenu } from "./menuScript.js";
 
let videoUrls = {
    "orbitA": "videos/psycheMagnetometerClip.mp4",
    "orbitB": "videos/psycheImagerClip.mp4",
    "orbitC": "https://www.youtube.com/embed/VIDEO_ID_C",
    "orbitD": "videos/psycheSpectrometerClip.mp4"
};

let videoUrl = null;
let selectedInstrument = null; // Track the currently selected instrument
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
const navigationMenu = document.querySelector(".navigation__menu");
const videoButton = document.getElementById('watchVideoBtn');
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
    const sampleDataImage = document.getElementById("sample-data-image");
    const sampleDataText = document.getElementById("sample-data-text");
    const sampleDataBox = document.querySelector(".sample-data");
    const seeMoreBtn2 = document.getElementById("see-more-btn2");
 
    const directionalLight = document.querySelector("#dynamic-directional-light");
    const pointLight = document.querySelector("#dynamic-point-light");
    const ambientLight = document.querySelector("#dynamic-ambient-light");

    const camera = document.querySelector("[camera]");
    if (camera) {
        camera.setAttribute("look-controls", "enabled", false);
        camera.setAttribute("wasd-controls", "enabled", false);
    }

    function toggleExpansion(box, button){
        const isExapanded = box.classList.contains("expanded");
        box.classList.toggle("expanded", !isExapanded);
        box.classList.toggle("collapsed", isExapanded);
        button.innerText = isExapanded ? "+" : "-";

        if(!isExapanded){
            //Collapse other box
            const otherBox = box ===instrumentDetailsBox ? sampleDataBox: instrumentDetailsBox;
            const otherButton = box ===instrumentDetailsBox ? seeMoreBtn2 : seeMoreBtn1;

            if(otherBox.classList.contains("expanded")){
                otherBox.classList.remove("expanded");
                otherBox.classList.add("collapsed");
                otherButton.innerText = "+";
            }

            if (box === instrumentDetailsBox && selectedInstrument) {
                const instrumentId = selectedInstrument.id;
                const instrumentName = getInstrumentNameById(instrumentId);
                const videoUrl = getVideo(instrumentName); // Now using the value name
                checkAndUpdateButtonVisibility(videoUrl);
            }else {
                const videoUrl = ""
                checkAndUpdateButtonVisibility(videoUrl); // Update visibility based on video URL
            }
    


        } else {
        if (box === instrumentDetailsBox && selectedInstrument) {
            const videoUrl = ""
            checkAndUpdateButtonVisibility(videoUrl); // Update visibility based on video URL
        }
    }
        updateSampleDataBoxPosition();
    } 
 
    function loadInstrumentDetails(instrumentId) {
        const descriptionFile = `texts/${instrumentId}/${instrumentId}Details.txt`;
        const instrumentNames = {
            spacecraft: "Psyche Spacecraft",
            gamma: "Gamma Ray Spectrometer",
            neutron: "Neutron Spectrometer",
            magnetometer: "Magnetometer",
            multispectral: "Multispectral Imager",
            "xband-radio": "X-band Radio"
        };

        fetch(descriptionFile)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })
            .then(data => {
                instrumentTitle.innerText = instrumentNames[instrumentId] || instrumentId.replace(/-/g, " ");
                instrumentDetailsText.innerText = data;

                //instrumentDetailsBox.classList.add("show");
                instrumentDetailsBox.classList.remove("d-none", "collapsed", "expanded");
                instrumentDetailsBox.classList.add("collapsed"); // or 'expanded' if you want it open


                instrumentDetailsText.style.maxHeight = "120px";
                instrumentDetailsText.style.overflow = "auto";

                seeMoreBtn1.style.display = "block";
                seeMoreBtn1.innerText = "+"; // Set the icon to collapsed state
                seeMoreBtn1.onclick = () => toggleExpansion(instrumentDetailsBox, seeMoreBtn1);

            })
 
            .catch(error => {
                instrumentDetailsText.innerText = "Instrument information unavailable.";
                console.error("Error loading instrument file:", error);
            });
    }
 
    function loadSampleData(instrumentId) {
        const imageURL = `texts/${instrumentId}/${instrumentId}SampleData.png`;
        const sampleDataTextURL = `texts/${instrumentId}/${instrumentId}Data.txt`;

        fetch(imageURL)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.blob();
            })
            .then(blob => {
                sampleDataImage.innerHTML = "";
                const img = document.createElement("img");
                img.src = URL.createObjectURL(blob);
                img.style.maxWidth = "100%";
                sampleDataImage.appendChild(img);
            })
            .catch(error => {
                sampleDataImage.innerHTML = "";
                console.error("Image load error:", error);
            })

        fetch(sampleDataTextURL)
            .then(response => {
                if (!response.ok) throw new Error("Text not found");
                return response.text();
            })
            .then(text => {
                sampleDataTitle.innerText = "Sample Data";
                sampleDataText.innerText = text;

                sampleDataBox.classList.remove("d-none", "expanded");
                sampleDataBox.classList.add("collapsed");
                sampleDataText.style.maxHeight = "120px";
                sampleDataText.style.overflow = "auto";

                seeMoreBtn2.style.display = "block";
                seeMoreBtn2.innerText = "+";
                seeMoreBtn2.onclick = () => toggleExpansion(sampleDataBox, seeMoreBtn2);
            })
            .catch(error => {
                sampleDataText.innerText = "Sample data unavailable.";
                console.error("Error loading sample data file:", error);
            });
    }
 
    if (orbit) {
        showInstrument(orbit);
    } else {
        console.log("No orbit parameter found in URL.");
    }
 
    //Navigation menu event listener
    const instrumentButtons = document.querySelectorAll("[data-instrument]");
    instrumentButtons.forEach(button => {
        button.addEventListener("click", event => {
            const instrumentId = event.target.getAttribute("data-instrument");
            toggleMenu();

            // Update the light for the selected instrument
            updateLightForInstrument(instrumentId);
            videoUrl = ""
            checkAndUpdateButtonVisibility("");
            videoUrl = getVideo(instrumentId);
            console.log(instrumentId);
            console.log(videoUrl);
            updateVideo(videoUrl);
            Object.keys(instruments).forEach(id => {
                if (instruments[id]) {
                    instruments[id].setAttribute("visible", "false");
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
            sessionStorage.setItem("selectedOrbit",  currentOrbit);
            }
            window.location.href = "index.html"; // Update this to the correct orbit view page if needed // Ensure this is the correct path to orbit view
        });
    } else {
        console.warn("Return to Orbit button not found!");
    }
 
    document.addEventListener("mousedown", (event) => { //change to touchstart
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    });

    document.addEventListener("mouseup", () => { //change to touchend
        isDragging = false;
    });
 
    document.addEventListener("mousemove", (event) => {  //change to touchmove
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
    
    function getVideo(instrumentId) { //could be broken into just a getter depends on what you want to do
        const videoUrlsMap = {
            "magnetometer": "videos/psycheMagnetometerClip.mp4",
            "multispectral": "videos/psycheImagerClip.mp4",
            "xband-radio": "videos/psycheXBandRadioClip.mp4",
            "gamma": "videos/psycheSpectrometerClip.mp4",
            "neutron": "videos/psycheSpectrometerClip.mp4"
        };

        // Get the video URL for the instrument
        const videoUrl = videoUrlsMap[instrumentId] || "";

        // Update the visibility of the video button
        //checkAndUpdateButtonVisibility(videoUrl);

        // Return the video URL
        return videoUrl;
    }
    function checkAndUpdateButtonVisibility(videoUrl) {
        if (!videoUrl) {
            // Hide the button if videoUrl is empty, null, or undefined
            videoButton.style.display = 'none';
        } else {
            // Show the button if a valid video URL exists
            videoButton.style.display = 'inline-block';
        }
    }

    function showInstrument(orbit) {
        // Hide all instruments first
        const instruments = document.querySelectorAll("[id$='-spectrometer'], #magnetometer, #multispectral-imager, #xband-radio");
        instruments.forEach(inst => inst.setAttribute("visible", "false"));

        // Select the correct instrument to show
        let instrumentId;
        switch (orbit) {
            case "orbitA":
                instrumentId = "magnetometer";
                
                break;
            case "orbitB":
                instrumentId = "multispectral-imager";
            
                break;
            case "orbitC":
                instrumentId = "xband-radio";
                
                break;
            case "orbitD":
                instrumentId = "gamma";
            
                break;
            default:
                if (spacecraft) {
                instrumentId = "spacecraft";
                spacecraft.setAttribute("visible", "true");
            }
                console.log("Invalid orbit parameter.");
        }
        // correct instrument lighting
        updateLightForInstrument(instrumentId);

        videoUrl = getVideo(instrumentId);
        selectedInstrument = document.getElementById(instrumentId);
        const instrumentLink = selectedInstrument.getAttribute("data")
        if (instrumentId !== "spacecraft"){
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
        sampleDataBox.style.top = `${instrumentDetailsBox.offsetTop + 5}px`; // Add 5px spacing
    }
 
    // Dynamic lighting for instruments needing brighter lighting
    // point light always same position; directional may need updating
    function updateLightForInstrument(instrumentId) {
    switch (instrumentId) {
        case "magnetometer":
            directionalLight.setAttribute("intensity", "5.0");
            directionalLight.setAttribute("position", "-3 -2 1");
            pointLight.setAttribute("intensity", "7.0");
            ambientLight.setAttribute("intensity", "0");
            break;
        case "multispectral":
            directionalLight.setAttribute("intensity", "2.0");
            directionalLight.setAttribute("position", "1 3 -4");
            pointLight.setAttribute("intensity", "5.0");
            ambientLight.setAttribute("intensity", "0");
            break;
        case "xband-radio":
            directionalLight.setAttribute("intensity", "2.0");
            directionalLight.setAttribute("position", "-4 2 -1");
            pointLight.setAttribute("intensity", "5.0");
            ambientLight.setAttribute("intensity", "0");
            break;
        case "gamma":
            directionalLight.setAttribute("intensity", "1");
            directionalLight.setAttribute("position", "-2.5 2 4");
            pointLight.setAttribute("intensity", ".25");
            ambientLight.setAttribute("intensity", ".25");
            break;
        case "neutron":
            directionalLight.setAttribute("intensity", "10");
            directionalLight.setAttribute("position", "-1.5 0 1.5");
            pointLight.setAttribute("intensity", "1.5");
            ambientLight.setAttribute("intensity", "50.0");
            break;
        default:
            directionalLight.setAttribute("intensity", "1.0");
            directionalLight.setAttribute("position", "-2.5 2 1");
            pointLight.setAttribute("intensity", "3.5");
            ambientLight.setAttribute("intensity", "0");
            break;
        }
    }
    
    function updateVideo(video) {
        let videoIframe = document.getElementById('videoIframe');

        if (videoIframe) {
            console.log(`Showing: ${video}`);
            videoIframe.src = video;  
        } else {
            console.error('Video iframe not found!');
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
            } else {
                console.log("Video URL is empty.");
            }
        } else {
            console.log("Video element not found.");
        }
    }
    function getInstrumentNameById(instrumentId) {
        // This function maps the id to its corresponding value name
        const instrumentNameMapping = {
            "spacecraft": "spacecraft",
            "gamma": "gamma",
            "neutron": "neutron",
            "magnetometer": "magnetometer",
            "multispectral-imager": "multispectral",
            "xband-radio": "xband-radio"
        };
        return instrumentNameMapping[instrumentId] || null;
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
        }
    });
});