import http from "http";
import handler from "./api/chat.js";

const server = http.createServer((req, res) => {
  let raw = "";
  req.on("data", chunk => { raw += chunk; });
  req.on("end", () => {
    req.body = raw;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (obj) => {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(obj));
    };
    res.send = (txt) => {
      res.setHeader("Content-Type", "application/json");
      res.end(txt);
    };
    handler(req, res);
  });
});

server.listen(process.env.PORT || 3000);
