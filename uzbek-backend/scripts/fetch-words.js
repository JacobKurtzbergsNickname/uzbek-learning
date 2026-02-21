/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-var-requires */
const axios = require("axios");

const options = {
  method: "GET",
  url: "http://localhost:3421/words",
  headers: {
    authorization:
      "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZXOW83d3h6QUFIbHJtdDRBTHFFSSJ9.eyJpc3MiOiJodHRwczovL2Rldi1hcDczaTQ4eWc1cnA0N3o4LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiI2WlU1TWJHeWQ0cU5qS2xIelFtclpqREF4ZlBjb2w1WUBjbGllbnRzIiwiYXVkIjoidGFtZXJsYW5nLmRldiIsImlhdCI6MTc3MTUyNDM4NSwiZXhwIjoxNzcxNjEwNzg1LCJzY29wZSI6ImFkbWluIiwiZ3R5IjoiY2xpZW50LWNyZWRlbnRpYWxzIiwiYXpwIjoiNlpVNU1iR3lkNHFOaktsSHpRbXJaakRBeGZQY29sNVkiLCJwZXJtaXNzaW9ucyI6WyJhZG1pbiJdfQ.lMpn2DB9hFdWmZQdeywIZ5gIbTs693Ot1IAI700zu9xFLdfl8fNtTRaEJU8HTAfnRMsYmaJhhkGo1UIxw9mnw4NW6xZ7PD7eMGRPtVEaIdpBi7EfbkRkT4RI7XA_AHGviwKr5pY1BPxz6Kg2dSaLUxurDseukzHFQ3tDtOu1J3rhixf8nQ7wWFsXkAXNs8UO0Poh8Qp5Nxr-AfEheCqQSEmYsc5OnitXJCGgACkkmqzsRrX0YaVyyc_WmAlCSer-lJHQk2LMbpBI65O6FIBjFoJ1Uw9eio7xOkkxhliWkcyw9Xhqw1MLRT7KWhoL3BaKHBxYPwBjUnE1_pBo4g4DgQ",
  },
};

axios(options)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error);
  });
