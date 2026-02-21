/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
import axios from "axios";
import { getToken } from "./get-token.js";

// Fetch the access token from Auth0
const auth0Response = await getToken();
console.log("Auth0 Response:", auth0Response);
if (!auth0Response || !auth0Response.access_token) {
  console.error("Failed to retrieve access token.");
  process.exit(1);
}

const options = {
  method: "GET",
  url: "http://localhost:3421/words",
  headers: {
    authorization: `Bearer ${auth0Response.access_token}`,
  },
};

axios(options)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
