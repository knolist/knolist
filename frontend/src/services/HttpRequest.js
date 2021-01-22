import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmZjYxMTdiNTY5NmFlMDA3MTJmMGNmNyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MTEyODM3NzYsImV4cCI6MTYxMTM3MDE3NiwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjbHVzdGVycyIsImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOml0ZW1zIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y2x1c3RlcnMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTppdGVtcyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpjbHVzdGVycyIsInJlYWQ6aXRlbXMiLCJyZWFkOml0ZW1zLWRldGFpbCIsInJlYWQ6cHJvamVjdC1jbHVzdGVycyIsInJlYWQ6cHJvamVjdHMiLCJyZWFkOnNvdXJjZXMiLCJyZWFkOnNvdXJjZXMtZGV0YWlsIiwic2VhcmNoOnNvdXJjZXMiLCJ1cGRhdGU6Y2x1c3RlcnMiLCJ1cGRhdGU6aXRlbXMiLCJ1cGRhdGU6bm90ZXMiLCJ1cGRhdGU6cHJvamVjdHMiLCJ1cGRhdGU6c291cmNlcyJdfQ.PU-dcX7KikyTizgyLDG48LiqM4XBeC_l4O3k0H3b-Jv5ux3V5NnExJkWTISrPs9KNtJSd6glU9sTo-0OmeV3heTbfL676j__u6ZW0scws0TFyf_KPMHFIO1y16IQ7ohO06euuLU-IZaY6KVziO7mEwlr4bENGQdF5NNTxhjTJuKvFNvtLox1dKR44Pr1NSUcsvgujJAqOaSvpn1Oo2JBSsKZTdMRvqWWP2SdBK19CE2HfRwSm2x8JYs-Q4_kLBE4jJGUINQyUmvNZwbufWucoNj5Hztyp3h9uJ6GW3GAdB1qhaT0cyWEyGGWPjgErpuAsIfv_FIH10uA0107r2HJ_g"
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