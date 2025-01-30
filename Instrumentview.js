const instrumentsData = [ //for now until we migate into its own .txt file also check description
    {
      id: "gamma",
      name: "Gamma Ray Spectrometer",
      description: "The Gamma Ray Spectrometer detects gamma rays emitted from Psyche, helping to determine the elemental composition of the asteroid's surface and subsurface."
    },
    {
      id: "neutron",
      name: "Neutron Spectrometer",
      description: "The Neutron Spectrometer helps in analyzing neutron emissions from Psyche to better understand the asteroid's composition."
    },
    {
      id: "magnetometer",
      name: "Magnetometer",
      description: "The Magnetometer measures the magnetic field around Psyche to investigate its internal structure and history."
    },
    {
      id: "multispectral",
      name: "Multispectral Imager",
      description: "The Multispectral Imager captures high-resolution images in different wavelengths to analyze Psyche's surface composition and features."
    }
  ];
  

  function handleInstrumentClick(instrumentId) {
    const instrument = instrumentsData.find(i => i.id === instrumentId);
    if (instrument) {
      displayInstrumentDetails(instrument);
    }
  }
  

  // Display selected instrument details
  function displayInstrumentDetails(instrument) {
    const detailsContainer = document.querySelector("#instrument-details");
    detailsContainer.innerHTML = `
      <div class="mt-2 p-2 border rounded-lg shadow-lg">
        <h2 class="text-2xl">${instrument.description}</p>
      </div>
    `;
  }
  
  // Attach click event listeners to menu links
  function setupInstrumentMenuHandlers() {
    document.querySelectorAll(".navigation__item a[data-instrument]").forEach(link => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const instrumentId = event.target.dataset.instrument;
        handleInstrumentClick(instrumentId);
      });
    });
  }
  
  // Initialize the application
  function initializeApp() {
    setupInstrumentMenuHandlers();
  }
  
  // Wait for DOM content to load before initializing
  document.addEventListener("DOMContentLoaded", initializeApp);