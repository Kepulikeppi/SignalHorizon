# Solar System History Generator — Full Process Specification

This document describes the complete step-by-step process for generating a
physically-plausible procedural solar system by simulating its formation history
first, then deriving final planet properties from that history.

---

## 1. Initialize Star and Disk

1. **Generate star parameters**
   - Stellar mass
   - Luminosity
   - Age
   - Spectral type (derived from mass)
   - Metallicity

2. **Generate protoplanetary disk properties**
   - Total disk mass (solid + gas)
   - Radial density distribution
   - Temperature gradient relative to star
   - Disk radius
   - Angular momentum distribution
   - Metallicity (inherited from star)

3. **Compute derived disk parameters**
   - Snow/ice line distance
   - Gas-to-dust ratio
   - Expected solid mass per orbital zone

---

## 2. Divide Disk Into Orbital Zones

4. **Split disk into annuli (orbital rings)**
   - Each ring stores: radius, width, temperature, solid mass, volatile mass.

5. **Determine chemical composition per ring**
   - Inside snow line: silicates, metals
   - Beyond snow line: ices + silicates
   - Far outer disk: high ice fraction, low silicate mass

---

## 3. Seed Planetesimals

6. **Generate initial planetesimals in each ring**
   - Random count based on solid mass
   - Mass distribution using a power law
   - Initial orbital eccentricity and inclination (low values)

7. **Assign material composition to each planetesimal**
   - Rock/metal ratio from chemistry
   - Ice fraction if beyond snow line

---

## 4. Run Accretion Rounds (Formation Simulation)

Accretion proceeds in discrete rounds, not real-time physics.

### A. Growth by Collisions

8. **Check for collisions within each ring**
   - Merge bodies if orbital paths overlap
   - Combine masses
   - Recompute density based on mixed composition
   - Record a “collision event” in history

9. **Promote large bodies to "protoplanets"**
   - Once above defined mass threshold
   - Begin tracking additional details (temperature, potential atmosphere)

### B. Radial Drift & Migration

10. **Apply migration rules**
    - Type I/II migration simplified into:
      - Small bodies drift gradually inward
      - Large bodies shift inward or outward by a random amount scaled by mass
    - If crossing snow line, update composition state (volatiles may vaporize)

11. **Handle orbital resonances**
    - Large bodies can lock smaller ones into resonant orbits
    - Resonance events recorded in history

### C. Gas Accretion (if applicable)

12. **Allow gas accretion for sufficiently massive protoplanets**
    - Only beyond snow line
    - Gas envelope mass increases proportionally to local gas density
    - Once gas is depleted (disk age threshold), gas accretion stops

### D. Disk Evolution

13. **Reduce disk gas over time**
    - Gas decreases each round until dissipated
    - After gas dissipation:
      - Migration stops
      - No new gas giants can form

---

## 5. Finalize Planetary System Architecture

14. **Remove unstable bodies**
    - Eccentric orbits crossing larger bodies may result in:
      - Ejection from system
      - Collision
      - Star absorption
    - All events logged

15. **Consolidate surviving bodies into final planets**
    - Define planets vs dwarf planets by mass
    - Resolve close orbital spacing by merging or scattering

16. **Generate moons**
    - Giant impacts create debris disks → moon formation
    - Gas giants capture small icy bodies as irregular moons

---

## 6. Derive Planetary Physical Characteristics

17. **Compute radius from mass and density**
18. **Compute surface gravity**
19. **Compute escape velocity**
20. **Determine internal structure**
    - Core/mantle/crust ratios derived from impact history
21. **Determine bulk composition**
    - Silicates, metals, ices, gas envelope
22. **Assign geologic state**
    - Tectonics, volcanism activity level, internal heat

---

## 7. Determine Atmosphere Characteristics

23. **Evaluate atmosphere retention**
    - Compare escape velocity to temperature

24. **Generate atmospheric composition**
    - Outgassed volatiles (CO₂, SO₂, H₂O)
    - Retained primordial gases for gas giants
    - Photochemical effects near star

25. **Check for atmospheric loss events**
    - Tidal stripping
    - Stellar wind erosion
    - Giant impacts

26. **Assign cloud types and weather systems**
    - Depends on temperature, composition, rotation rate

---

## 8. Determine Surface & Environmental Features

27. **Determine primary surface type**
    - Rocky
    - Ocean world
    - Ice world
    - Desert world
    - Subsurface ocean

28. **Generate terrain details**
    - Mountains (tectonic uplift)
    - Volcanic plains
    - Cratering from history log
    - Ice caps
    - Liquid bodies (water, methane, etc., temperature-dependent)

29. **Determine magnetic field presence**
    - Based on core size & rotation

30. **Model seasonal behavior**
    - Axial tilt
    - Orbital eccentricity
    - Albedo

---

## 9. Assemble Scientific Data Outputs

31. **Orbital data**
    - Semi-major axis
    - Eccentricity
    - Period
    - Inclination

32. **Spectral signatures**
    - Atmospheric composition
    - Surface mineralogy
    - Cloud chemistry

33. **Probe sensor outputs**
    - Radar altimetry maps
    - Magnetometer readings
    - Gravimetric data
    - Temperature maps

34. **Biological or prebiotic indicators (if applicable)**
    - Biosignature gases
    - Isotopic ratios
    - Organics in crust or atmosphere

---

## 10. Export Complete System Data

35. **Package all objects into a final system definition**
    - Star profile
    - Planet list
    - Moon list
    - Each object’s full history log
    - All derived science data tables

36. **Provide access layers for gameplay**
    - Data based on mission progress
    - Hidden information gradually revealed by instruments
