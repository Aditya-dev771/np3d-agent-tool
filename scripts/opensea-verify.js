require("dotenv").config();
const { runToolSdk } = require("./run-tool-sdk");

const metadataUrl =
  process.argv[2] ||
  process.env.METADATA_URL ||
  "https://np3d-agent-tool-1.onrender.com/.well-known/ai-tool/normie-punk-3d-identity.json";

process.exit(runToolSdk(["verify", metadataUrl]));
