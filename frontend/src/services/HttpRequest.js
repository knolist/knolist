// import {Alert} from 'rsuite';
import createAuth0Client from '@auth0/auth0-spa-js';

// The Auth0 client for obtaining JWT's
let auth0 = null;

<<<<<<< HEAD
const jwt = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkZYNkFEd1BWdUJpQ3g0UjhKMWxDTCJ9.eyJpc3MiOiJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTE2MzIzODc4MDc0ODA5NDc1NjE0IiwiYXVkIjpbImtub2xpc3QiLCJodHRwczovL2tub2xpc3QudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTYxMTE3MDczMCwiZXhwIjoxNjExMjU3MTMwLCJhenAiOiJwQnU1dVA0bUtUUWdCdHRUVzEzTjB3Q1Znc3g5MEtNaSIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJwZXJtaXNzaW9ucyI6WyJjcmVhdGU6Y2x1c3RlcnMiLCJjcmVhdGU6Y29ubmVjdGlvbnMiLCJjcmVhdGU6aGlnaGxpZ2h0cyIsImNyZWF0ZTppdGVtcyIsImNyZWF0ZTpub3RlcyIsImNyZWF0ZTpwcm9qZWN0cyIsImNyZWF0ZTpzb3VyY2VzIiwiZGVsZXRlOmNsdXN0ZXJzIiwiZGVsZXRlOmNvbm5lY3Rpb25zIiwiZGVsZXRlOmhpZ2hsaWdodHMiLCJkZWxldGU6aXRlbXMiLCJkZWxldGU6bm90ZXMiLCJkZWxldGU6cHJvamVjdHMiLCJkZWxldGU6c291cmNlcyIsInJlYWQ6Y2x1c3RlcnMiLCJyZWFkOml0ZW1zIiwicmVhZDppdGVtcy1kZXRhaWwiLCJyZWFkOnByb2plY3QtY2x1c3RlcnMiLCJyZWFkOnByb2plY3RzIiwicmVhZDpzb3VyY2VzIiwicmVhZDpzb3VyY2VzLWRldGFpbCIsInNlYXJjaDpzb3VyY2VzIiwidXBkYXRlOmNsdXN0ZXJzIiwidXBkYXRlOml0ZW1zIiwidXBkYXRlOm5vdGVzIiwidXBkYXRlOnByb2plY3RzIiwidXBkYXRlOnNvdXJjZXMiXX0.b-d-1nMsCKyym8dTh76s3yeDztdygAFlLZ_E7JS7ov4GRPA-YUaoHxB8GSkyDOTG_BSeG8Fvlc1bJSTDW3ILoNv1Nbf1Q59-hJG2Urk7r3iHpifS9FkPqi9Z1f3IrBUD_o6uTTF7U-qOpCiKrojcr0Wr7WavAhE3SMAQ6tDX4iozfzYErwUsb2r1IMioYSxfG8QF0LO2S_061-vEczvT0nf0AH-v_rA8gveV5PF_dlXtdggRozy8ay6sdHSzPFUjPrGg5m1Xv3qJ6aoPVVPrNSM7bP-JchSdaEFrcyjSU5VRRylPVmWwUO2Yfd5h2QIZA4z_hru0TT02FUW9RUN6FA";
=======
>>>>>>> 7fccfaaff74932dc53a2613c3b758986a535fca9
// const baseUrl = "https://knolist-api.herokuapp.com";
const baseUrl = "http://localhost:5000";

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