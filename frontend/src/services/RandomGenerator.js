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

/**
 * Picks a random item and returns that item and n-1 most similar items
 * @param array 
 * @param n 
 * @returns {List} 
 */
export const randomSimilarPicker = (array, n, similarity) => {
    // Shuffle array
    const sources = array;
    const keys = Object.keys(similarity);
    const randomItem = similarity[keys[ keys.length * Math.random() << 0]];
    let arr = [];
    for (let key in similarity[randomItem]) {
        arr.push([similarity[randomItem][key], key]);
    }
    arr.sort();
    let final = [];
    for (let j = 0; j < sources.length-1; j++) {
        if (sources[j].id === randomItem) {
            final.push(sources[j]);
            break;
        }
    }
    for (let i = 0; i < n-1; i++) {
        for (let j = 0; j < sources.length-1; j++) {
            if (sources[j].id === arr[i][1]) {
                final.push(sources[j]);
            }
        }
    }
    // Get subarray of n most similar sources
    return final;
};