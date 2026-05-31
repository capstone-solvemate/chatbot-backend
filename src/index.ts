import app from "./app.js";
import { WsRouterAplikasi } from "./core/api/ws/WsRouterAplikasi.js";
import { WsServerAplikasi } from "./core/api/ws/WsServerAplikasi.js";
import { DI } from "./di/DI.js";
import { env } from "./env.js";

function tanganiShutdown() {
  DI.provideEmailWorkerClient().berhenti();
  DI.provideRagWorkerClient().berhenti();

  setTimeout(() => {
    process.exit(1);
  }, 10_000);
}

process.on("SIGTERM", () => tanganiShutdown());
process.on("SIGINT", () => tanganiShutdown());

const port = env.PORT;
const server = app.listen(port, () => {
  console.log(`Listening: http://localhost:${port}`);
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

const websocketServer = new WsServerAplikasi(new WsRouterAplikasi().getRouter());
websocketServer.jalankan(server);

DI.registerWsHandlers();
DI.provideNotifikasiSubscriber().registerSubscribers();
DI.provideDashboardSubscriber().registerSubscribers();
