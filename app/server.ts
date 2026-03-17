import { createServer } from "node:http";
import { parse } from "node:url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { AgentSession } from "@acp/claude-agent";

const dev = process.env.NODE_ENV !== "production";
const port = parseInt(process.env.PORT ?? "3000", 10);

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url!, true));
  });

  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WS] Client connected");

    const session = new AgentSession({
      mock: process.env.MOCK_AGENT !== "false",
      model: process.env.CLAUDE_MODEL,
    });

    ws.on("message", async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "user_message" && typeof msg.content === "string") {
          await session.handleMessage(msg.content, (acpMsg) => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify(acpMsg));
            }
          });
        } else if (msg.type === "cancel") {
          session.cancel();
        }
      } catch (err) {
        console.error("[WS] Error handling message:", err);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "error", message: "Internal server error" }));
        }
      }
    });

    ws.on("close", () => {
      console.log("[WS] Client disconnected");
      session.cancel();
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
    console.log(`> WebSocket on ws://localhost:${port}/ws`);
    console.log(`> Mock mode: ${process.env.MOCK_AGENT !== "false" ? "ON" : "OFF"}`);
  });
});
