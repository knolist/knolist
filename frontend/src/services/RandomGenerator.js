/**
 * Returns n random elements from an array.
 * @param array
 * @param n
 * @returns {List}
 */
export const randomPicker = (array, n) => {
    // Shuffle array
    const sources = array;
    for (let i = sources.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sources[i], sources[j]] = [sources[j], sources[i]]
    }

    // Get subarray of first n sources
    return sources.slice(0, n);
};