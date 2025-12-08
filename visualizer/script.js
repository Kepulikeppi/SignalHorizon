// script.js

// --- Constants ------------------------------------------------------------

const AU_IN_KM = 149_597_870;
const EARTH_RADIUS_KM = 6371;
const EARTH_RADIUS_AU = EARTH_RADIUS_KM / AU_IN_KM; // ≈ 4.26e-5
const STAR_MASS_EARTHS = 332_946;                   // 1 solar mass in Earth masses
const SNOW_LINE_AU = 3.0;                           // very rough

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

// --- Moon generator -------------------------------------------------------

function generateMoonsForPlanet(planet) {
  const moons = [];

  // Very small planets basically get no moons
  if (planet.massEarths < 0.05) return moons;

  // Hill radius in AU: r_H ≈ a * (m_p / (3 M_*))^(1/3)
  const mPlanet = planet.massEarths;
  const aPlanet = planet.semiMajorAxisAU;
  const rHillAU = aPlanet * Math.cbrt(mPlanet / (3 * STAR_MASS_EARTHS));

  // If Hill sphere is tiny (very close to star or very low mass), skip moons
  if (!isFinite(rHillAU) || rHillAU < 0.0005) return moons;

  // Planet radius in AU
  const planetRadiusAU = planet.radiusEarths * EARTH_RADIUS_AU;
  if (planetRadiusAU <= 0) return moons;

  // Maximum distance (in planet radii) where moons stay well inside Hill sphere
  const maxFactor = (0.5 * rHillAU) / planetRadiusAU; // 0.5 r_H for safety
  if (maxFactor < 3) return moons; // no stable space for moons really

  let minFactor = 3;    // >= 3 planet radii (Roche limit-ish)
  let maxUsableFactor = Math.min(maxFactor, 80); // don't place moons crazy far

  if (maxUsableFactor <= minFactor) return moons;

  // Decide how many moons, based on planet type and mass
  let numMoons = 0;
  if (planet.type === "rocky") {
    if (planet.massEarths < 0.2) {
      numMoons = 0;
    } else {
      numMoons = randInt(0, 2);
    }
    if (planet.isHome) {
      numMoons = Math.max(numMoons, 1); // force at least one for homeworld
    }
  } else if (planet.type === "gas" || planet.type === "ice") {
    const massScale = Math.log10(planet.massEarths + 1);
    numMoons = randInt(2, Math.max(3, Math.min(8, Math.round(2 + massScale * 3))));
  }

  if (numMoons <= 0) return moons;

  // Basic mass fractions for moons
  for (let i = 0; i < numMoons; i++) {
    const index = i + 1;

    // Composition: inside snow line => rocky, outside => icy
    const moonType = planet.semiMajorAxisAU < SNOW_LINE_AU ? "rocky" : "icy";

    let massFrac;
    if (planet.type === "rocky") {
      // Big impact moons: up to a few % of planet mass
      massFrac = randBetween(0.001, 0.03);
      if (planet.isHome && i === 0) {
        // Bias first moon of homeworld to be a nice big one
        massFrac = randBetween(0.005, 0.03);
      }
    } else {
      // Gas/ice giants: moons are much smaller fraction of mass
      massFrac = randBetween(1e-5, 2e-3);
    }

    const massEarths = planet.massEarths * massFrac;

    // Radius scaling, similar to planets but tiny
    let radiusEarths;
    if (moonType === "rocky") {
      radiusEarths = Math.pow(massEarths, 0.28);
    } else {
      // icy, lower density so slightly puffier
      radiusEarths = 1.1 * Math.pow(massEarths, 0.28);
    }

    // Distance from planet in planet radii
    const factor = randBetween(minFactor, maxUsableFactor);
    const distancePlanetRadii = factor;
    const distanceKm = distancePlanetRadii * planet.radiusEarths * EARTH_RADIUS_KM;

    const moon = {
      id: `${planet.id}_moon_${index}`,
      name: planet.isHome && index === 1 ? "Home Moon" : `${planet.name} ${String.fromCharCode(96 + index).toUpperCase()}`,
      type: moonType,
      massEarths,
      radiusEarths,
      distancePlanetRadii,
      distanceKm
    };

    moons.push(moon);
  }

  return moons;
}

