import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmZjYxMTdiNTY5NmFlMDA3MTJmMGNmNyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MTE1NDE1NjEsImV4cCI6MTYxMTYyNzk2MSwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjbHVzdGVycyIsImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOml0ZW1zIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y2x1c3RlcnMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTppdGVtcyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpjbHVzdGVycyIsInJlYWQ6aXRlbXMiLCJyZWFkOml0ZW1zLWRldGFpbCIsInJlYWQ6cHJvamVjdC1jbHVzdGVycyIsInJlYWQ6cHJvamVjdHMiLCJyZWFkOnNvdXJjZXMiLCJyZWFkOnNvdXJjZXMtZGV0YWlsIiwic2VhcmNoOnNvdXJjZXMiLCJ1cGRhdGU6Y2x1c3RlcnMiLCJ1cGRhdGU6aXRlbXMiLCJ1cGRhdGU6bm90ZXMiLCJ1cGRhdGU6cHJvamVjdHMiLCJ1cGRhdGU6c291cmNlcyJdfQ.WvgE-e7Khs4Ow5061gXqKiH1J10gLr0DfLrujs6jbdbSri8QjBvFI3V6-MoNjWk2Ve5HZDBrtUbz9BooCi4CG7036O7x63jD3D-EYlheJsKtDdP3A_FlUEdTbpyfKoH2sCy0ZeDm4W0CvkNrliO17IzUB5Foc6tKgiJqpmTLgvQmBo40P7_pRnP7a-F-k3CtAjyV7m9X-TP4mgXagwRhyj8nuRj0-XtyRClc-GsbqiV2n7KsWjibae0wDLGy7WZqq4OqPM48iWtqxSBl9oHkKnMx_gJS8LdEv-NYCTA3LNx-O4r9JKuWuPzDFXf7qkM2r2X40bbJ5c8nS3vd3TETPA"
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