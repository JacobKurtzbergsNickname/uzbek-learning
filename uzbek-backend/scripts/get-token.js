/* eslint-disable @typescript-eslint/no-unsafe-assignment */
async function getToken() {
  try {
    const response = await fetch(
      "https://dev-ap73i48yg5rp47z8.us.auth0.com/oauth/token",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client_id: "6ZU5MbGyd4qNjKlHzQmrZjDAxfPcol5Y",
          client_secret:
            "xLt1wfxCwJBAJHUTcMcVRMep7xhQ6tj7VaiOpT1qoYKA_lVhVp2F4G4qRVa0kN7v",
          audience: "tamerlang.dev",
          grant_type: "client_credentials",
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error fetching token:", error);
  }
}

await getToken();
