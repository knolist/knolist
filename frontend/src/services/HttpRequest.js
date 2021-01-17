import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE2MzIzODc4MDc0ODA5NDc1NjE0IiwiYXVkIjpbImtub2xpc3QiLCJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYxMDkwOTYyMywiZXhwIjoxNjEwOTk2MDIzLCJhenAiOiJwQnU1dVA0bUtUUWdCdHRUVzEzTjB3Q1Znc3g5MEtNaSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6Y2x1c3RlcnMiLCJjcmVhdGU6Y29ubmVjdGlvbnMiLCJjcmVhdGU6aGlnaGxpZ2h0cyIsImNyZWF0ZTppdGVtcyIsImNyZWF0ZTpub3RlcyIsImNyZWF0ZTpwcm9qZWN0cyIsImNyZWF0ZTpzb3VyY2VzIiwiZGVsZXRlOmNsdXN0ZXJzIiwiZGVsZXRlOmNvbm5lY3Rpb25zIiwiZGVsZXRlOmhpZ2hsaWdodHMiLCJkZWxldGU6aXRlbXMiLCJkZWxldGU6bm90ZXMiLCJkZWxldGU6cHJvamVjdHMiLCJkZWxldGU6c291cmNlcyIsInJlYWQ6Y2x1c3RlcnMiLCJyZWFkOml0ZW1zIiwicmVhZDppdGVtcy1kZXRhaWwiLCJyZWFkOnByb2plY3QtY2x1c3RlcnMiLCJyZWFkOnByb2plY3RzIiwicmVhZDpzb3VyY2VzIiwicmVhZDpzb3VyY2VzLWRldGFpbCIsInNlYXJjaDpzb3VyY2VzIiwidXBkYXRlOmNsdXN0ZXJzIiwidXBkYXRlOml0ZW1zIiwidXBkYXRlOm5vdGVzIiwidXBkYXRlOnByb2plY3RzIiwidXBkYXRlOnNvdXJjZXMiXX0.NpdceEnZpLcd7agqkg8FolEirzfbmKOnRr7jUMgHngSgmLTGlSXnSPCiy2dtGopg8itpFAGsIyS_jHsb-WNVwxlGaewu7aHaMQ0FBOWjtfiHX8mar-VQvglXpV-1CoMx_tkHrR7UFb-5CRd0n3nGWcdyOYfUG7AGiqnxIcvrCZVovuTc9ZXTsW0wv3xJT7BMIvT5QhUbUqlV-4iIP97YA8NIeAH0sNfldQ7hUvGA4kJRIXSqJJB8tVQoJwfaxgqS-ECQm6WW4Q33uShz1CaiHbS2Dx_XWXFD1L5deIZn6nKzmRaQhfJP180XVWJ2iHZrPhu6K4B4_KwLcHOuSmmEfA";
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
    if (!responseBody.success) {
        Alert.error("Something went wrong!");
    }
    return {
        status: responseStatus,
        body: responseBody
    };
}

export default makeHttpRequest;