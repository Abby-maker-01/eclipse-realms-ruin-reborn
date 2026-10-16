const http = require("http");
const WebSocket = require("ws");
const PORT = process.env.PORT || 10000;
const server = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
    return res.end(JSON.stringify({ name: "Eclipse Realms of Ruin server", status: "ok", players: players.size }));
  }
  res.writeHead(404); res.end("Not found");
});
const wss = new WebSocket.Server({ server, maxPayload: 16 * 1024 });
const players = new Map();
function send(ws, obj) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }
function broadcast(obj, except) { const data = JSON.stringify(obj); for (const [client] of players) if (client !== except && client.readyState === WebSocket.OPEN) client.send(data); }
function snapshot() {
  const out = {};
  for (const p of players.values()) out[p.id] = { id:p.id, name:p.name, gender:p.gender, race:p.race, job:p.job, x:p.x, y:p.y, face:p.face, color:p.color };
  return out;
}
wss.on("connection", ws => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  ws.on("message", raw => {
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (!msg || typeof msg.type !== "string") return;
    if (msg.type === "join") {
      const input = msg.player || {};
      const id = "p" + Math.random().toString(36).slice(2, 10);
      const p = {
        id, name: String(input.name || "Traveler").slice(0,18),
        gender: input.gender === "Cewek" ? "Cewek" : "Cowok",
        race: String(input.race || "Human").slice(0,20),
        job: String(input.job || "Knight").slice(0,20),
        x: clamp(input.x,0,5000), y: clamp(input.y,0,500), face: 1, color:"#68c9dc"
      };
      players.set(ws, p); ws.playerId = id;
      send(ws, { type:"welcome", id });
      broadcast({ type:"system", message:p.name+" memasuki dunia Eclipse." });
      send(ws, { type:"state", players:snapshot() });
      return;
    }
    const p = players.get(ws); if (!p) return;
    if (msg.type === "move" && msg.player && typeof msg.player === "object") {
      p.x = clamp(msg.player.x, 0, 5000); p.y = clamp(msg.player.y, 0, 500);
      p.name = String(msg.player.name || p.name).slice(0,18);
      p.gender = msg.player.gender === "Cewek" ? "Cewek" : "Cowok";
      p.race = String(msg.player.race || p.race).slice(0,20);
      p.job = String(msg.player.job || p.job).slice(0,20);
      p.face = msg.player.face < 0 ? -1 : 1;
      p.color = /^#[0-9a-fA-F]{6}$/.test(msg.player.color || "") ? msg.player.color : "#68c9dc";
    } else if (msg.type === "chat") {
      const message = String(msg.message || "").replace(/[<>]/g,"").trim().slice(0,140);
      if (message) broadcast({ type:"chat", name:p.name, message, at:Date.now() });
    }
  });
  ws.on("close", () => {
    const p = players.get(ws);
    if (p) broadcast({ type:"system", message:p.name+" meninggalkan dunia." });
    players.delete(ws);
  });
  ws.on("error", () => players.delete(ws));
});
function clamp(v,min,max){const n=Number(v);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):min;}
setInterval(() => {
  for (const [ws] of players) if (ws.readyState === WebSocket.OPEN) send(ws, { type:"state", players:snapshot() });
}, 150);
const heartbeat = setInterval(() => {
  wss.clients.forEach(ws => { if (ws.isAlive === false) return ws.terminate(); ws.isAlive = false; ws.ping(); });
}, 30000);
wss.on("close", () => clearInterval(heartbeat));
server.listen(PORT, "0.0.0.0", () => console.log(`Eclipse server listening on ${PORT}`));
