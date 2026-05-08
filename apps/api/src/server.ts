// src/server.ts

import { app } from "./app";

app.listen(
  { port: 3001, host: "0.0.0.0" },
  (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server running at ${address}`);
  }
);