// --- Solar system generator with guaranteed home planet -------------------

function generateSolarSystem() {
  const star = {
    name: "Primary Star",
    massSol: 1.0,
    radiusSol: 1.0,
    spectralType: "G",
    luminositySol: 1.0
  };

  const totalPlanets = randInt(5, 10);

  const HZ_INNER = 0.9;   // AU
  const HZ_OUTER = 1.5;   // AU

  const homeSemiMajorAxis = randBetween(1.0, 1.3); // AU

  const orbitsAU = [];

  // 1) Inner rocky planets inside the home orbit
  let aInner = randBetween(0.3, 0.5);
  while (orbitsAU.length < totalPlanets - 1 && aInner < homeSemiMajorAxis * 0.8) {
    orbitsAU.push(aInner);
    const gapFactorInner = randBetween(1.4, 1.9);
    aInner *= gapFactorInner;
  }

  // 2) Insert the home orbit
  const homeIndex = orbitsAU.length;
  orbitsAU.push(homeSemiMajorAxis);

  // 3) Outer planets beyond the home orbit
  let aOuter = homeSemiMajorAxis * randBetween(1.4, 2.0);
  while (orbitsAU.length < totalPlanets) {
    orbitsAU.push(aOuter);
    const gapFactorOuter = randBetween(1.4, 2.0);
    aOuter *= gapFactorOuter;
  }

  const planets = [];

  orbitsAU.forEach((a, idx) => {
    const order = idx + 1;
    const isHome = (idx === homeIndex);

    let type;
    if (isHome) {
      type = "rocky";
    } else if (a < 2) {
      type = "rocky";
    } else if (a < 6) {
      type = "gas";
    } else {
      type = "ice";
    }

    let massEarths;
    if (isHome) {
      massEarths = randBetween(0.7, 1.5);
    } else if (type === "rocky") {
      massEarths = randBetween(0.1, 5);
    } else if (type === "gas") {
      massEarths = randBetween(20, 300);
    } else {
      massEarths = randBetween(5, 30);
    }

    let radiusEarths;
    if (isHome) {
      radiusEarths = randBetween(0.9, 1.2);
    } else if (type === "rocky") {
      radiusEarths = Math.pow(massEarths, 0.28);
    } else if (type === "gas") {
      radiusEarths = 3 + Math.log10(massEarths);
    } else {
      radiusEarths = 2 + 0.4 * Math.log10(massEarths);
    }

    const orbitalPeriodYears = Math.sqrt(a * a * a);
    const orbitalPeriodDays = orbitalPeriodYears * 365.25;
    const eccentricity = randBetween(0.0, 0.25);

    let visualSizeCategory;
    if (massEarths < 0.5) visualSizeCategory = "small";
    else if (massEarths < 15) visualSizeCategory = "medium";
    else visualSizeCategory = "large";

    const distanceKm = a * AU_IN_KM;
    const distanceMillionKm = distanceKm / 1e6;
    const inHabitableZone = a >= HZ_INNER && a <= HZ_OUTER;

    const baseColor = colorForPlanetType(type);
    const color = isHome ? "#4aa3ff" : baseColor;

    const planet = {
      id: `planet_${order}`,
      name: isHome ? "Homeworld" : `Planet ${order}`,
      orderFromStar: order,
      type,
      isHome,
      inHabitableZone,
      massEarths,
      radiusEarths,
      semiMajorAxisAU: a,
      semiMajorAxisMillionKm: distanceMillionKm,
      orbitalPeriodYears,
      orbitalPeriodDays,
      eccentricity,
      visualSizeCategory,
      color
    };

    planets.push(planet);
  });

  // Generate moons for each planet
  planets.forEach(p => {
    p.moons = generateMoonsForPlanet(p);
  });

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
let baseExtent = 400;

// star radius in SVG units
const STAR_RADIUS = 6;

function renderSystem(system) {
  currentSystem = system;
  currentSelectedPlanetId = null;

  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  starNameEl.textContent = system.star.name;
  planetCountEl.textContent = system.planets.length.toString();

  const maxA = system.planets.reduce(
    (max, p) => Math.max(max, p.semiMajorAxisAU),
    0.01
  );
  const padding = 40;
  const innerPaddingAU = 0.5;
  const baseScale = (baseExtent - padding) / (maxA + innerPaddingAU);

  const rootGroup = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  svg.appendChild(rootGroup);

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

  const starCircle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  starCircle.setAttribute("cx", "0");
  starCircle.setAttribute("cy", "0");
  starCircle.setAttribute("r", String(STAR_RADIUS));
  starCircle.setAttribute("fill", "url(#starGradient)");
  rootGroup.appendChild(starCircle);

  const starLabel = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  starLabel.setAttribute("id", "starLabel");
  starLabel.setAttribute("x", "0");
  starLabel.setAttribute("y", String(-STAR_RADIUS - 5));
  starLabel.textContent = "Star";
  rootGroup.appendChild(starLabel);

  system.planets.forEach(p => {
    const visualRadius = (p.semiMajorAxisAU + innerPaddingAU) * baseScale;
    const orbit = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    orbit.setAttribute("class", "orbit");
    orbit.setAttribute("cx", "0");
    orbit.setAttribute("cy", "0");
    orbit.setAttribute("r", visualRadius.toFixed(2));
    rootGroup.appendChild(orbit);
  });

  const planetRadiusBase = {
    small: 3,
    medium: 5,
    large: 7
  };

  system.planets.forEach(p => {
    const angle = randBetween(0, Math.PI * 2);

    const visualRadius = (p.semiMajorAxisAU + innerPaddingAU) * baseScale;
    const x = Math.cos(angle) * visualRadius;
    const y = Math.sin(angle) * visualRadius;

    const distanceOrbitToStarSurface = visualRadius - STAR_RADIUS;
    let maxAllowedRadius = 0.5 * distanceOrbitToStarSurface;
    if (maxAllowedRadius < 0.2) maxAllowedRadius = 0.2;

    const baseRadius = planetRadiusBase[p.visualSizeCategory] || 4;
    const finalRadius = Math.min(baseRadius, maxAllowedRadius);

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "planet");
    circle.setAttribute("cx", x.toFixed(2));
    circle.setAttribute("cy", y.toFixed(2));
    circle.setAttribute("r", finalRadius.toFixed(2));
    circle.setAttribute("fill", p.color);
    circle.setAttribute("data-planet-id", p.id);

    const tooltipText = `Planet ${p.orderFromStar} — ${p.type}${p.isHome ? " (homeworld)" : ""}`;
    circle.setAttribute("title", tooltipText);

    circle.addEventListener("click", () => {
      selectPlanet(p.id);
    });

    rootGroup.appendChild(circle);
  });

  zoomSlider.value = "1";
  updateZoom();
  clearPlanetSelection();
}

function clearPlanetSelection() {
  planetSummaryEl.innerHTML =
    "<p>No planet selected. Click a planet in the diagram.</p>";
  planetJsonEl.textContent = "{ }";

  const planetsDom = svg.querySelectorAll(".planet");
  planetsDom.forEach(c => c.classList.remove("selected"));
}

function selectPlanet(planetId) {
  currentSelectedPlanetId = planetId;
  const planet = currentSystem.planets.find(p => p.id === planetId);
  if (!planet) return;

  const planetsDom = svg.querySelectorAll(".planet");
  planetsDom.forEach(c => {
    if (c.getAttribute("data-planet-id") === planetId) {
      c.classList.add("selected");
    } else {
      c.classList.remove("selected");
    }
  });

  const moonCount = planet.moons ? planet.moons.length : 0;

  const summaryHtml = `
      <p><strong>${planet.name}</strong> (Planet ${planet.orderFromStar} from the star)</p>
      <p><strong>Type:</strong> ${planet.type}${planet.isHome ? " (homeworld)" : ""}</p>
      <p><strong>In habitable zone:</strong> ${planet.inHabitableZone ? "yes" : "no"}</p>
      <p><strong>Moons:</strong> ${moonCount}</p>
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
