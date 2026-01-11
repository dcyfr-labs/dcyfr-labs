#!/usr/bin/env node
import { createServer as createHttpsServer } from "https";
import next from "next";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

// Check if SSL certificates exist
const certPath = join(__dirname, "certs", "localhost+2.pem");
const keyPath = join(__dirname, "certs", "localhost+2-key.pem");
const useHttps = existsSync(certPath) && existsSync(keyPath);

const protocol = useHttps ? "https" : "http";

const app = next({ dev, hostname, port, turbopack: dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const requestHandler = async (req, res) => {
    try {
      // Use WHATWG URL API instead of deprecated url.parse()
      const parsedUrl = new URL(req.url, `${protocol}://${req.headers.host}`);
      await handle(req, res, parsedUrl);
    } catch (err) {
      // Sanitize URL to prevent log injection (remove newlines)
      const sanitizedUrl = req.url?.replace(/[\r\n]/g, "") || "unknown";
      console.error("Error occurred handling", sanitizedUrl, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  };

  let server;

  try {
    if (useHttps) {
      const httpsOptions = {
        key: readFileSync(keyPath),
        cert: readFileSync(certPath),
      };
      server = createHttpsServer(httpsOptions, requestHandler);
      console.log(`🔒 Using HTTPS with local certificates`);
    } else {
      console.warn(`⚠️  HTTPS certificates not found at ${certPath}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`Failed to load HTTPS certificates: ${err.message}`);
    process.exit(1);
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on ${protocol}://${hostname}:${port}`);
  });
});
