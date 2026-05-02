import app from "./app.js";
import { DI } from "./di/DI.js";
import { env } from "./env.js";

function tanganiShutdown() {
  // Minta worker menyelesaikan antrian lalu berhenti
  DI.provideEmailWorkerClient().berhenti();

  // Beri waktu maks 10 detik untuk worker selesai
  setTimeout(() => {
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => tanganiShutdown());
process.on("SIGINT", () => tanganiShutdown());

const port = env.PORT;
const server = app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    console.error(`Port ${env.PORT} is already in use. Please choose another port or stop the process using it.`);
  }
  else {
    console.error("Failed to start server:", err);
  }
  process.exit(1);
});
