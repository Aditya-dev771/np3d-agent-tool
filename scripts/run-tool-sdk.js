const { spawnSync } = require("node:child_process");
const path = require("node:path");

function major(version) {
  return Number(version.replace(/^v/, "").split(".")[0]);
}

function runToolSdk(args) {
  const cliPath = path.join(
    process.cwd(),
    "node_modules",
    "@opensea",
    "tool-sdk",
    "dist",
    "cli.js"
  );

  const commandArgs =
    major(process.version) >= 18
      ? [cliPath, ...args]
      : ["-p", "node@20", "node", cliPath, ...args];

  const command = major(process.version) >= 18 ? process.execPath : "npx";

  const result = spawnSync(command, commandArgs, {
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env
  });

  return result.status ?? 1;
}

module.exports = { runToolSdk };
