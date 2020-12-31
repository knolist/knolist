import {Alert} from 'rsuite';

export default class Utils {
    constructor(jwt, baseUrl) {
        this.jwt = jwt;
        this.baseUrl = baseUrl;
    }

    /**
     * Used to make standard requests to the Knolist API. Includes authorization.
     * @param endpoint The request endpoint (including the first slash). E.g., "/projects"
     * @param method The HTTP method, if none is provided we assume "GET". E.g., "POST"
     * @param jsonBody A JS object that will be the JSON body of the request. E.g, {title: "New Project"}
     * @returns {Promise<{body: any, status: number}>}
     */
    makeHttpRequest = async (endpoint, method = "GET", jsonBody = {}) => {
        const url = this.baseUrl + endpoint;
        // Build params object
        let params = {}
        // Add authorization
        params["headers"] = {
            "Authorization": "Bearer " + this.jwt
        }
        // Add body and content-type if necessary
        if (Object.keys(jsonBody).length > 0) {
            params["headers"]["Content-Type"] = "application/json";
            params["body"] = JSON.stringify(jsonBody);
        }
        // Add method if not "GET"
        if (method !== "GET") {
            params["method"] = method;
        }

        // Make request
        const response = await fetch(url, params);
        const responseStatus = response.status;
        const responseBody = await response.json();
        if (!responseBody.success) {
            Alert.error("Something went wrong!");
        }
        return {
            status: responseStatus,
            body: responseBody
        };
    }

    /**
     * Trims a function for leading or trailing whitespace.
     * Based on https://stackoverflow.com/questions/8517089/js-search-in-object-values
     * @param s
     * @returns {string}
     */
    trimString = (s) => {
        let l = 0, r = s.length - 1;
        while (l < s.length && s[l] === ' ') l++;
        while (r > l && s[r] === ' ') r -= 1;
        return s.substring(l, r + 1);
    };
}