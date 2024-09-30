export function getRandomInt(min: number, max: number): number {
    // Math.floor: Will round down to make sure you get an integer
    return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * 
 * @param min 
 * @param max 
 * @param fractionDigits — Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
 * @returns 
 */
export function getRandom(min: number, max: number, fractionDigits: number = 0): string {
    const _random = Math.random() * (max - min + 1) + min
    const rate = Math.pow(10, 2)
    console.log('raw', _random, 'rate', rate, Math.floor(_random * rate) / rate)
    if (fractionDigits == 0) {
        return Math.floor(_random).toString();
    }
    return Number(_random).toFixed(fractionDigits + 1).slice(0, -1);
}