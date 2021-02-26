/**
 * Trims a function for leading or trailing whitespace.
 * Based on https://stackoverflow.com/questions/8517089/js-search-in-object-values
 * @param s
 * @returns {string}
 */
export const trimString = (s) => {
    let l = 0, r = s.length - 1;
    while (l < s.length && s[l] === ' ') l++;
    while (r > l && s[r] === ' ') r -= 1;
    return s.substring(l, r + 1);
};