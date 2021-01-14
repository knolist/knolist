import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE2MzIzODc4MDc0ODA5NDc1NjE0IiwiYXVkIjpbImtub2xpc3QiLCJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYxMDY0Njc5MywiZXhwIjoxNjEwNzMzMTkzLCJhenAiOiJwQnU1dVA0bUtUUWdCdHRUVzEzTjB3Q1Znc3g5MEtNaSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6Y29ubmVjdGlvbnMiLCJjcmVhdGU6aGlnaGxpZ2h0cyIsImNyZWF0ZTpub3RlcyIsImNyZWF0ZTpwcm9qZWN0cyIsImNyZWF0ZTpzb3VyY2VzIiwiZGVsZXRlOmNvbm5lY3Rpb25zIiwiZGVsZXRlOmhpZ2hsaWdodHMiLCJkZWxldGU6bm90ZXMiLCJkZWxldGU6cHJvamVjdHMiLCJkZWxldGU6c291cmNlcyIsInJlYWQ6cHJvamVjdHMiLCJyZWFkOnNvdXJjZXMiLCJyZWFkOnNvdXJjZXMtZGV0YWlsIiwic2VhcmNoOnNvdXJjZXMiLCJ1cGRhdGU6bm90ZXMiLCJ1cGRhdGU6cHJvamVjdHMiLCJ1cGRhdGU6c291cmNlcyJdfQ.DwYQ7PHruJRq3KydpDl7FArv04T-YVYp8YwTjFLYYLurOiMk0WzjSrsrv38xygMeeOo2mzcNW8Py9LOHajAjzJpemh8QbTa-a0k_-T666pkuDKdTyeppf3K9_DsXZTxEwNAtjW3WbomqPmrKH9QpKvNdS0K7pa2MMn7hW0fnYIj3aS9CMwQUdWhj4B6tfBolzrluDvIzc0C8VIhA2kfWYjYDCOQezmf0tq0mcXNi5Vl8AMb7W6YynXKabWf0fiwzGPef09mHtBAiGGAcYuHprdOdXj-G5B_1w8PsN4MqEaGH3KthlN0-7mzDhKvzyevVttKRwd1dK4EXOr1mqkQsVQ";
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