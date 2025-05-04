import { initNavigationMenu, toggleMenu } from "./menuScript.js";

let videoUrl = null;
let selectedInstrument = null; // Track the currently selected instrument
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

    // Add observers
    instrumentObserver.subscribe("instrumentSelected", loadInstrumentDetails);
    instrumentObserver.subscribe("instrumentSelected", loadSampleData);

    //Extract the query parameter from the URL
    const urlParams = new URLSearchParams(window.location.search);

    //Get the value of the "orbit" parameter
    const orbit = urlParams.get("orbit");

    // Instrument objects
    const instruments = {
        spacecraft: document.querySelector("#spacecraft"),
        gamma: document.querySelector("#gamma"),
        neutron: document.querySelector("#neutron"),
        magnetometer: document.querySelector("#magnetometer"),
        multispectral: document.querySelector("#multispectral"),
        "xband-radio": document.querySelector("#xband-radio")
    };
 
    // Instrument details box
    const instrumentTitle = document.getElementById("instrument-details-title");
    const instrumentDetailsText = document.getElementById("instrumentdetails");
    const instrumentDetailsBox = document.querySelector(".instrument-details");
    const seeMoreBtn1 = document.getElementById("see-more-btn1");
    const returnToOrbitButton = document.getElementById("instrumentButton");

    // Sample data box
    const sampleDataTitle = document.getElementById("sample-data-title");
    const sampleDataImage = document.getElementById("sample-data-image");
    const sampleDataText = document.getElementById("sample-data-text");
    const sampleDataBox = document.querySelector(".sample-data");
    const seeMoreBtn2 = document.getElementById("see-more-btn2");
 
    // Lights
    const directionalLight = document.querySelector("#dynamic-directional-light");
    const pointLight = document.querySelector("#dynamic-point-light");
    const ambientLight = document.querySelector("#dynamic-ambient-light");

    // Touchscreen
    let isDragging = false;
    let previousX = 0;
    let previousY = 0;

    // Turn off camera movement
    const camera = document.querySelector("[camera]");
    if (camera) {
        camera.setAttribute("look-controls", "enabled", false);
        camera.setAttribute("wasd-controls", "enabled", false);
    }

    // Check if linked from orbit
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

            // Close menu
            toggleMenu();

            // Update the light for the selected instrument
            updateLightForInstrument(instrumentId);

            // Make instrument button invisible
            checkAndUpdateButtonVisibility("");
        
            // Get insturment video path
            videoUrl = getVideo(instrumentId);

            // send video to window
            updateVideo(videoUrl);

            //Hide instruments
            Object.keys(instruments).forEach(id => {
                if (instruments[id]) {
                    instruments[id].setAttribute("visible", "false");
                }
            });

            // Get selected instrument
            if (instruments[instrumentId]) {
                selectedInstrument = instruments[instrumentId];

                // Make visible
                selectedInstrument.setAttribute("visible", "true");

                // Check if spacecraft is selected
                if(instrumentId != "spacecraft"){
                    instrumentObserver.notify("instrumentSelected", instrumentId);
                }
                else{
                    instrumentDetailsBox.classList.add("d-none");
                    sampleDataBox.classList.add("d-none");
                }
            } 
            else {
                console.warn(`No model found for ${instrumentId}`);
            }
        });
    });
 
    // Prepare to return to orbit view
    if (returnToOrbitButton) {
        returnToOrbitButton.addEventListener("click", () => {

            // Get current selected instrument
            if(selectedInstrument){
                // Save the orbit in session storage
                const currentOrbit = selectedInstrument.getAttribute("orbit");
                sessionStorage.setItem("selectedOrbit",  currentOrbit);
            }

            // Redirect to orbit view page
            window.location.href = "index.html";
        });
    } else {
        console.warn("Return to Orbit button not found!");
    }

    //Mouse Events
    document.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("mousemove", (e) => {
        e.preventDefault();
        drag(e.clientX, e.clientY);
    });

    //Touch Events
    document.addEventListener("touchstart", (e) => {
        if (e.touches.length > 0) {
            startDrag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });

    document.addEventListener("touchend", endDrag);

    document.addEventListener("touchmove", (e) => {
        const target = e.target;

        //Allow scrolling if inside a scrollable element
        const isInScrollable = target.closest(".scrollable");
    
        if (!isInScrollable) {
            e.preventDefault(); //Only prevent default if NOT in a scrollable area
        }
    
        if (e.touches.length > 0 && !isInScrollable) {
            drag(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: false });
    
    function getVideo(instrumentId) {
        const videoUrlsMap = {
            "magnetometer": "videos/psycheMagnetometerClip.mp4",
            "multispectral": "videos/psycheImagerClip.mp4",
            "xband-radio": "videos/psycheXBandRadioClip.mp4",
            "gamma": "videos/psycheSpectrometerClip.mp4",
            "neutron": "videos/psycheSpectrometerClip.mp4"
        };

        // Get the video URL for the instrument
        const videoUrl = videoUrlsMap[instrumentId] || "";

        // Return the video URL
        return videoUrl;
    }

    // Expansion of details and sample data boxes
    function toggleExpansion(box, button){
        // Change state and update button text
        const isExapanded = box.classList.contains("expanded");
        box.classList.toggle("expanded", !isExapanded);
        box.classList.toggle("collapsed", isExapanded);
        button.innerText = isExapanded ? "+" : "-";

        // Expand box and exnsure other is collapsed
        if(!isExapanded){
            // Get other box and other button
            const otherBox = box ===instrumentDetailsBox ? sampleDataBox: instrumentDetailsBox;
            const otherButton = box ===instrumentDetailsBox ? seeMoreBtn2 : seeMoreBtn1;

            // Collapse other box and update button text
            if(otherBox.classList.contains("expanded")){
                otherBox.classList.remove("expanded");
                otherBox.classList.add("collapsed");
                otherButton.innerText = "+";
            }

            // Get selected instrument video and show video button
            if (box === instrumentDetailsBox && selectedInstrument) {
                const instrumentId = selectedInstrument.id;
                const videoUrl = getVideo(instrumentId);
                checkAndUpdateButtonVisibility(videoUrl);
            }else {
                checkAndUpdateButtonVisibility("");
            }

        } 
        else {
            if (box === instrumentDetailsBox && selectedInstrument) {
                checkAndUpdateButtonVisibility("");
            }
        }
        updateSampleDataBoxPosition();
    } 
 
    // Fetch and load selected instrument details
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

        // Fetch details file
        fetch(descriptionFile)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.text();
            })
            .then(data => {
                // Update title and text
                instrumentTitle.innerText = instrumentNames[instrumentId];
                instrumentDetailsText.innerText = data;

                // Show details box and ensure collapsed
                instrumentDetailsBox.classList.remove("d-none", "collapsed", "expanded");
                instrumentDetailsBox.classList.add("collapsed");

                instrumentDetailsText.style.maxHeight = "120px";
                instrumentDetailsText.style.overflow = "auto";

                seeMoreBtn1.style.display = "block";
                seeMoreBtn1.innerText = "+";
                seeMoreBtn1.onclick = () => toggleExpansion(instrumentDetailsBox, seeMoreBtn1);

            })
 
            .catch(error => {
                instrumentDetailsText.innerText = "Instrument information unavailable.";
                console.error("Error loading instrument file:", error);
            });
    }
 
    // Fetch and load selected instrument sample data
    function loadSampleData(instrumentId) {
        const imageURL = `texts/${instrumentId}/${instrumentId}SampleData.png`;
        const sampleDataTextURL = `texts/${instrumentId}/${instrumentId}Data.txt`;

        // Fetch smaple data image
        fetch(imageURL)
            .then(response => {
                if (!response.ok) throw new Error("File not found");
                return response.blob();
            })
            // Show image
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

        // Fetch sample data text
        fetch(sampleDataTextURL)
            .then(response => {
                if (!response.ok) throw new Error("Text not found");
                return response.text();
            })
            .then(text => {
                // Update title and text
                sampleDataTitle.innerText = "Sample Data";
                sampleDataText.innerText = text;

                // Show sample data box and ensure collapsed
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
 
    // Handle start of drag
    function startDrag(x, y) {
        isDragging = true;
        previousX = x;
        previousY = y;
    }

    // Handle end of drag
    function endDrag() {
        isDragging = false;
    }

    // Handle dragging movement
    function drag(x, y) {
        if (!isDragging || !selectedInstrument) return;

        const deltaX = x - previousX;
        const deltaY = y - previousY;

        previousX = x;
        previousY = y;

        let currentRotation = selectedInstrument.getAttribute("rotation") || { x: 0, y: 0, z: 0 };

        if (typeof currentRotation === "string") {
            const [x, y, z] = currentRotation.split(" ").map(Number);
            currentRotation = { x, y, z };
        }

        currentRotation.x -= deltaY * 0.5;
        currentRotation.y -= deltaX * 0.5;

        selectedInstrument.setAttribute("rotation", `${currentRotation.x} ${currentRotation.y} ${currentRotation.z}`);
    }

    // Instrument video button visibility
    function checkAndUpdateButtonVisibility(videoUrl) {
        if (!videoUrl) {
            // Hide the button if videoUrl is empty, null, or undefined
            videoButton.style.display = 'none';
        } else {
            // Show the button if a valid video URL exists
            videoButton.style.display = 'inline-block';
        }
    }

    // Show isntrument model
    function showInstrument(orbit) {
        // Hide all instruments first
        const instruments = document.querySelectorAll("#gamma, #magnetometer, #multispectral, #xband-radio");
        instruments.forEach(inst => inst.setAttribute("visible", "false"));

        let instrumentId = "spacecraft";

        // Get instrument based on orbit, no orbit = spacecraft
        instruments.forEach(inst => {
            const instrumentOrbit = inst.getAttribute('orbit');

            if(instrumentOrbit === orbit){
                instrumentId = inst.getAttribute('id');
            }
        });

        if(instrumentId == "spacecraft"){
            spacecraft.setAttribute("visible", "true");
        }

        // correct instrument lighting
        updateLightForInstrument(instrumentId);

        //Get instrument video
        videoUrl = getVideo(instrumentId);

        // Save selected instrument
        selectedInstrument = document.getElementById(instrumentId);

        // Get details and sample data
        if (instrumentId !== "spacecraft"){
            instrumentObserver.notify("instrumentSelected", instrumentId);
        }
        else{
            instrumentDetailsBox.classList.add("d-none");
            sampleDataBox.classList.add("d-none");
        }

        // Show isntrument
        if (selectedInstrument) {
            selectedInstrument.setAttribute("visible", "true");
            loadVideoOnPageLoad()
        } else {
            console.log(`Instrument with ID '${instrumentId}' not found!`);
        }
    }
 
    // Fix spacing after expansion/collapse
   function updateSampleDataBoxPosition() {
        sampleDataBox.style.top = `${instrumentDetailsBox.offsetTop + 5}px`; //Add 5px spacing
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
    
    // Update video to be shown
    function updateVideo(video) {
        let videoIframe = document.getElementById('videoIframe');

        if (videoIframe) {
            videoIframe.src = video;  
        } else {
            console.error('Video iframe not found!');
        }
    }

    // Show video when linked from Orbit view
    function loadVideoOnPageLoad() {
        //Get the video element by ID
        const videoIframe = document.getElementById("videoIframe");
        if (videoIframe) {
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

    document.getElementById("videoModal").addEventListener("hidden.bs.modal", function () {
        
        //Remove any lingering modal backdrop
        const modalBackdrops = document.getElementsByClassName("modal-backdrop");
        while (modalBackdrops.length) {
            modalBackdrops[0].parentNode.removeChild(modalBackdrops[0]);
        }

        //Set focus back to the A-Frame scene for full control
        const aScene = document.querySelector("a-scene");
        if (aScene) {
            aScene.focus();
        }
    });
});
