// script.js

// --- Basic utilities ------------------------------------------------------

function randBetween(min, max) {
  return min + (max - min) * Math.random();
}

function randInt(min, maxInclusive) {
  return Math.floor(randBetween(min, maxInclusive + 0.9999));
}

// Map planet type to color for the visualization
function colorForPlanetType(type) {
  switch (type) {
    case "rocky":
      return "#d4a15e"; // warm rocky
    case "gas":
      return "#6fb3ff"; // blue-ish gas giant
    case "ice":
      return "#a8dfff"; // pale icy
    default:
      return "#bbbbbb";
  }
}

// --- Solar system generator (simple but slightly physics-flavored) -------

function generateSolarSystem() {
  const star = {
    name: "Primary Star",
    massSol: 1.0,
    radiusSol: 1.0,
    spectralType: "G",
    luminositySol: 1.0
  };

  const numPlanets = randInt(4, 10);
  const planets = [];

  // Start between Mercury and Venus
  let a = randBetween(0.3, 0.6); // semi-major axis in AU

  for (let i = 0; i < numPlanets; i++) {
    const order = i + 1;

    // Decide type roughly based on distance
    let type;
    if (a < 2) {
      type = "rocky";
    } else if (a < 6) {
      type = "gas";
    } else {
      type = "ice";
    }

    // Mass ranges in Earth masses (very rough)
    let massEarths;
    if (type === "rocky") {
      massEarths = randBetween(0.1, 5); // Mercury to super-Earth
    } else if (type === "gas") {
      massEarths = randBetween(20, 300); // Neptune to massive Jovian
    } else {
      massEarths = randBetween(5, 30); // ice giants
    }

    // Rough radius scaling (not physically exact, just for variety)
    let radiusEarths;
    if (type === "rocky") {
      radiusEarths = Math.pow(massEarths, 0.28);
    } else if (type === "gas") {
      radiusEarths = 3 + Math.log10(massEarths); // keep in a reasonable range
    } else {
      radiusEarths = 2 + 0.4 * Math.log10(massEarths);
    }

    // Simple Kepler third law with 1 solar mass: P^2 = a^3 => P = sqrt(a^3), in years
    const orbitalPeriodYears = Math.sqrt(a * a * a);
    const orbitalPeriodDays = orbitalPeriodYears * 365.25;

    const eccentricity = randBetween(0.0, 0.25);

    // Visual size category
    let visualSizeCategory;
    if (massEarths < 0.5) visualSizeCategory = "small";
    else if (massEarths < 15) visualSizeCategory = "medium";
    else visualSizeCategory = "large";

    // Precompute some display-friendly fields
    const AU_IN_KM = 149_597_870;
    const distanceKm = a * AU_IN_KM;
    const distanceMillionKm = distanceKm / 1e6;

    const planet = {
      id: `planet_${order}`,
      name: `Planet ${order}`,
      orderFromStar: order,
      type,
      massEarths,
      radiusEarths,
      semiMajorAxisAU: a,
      semiMajorAxisMillionKm: distanceMillionKm,
      orbitalPeriodYears,
      orbitalPeriodDays,
      eccentricity,
      visualSizeCategory,
      color: colorForPlanetType(type)
    };

    planets.push(planet);

    // Next orbit: space them out by a random factor
    const gapFactor = randBetween(1.4, 2.0);
    a *= gapFactor;
  }

  return { star, planets };
}

// --- Visualization --------------------------------------------------------

const svg = document.getElementById("systemSvg");
const zoomSlider = document.getElementById("zoomSlider");
const regenBtn = document.getElementById("regenBtn");
const starNameEl = document.getElementById("starName");
const planetCountEl = document.getElementById("planetCount");
const planetSummaryEl = document.getElementById("planetSummary");
const planetJsonEl = document.getElementById("planetJson");

let currentSystem = null;
let currentSelectedPlanetId = null;
let baseExtent = 400; // world units half-width used in viewBox

