import fs from "node:fs";
import net from "node:net";

const SOCKET_PATH =
  process.platform === "win32"
    ? "\\\\.\\pipe\\epson-chatbot-rag"
    : "/var/run/epson-chatbot/rag";

/**
 * Sends a message to the RAG simulator socket and waits for a response.
 * @param message The user's query
 * @returns The response from the RAG service
 */
export function queryRAG(message: string): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if socket exists (optional for named pipes on Windows, but good for Unix)
    if (process.platform !== "win32" && !fs.existsSync(SOCKET_PATH)) {
      return reject(new Error("RAG service is not running."));
    }

    const client = net.createConnection(SOCKET_PATH, () => {
      // Send the query as JSON (or raw string depending on how the simulator expects it)
      // Assuming it expects JSON
      client.write(JSON.stringify({ query: message }) + "\n");
    });

    let data = "";
    client.on("data", (chunk) => {
      data += chunk.toString();
    });

    client.on("end", () => {
      try {
        const response = JSON.parse(data);
        resolve(response.answer || response.response || data);
      } catch (e) {
        resolve(data);
      }
    });

    client.on("error", (err) => {
      reject(err);
    });
  });
}
