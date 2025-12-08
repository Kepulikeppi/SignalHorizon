// A simple Pseudo-Random Number Generator (PRNG)
// This ensures that if you load Seed 12345, the planet looks exactly the same every time.
export class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    // Returns a number between 0 and 1
    random() {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }

    // Returns a number between min and max
    range(min, max) {
        return min + (this.random() * (max - min));
    }

    // Returns a random color
    color(minHex, maxHex) {
        // Simple color mixing logic could go here, 
        // but for now we'll just return random variations
        return {
            r: this.random(),
            g: this.random(),
            b: this.random()
        };
    }
}
