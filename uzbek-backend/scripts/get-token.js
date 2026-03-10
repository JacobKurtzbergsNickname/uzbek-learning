/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import axios from "axios";
import { config } from "dotenv";
config();

export async function getToken() {
  try {
    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        audience: process.env.AUDIENCE,
        grant_type: process.env.GRANT_TYPE,
      },
    );
    return response.data ?? null;
  } catch (error) {
    console.error("Error fetching token:", error);
    return null;
  }
}