function renderSystem(system) {
  currentSystem = system;
  currentSelectedPlanetId = null;

  // Clear existing SVG content
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  // Star info
  starNameEl.textContent = system.star.name;
  planetCountEl.textContent = system.planets.length.toString();

  // Compute scale: fit outermost orbit inside baseExtent with some padding
  const maxA = system.planets.reduce(
    (max, p) => Math.max(max, p.semiMajorAxisAU),
    0.01
  );
  const padding = 40;
  const baseScale = (baseExtent - padding) / maxA;

  // Group for everything (not used for zoom; zoom uses viewBox)
  const rootGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  svg.appendChild(rootGroup);

  // Draw orbits
  system.planets.forEach(p => {
    const orbitR = p.semiMajorAxisAU * baseScale;
    const orbit = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    orbit.setAttribute("class", "orbit");
    orbit.setAttribute("cx", "0");
    orbit.setAttribute("cy", "0");
    orbit.setAttribute("r", orbitR.toFixed(2));
    rootGroup.appendChild(orbit);
  });

  // Add defs + star gradient
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const radialGradient = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "radialGradient"
  );
  radialGradient.setAttribute("id", "starGradient");
  radialGradient.setAttribute("cx", "50%");
  radialGradient.setAttribute("cy", "50%");
  radialGradient.setAttribute("r", "50%");
  const stop1 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "stop"
  );
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#ffffe0");
  const stop2 = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "stop"
  );
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#ffb300");
  radialGradient.appendChild(stop1);
  radialGradient.appendChild(stop2);
  defs.appendChild(radialGradient);
  svg.insertBefore(defs, svg.firstChild);

  // Draw star
  const starCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  starCircle.setAttribute("cx", "0");
  starCircle.setAttribute("cy", "0");
  starCircle.setAttribute("r", "10");
  starCircle.setAttribute("fill", "url(#starGradient)");
  rootGroup.appendChild(starCircle);

  // Label for the star
  const starLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  starLabel.setAttribute("id", "starLabel");
  starLabel.setAttribute("x", "0");
  starLabel.setAttribute("y", "-16");
  starLabel.textContent = "Star";
  rootGroup.appendChild(starLabel);

  // Draw planets
  const planetRadiusPixels = {
    small: 4,
    medium: 7,
    large: 10
  };

  system.planets.forEach(p => {
    // Random angle for visual placement
    const angle = randBetween(0, Math.PI * 2);
    const rOrbit = p.semiMajorAxisAU * baseScale;
    const x = Math.cos(angle) * rOrbit;
    const y = Math.sin(angle) * rOrbit;

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "planet");
    circle.setAttribute("cx", x.toFixed(2));
    circle.setAttribute("cy", y.toFixed(2));
    circle.setAttribute("r", planetRadiusPixels[p.visualSizeCategory]);
    circle.setAttribute("fill", p.color);
    circle.setAttribute("data-planet-id", p.id);

    const tooltipText = `Planet ${p.orderFromStar} — ${p.type}`;
    circle.setAttribute("title", tooltipText);

    circle.addEventListener("click", () => {
      selectPlanet(p.id);
    });

    rootGroup.appendChild(circle);
  });

  // Reset zoom to 1
  zoomSlider.value = "1";
  updateZoom();
  clearPlanetSelection();
}

function clearPlanetSelection() {
  planetSummaryEl.innerHTML =
    "<p>No planet selected. Click a planet in the diagram.</p>";
  planetJsonEl.textContent = "{ }";

  // Remove selection class
  const planetsDom = svg.querySelectorAll(".planet");
  planetsDom.forEach(c => c.classList.remove("selected"));
}

function selectPlanet(planetId) {
  currentSelectedPlanetId = planetId;
  const planet = currentSystem.planets.find(p => p.id === planetId);
  if (!planet) return;

  // Highlight selected
  const planetsDom = svg.querySelectorAll(".planet");
  planetsDom.forEach(c => {
    if (c.getAttribute("data-planet-id") === planetId) {
      c.classList.add("selected");
    } else {
      c.classList.remove("selected");
    }
  });

  // Show summary
  const summaryHtml = `
      <p><strong>${planet.name}</strong> (Planet ${planet.orderFromStar} from the star)</p>
      <p><strong>Type:</strong> ${planet.type}</p>
      <p><strong>Visual size:</strong> ${planet.visualSizeCategory}</p>
      <p><strong>Mass:</strong> ${planet.massEarths.toFixed(2)} Earth masses</p>
      <p><strong>Radius:</strong> ${planet.radiusEarths.toFixed(2)} Earth radii</p>
      <p><strong>Semi-major axis:</strong> ${planet.semiMajorAxisAU.toFixed(2)} AU
         (${planet.semiMajorAxisMillionKm.toFixed(1)} million km)</p>
      <p><strong>Orbital period:</strong> ${planet.orbitalPeriodYears.toFixed(2)} Earth years
         (${planet.orbitalPeriodDays.toFixed(0)} days)</p>
      <p><strong>Eccentricity:</strong> ${planet.eccentricity.toFixed(2)}</p>
    `;
  planetSummaryEl.innerHTML = summaryHtml;

  // Raw JSON
  planetJsonEl.textContent = JSON.stringify(planet, null, 2);
}

function updateZoom() {
  const zoom = parseFloat(zoomSlider.value);
  const extent = baseExtent / zoom;
  svg.setAttribute(
    "viewBox",
    [-extent, -extent, extent * 2, extent * 2].join(" ")
  );
}

zoomSlider.addEventListener("input", updateZoom);

regenBtn.addEventListener("click", () => {
  const system = generateSolarSystem();
  renderSystem(system);
});

// Initial load
const initialSystem = generateSolarSystem();
renderSystem(initialSystem);
