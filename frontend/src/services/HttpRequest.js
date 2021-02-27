// import {Alert} from 'rsuite';
import createAuth0Client from '@auth0/auth0-spa-js';

// The Auth0 client for obtaining JWT's
let auth0 = null;
/* global chrome */

const baseUrl = "https://knolist.herokuapp.com";
// const baseUrl = "http://localhost:5000";

/**
 * Used to construct the valid endpoint for general and filtered searches.
 * @param endpoint The request endpoint (including the first slash). E.g., "/projects"
 * @param query The query string
 * @param filters A list of filters indicating which categories to query through
 * @returns {String}
 */
export function constructHttpQuery(endpoint, query, filters) {
    let finalEndpoint = endpoint + "?query=" + query;
    if (filters.length !== 0) {
        filters.forEach(function (entry) {
            if (entry === "Page Content") {
                entry = "content";
            }
            finalEndpoint = finalEndpoint + "&filter=" + entry.toLowerCase();
        });
    }
    return finalEndpoint;
}

/**
 * Used to make standard requests to the Knolist API. Includes authorization.
 * @param endpoint The request endpoint (including the first slash). E.g., "/projects"
 * @param method The HTTP method, if none is provided we assume "GET". E.g., "POST"
 * @param jsonBody A JS object that will be the JSON body of the request. E.g, {title: "New Project"}
 * @returns {Promise<{body: any, status: number}>}
 */
async function makeHttpRequest(endpoint, method = "GET", jsonBody = {}) {

    // Configure Auth0 Client
    auth0 = await createAuth0Client({
        domain: 'knolist.us.auth0.com',
        client_id: 'pBu5uP4mKTQgBttTW13N0wCVgsx90KMi',
        audience: 'knolist',
    });


    // Grab the access token from the authentication workflow
    const jwt = await auth0.getTokenSilently();
    // Check if it's Chrome browser, only send if so
    // Based on https://stackoverflow.com/questions/9847580/how-to-detect-safari-chrome-ie-firefox-and-opera-browser
    const isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);
    const isEdgeChromium = isChrome && (navigator.userAgent.indexOf("Edg") !== -1);
    if (isChrome && !isEdgeChromium) {
        if (process.env.REACT_APP_CHROME_EXTENSION_ID === undefined) {
            console.log("Please include the Chrome extension ID in the /frontend/.env.development.local file");
        } else {
            chrome.runtime.sendMessage(process.env.REACT_APP_CHROME_EXTENSION_ID, {jwt: jwt},
                function (response) {
                    console.log("got response " + response);
                }
            );
        }
    } else console.log("Not Chrome");

    const url = baseUrl + endpoint;
    // Build params object
    let params = {}
    // Add authorization
    params["headers"] = {
        "Authorization": "Bearer " + jwt
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

    return {
        status: responseStatus,
        body: responseBody
    };
}

export default makeHttpRequest;