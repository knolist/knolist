import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA4Mzc2MDE3NjA4ODkzOTQ0MDU0IiwiYXVkIjoia25vbGlzdCIsImlhdCI6MTYxMTA3NzgyMywiZXhwIjoxNjExMTY0MjIzLCJhenAiOiJwQnU1dVA0bUtUUWdCdHRUVzEzTjB3Q1Znc3g5MEtNaSIsInNjb3BlIjoiIiwicGVybWlzc2lvbnMiOlsiY3JlYXRlOmNsdXN0ZXJzIiwiY3JlYXRlOmNvbm5lY3Rpb25zIiwiY3JlYXRlOmhpZ2hsaWdodHMiLCJjcmVhdGU6aXRlbXMiLCJjcmVhdGU6bm90ZXMiLCJjcmVhdGU6cHJvamVjdHMiLCJjcmVhdGU6c291cmNlcyIsImRlbGV0ZTpjbHVzdGVycyIsImRlbGV0ZTpjb25uZWN0aW9ucyIsImRlbGV0ZTpoaWdobGlnaHRzIiwiZGVsZXRlOml0ZW1zIiwiZGVsZXRlOm5vdGVzIiwiZGVsZXRlOnByb2plY3RzIiwiZGVsZXRlOnNvdXJjZXMiLCJyZWFkOmNsdXN0ZXJzIiwicmVhZDppdGVtcyIsInJlYWQ6aXRlbXMtZGV0YWlsIiwicmVhZDpwcm9qZWN0LWNsdXN0ZXJzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpjbHVzdGVycyIsInVwZGF0ZTppdGVtcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.Wc6CMJrTDsU6BYMerl6AaWw9tHpyKJJNEW00sn9tztThRHcAsOs0p_SV8FLgWooNddwx3tO-ewtN7hgzrtI7drXdTO-Ku6qcnjulWw5UupEWeHWgTKtraDoxw7Cmrev5zQ9BAZiCanFLU3clg3GutczTDNHr9xhyQmAZ2W-vbuU-bZjkUs_ABWo9OdSayREkeNdRSDANu8c7CSOH9htFLD83VdHsZfBokJJDGHfTpmegl0XaMKZJVDsZkNRqnRWcHCDCY5Il36dHIEMawkmQ-9izyBG-J0DBfmKvqMGB_NjKqsv67Ea_6nGyhhkg-jJ8NZ1ic1ITrFgs-vRajeNwRw";
//const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmNDczN2VjOWM1MTA2MDA2ZGUxNjFiYyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MDk5NTI2ODgsImV4cCI6MTYxMDAzOTA4OCwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.HVO7xpxo-WHyf0vx-5jlrQxskWlIsnxOCoi8Gs651_jdqVyCpMwQ98Dakxl234InE7tTOXn3-EoyKAzZ02xa6qsEkWjefbE9XizEK-KgQyNGZIptrZPz6m_sbHdUCuhUwNX2viWfnD7co6PzrgumVslgk0CeUnbod6u5MYvF04Lw21SaWSqrTpZixwApAW8ZDrlVlnuZuBQtie8aLkD-8mZuhaqRGNhZbBziyhruAkLSZMYTXjG7klxZTMR_hTOK0IO1vMo8HQg7Kf4qtwUU6h99NyW7rgLLAcQ4iQR5jGZdVsWWuVoIUVLVjaF63x9_3WdOgHWqyvG9xaUkQysi1w";
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
    //const url = baseUrl + endpoint;
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