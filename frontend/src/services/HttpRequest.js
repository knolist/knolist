import {Alert} from 'rsuite';


// purposely use invalid token to test redirection to login page
const jwt = "";
// const baseUrl = "https://knolist-api.herokuapp.com";
const baseUrl = "http://localhost:5000"

/**
 * Used to make standard requests to the Knolist API. Includes authorization.
 * @param endpoint The request endpoint (including the first slash). E.g., "/projects"
 * @param method The HTTP method, if none is provided we assume "GET". E.g., "POST"
 * @param jsonBody A JS object that will be the JSON body of the request. E.g, {title: "New Project"}
 * @returns {Promise<{body: any, status: number}>}
 */
async function makeHttpRequest(endpoint, method = "GET", jsonBody = {}) {
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

    // Build URL for redirecting to login
    const auth0BaseUrl = "https://knolist.us.auth0.com";
    const audience = "knolist";
    const response_type = "token";
    const client_id = "pBu5uP4mKTQgBttTW13N0wCVgsx90KMi";
    const redirect_uri = "https://knolist-api.herokuapp.com/auth/callback";
    const auth0Url = auth0BaseUrl + "/authorize?audience=" + audience + "&response_type=" + response_type + "&client_id=" + client_id + "&redirect_uri=" + redirect_uri;

    if (!responseBody.success) {
        Alert.error("Something went wrong!");
        if (responseStatus === 401 || responseStatus === 403) {
            window.location.replace(auth0Url)
        }
    }
    return {
        status: responseStatus,
        body: responseBody
    };
}

export default makeHttpRequest;