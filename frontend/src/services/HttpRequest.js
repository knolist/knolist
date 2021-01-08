import {Alert} from 'rsuite';

const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDVmZjYxMTdiNTY5NmFlMDA3MTJmMGNmNyIsImF1ZCI6Imtub2xpc3QiLCJpYXQiOjE2MTAwNjk1MzYsImV4cCI6MTYxMDE1NTkzNiwiYXpwIjoicEJ1NXVQNG1LVFFnQnR0VFcxM04wd0NWZ3N4OTBLTWkiLCJzY29wZSI6IiIsInBlcm1pc3Npb25zIjpbImNyZWF0ZTpjb25uZWN0aW9ucyIsImNyZWF0ZTpoaWdobGlnaHRzIiwiY3JlYXRlOm5vdGVzIiwiY3JlYXRlOnByb2plY3RzIiwiY3JlYXRlOnNvdXJjZXMiLCJkZWxldGU6Y29ubmVjdGlvbnMiLCJkZWxldGU6aGlnaGxpZ2h0cyIsImRlbGV0ZTpub3RlcyIsImRlbGV0ZTpwcm9qZWN0cyIsImRlbGV0ZTpzb3VyY2VzIiwicmVhZDpwcm9qZWN0cyIsInJlYWQ6c291cmNlcyIsInJlYWQ6c291cmNlcy1kZXRhaWwiLCJzZWFyY2g6c291cmNlcyIsInVwZGF0ZTpub3RlcyIsInVwZGF0ZTpwcm9qZWN0cyIsInVwZGF0ZTpzb3VyY2VzIl19.GlpdSQs52Ec_pN3jax3fw4uo8LljpGqYDbELjusPTUwOMtZtWTRh4DOBSBceN2Z0pKtqpvpBxlsmDwwM7LzqTOT0Tq81I0AC2HGjfhAoAVHGFPs6wNieeJD-F9GR4BplG2cB96UksBa6FqZ07ea67FjHqRswXH6WyTy68B80rT9NUki2GHWel-X7Y9y5Ucei5TQJecAxGF9VbgM14q2PREUBhlsQDt4S0MQ1tFBAY9zBERfR-TXc362obqCnjH6Xow1BMhtBcN_rDRno3HDUOl7vb_I4Uw1VTrwoazXYLYgmlIA68lCJfCsVlECIcF7kI4eWOl8y5ldOrIShdajNIQ";
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