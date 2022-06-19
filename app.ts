import { Drash } from "./deps.ts";
import { TengineService } from "./services/tengine/mod.ts";
import { ErrorHandler } from "./error_handler.ts";

import { HomeResource } from "./resources/home_resource.ts";

const tengine = new TengineService({
  views_path: "./views",
});

// Create your server
const server = new Drash.Server({
  hostname: Deno.env.get("DRASH_HOSTNAME") ?? "localhost",
  port: 1447,
  protocol: "http",
  resources: [
    HomeResource,
  ],
  services: [
    tengine,
  ],
  error_handler: ErrorHandler,
});

// Get tengine to compile all templates so they are ready during runtime
if (Deno.env.get("DRASH_COMPILE_TEMPLATES")) {
  console.log("Compile flag is set.");
  // Paths are relative to `TengineService.views_path` above
  tengine.compileTemplates([
    "/index.html",
  ]);
} else {
  console.log("Compile flag is not set.");
}

// Run your server
server.run();

console.log(`Server running at ${server.address}`);
