#!/usr/bin/env node

// Script to set environment variables on Vercel using the Vercel API
// Usage: node set-env-vars.js

const https = require("https");

const PROJECT_ID = "prj_Tf6p1mXjSxpIwrntAJ8GfXBxnFf9"; // From vercel projects inspect output
const TEAM_ID = "shoebbirader4s-projects";

// Environment variables to set
const envVars = [
  {
    key: "LOVABLE_API_KEY",
    value:
      "sk_fW1LhqWEk7taMdr8lNtdPBa0OvYJuUk/IWcmEkzYJUW/FxErWQMmp5OTtG86zXqCh6RC8At7z17Qx8SZ7eXoTxR71/f+yhw4kXZORJ59w8RTWRy7apVZiiIB4Uuba/vu7+AN5riUiyd3xYqupc/7MuLMA8ICbmT15fJjhko+/yHHUIjhMAOSOsX+kGPr9qqqQJKjarIi4kDckU7dJsk739WhyiLwVJbbvNrqPODx7rs4q/0N/cqMZo8sGEUWsdk2AAATuw==",
    target: ["production", "preview", "development"],
    type: "secret",
  },
  {
    key: "GOOGLE_SHEETS_API_KEY",
    value: "lovc_b383681975b6b140943b44d86839079c",
    target: ["production", "preview", "development"],
    type: "secret",
  },
  {
    key: "AZAD_SPREADSHEET_ID",
    value: "1F1JAYGpaeCP3ShA9vqbteHL2PX7zAtTwIdSw6-Xut9w",
    target: ["production", "preview", "development"],
    type: "secret",
  },
  {
    key: "ROSHAN_SPREADSHEET_ID",
    value: "13FRAFg1WEEXBzy8KzMsI4s9TCxn2p16TXqH-vS-u4zU",
    target: ["production", "preview", "development"],
    type: "secret",
  },
];

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vercel.com",
      path: path,
      method: method,
      headers: {
        Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let body = "";

      res.on("data", (chunk) => {
        body += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(`API Error: ${res.statusCode} - ${JSON.stringify(json)}`));
          } else {
            resolve(json);
          }
        } catch {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function setEnvironmentVariables() {
  console.log("Setting environment variables on Vercel...\n");

  if (!process.env.VERCEL_TOKEN) {
    console.error("Error: VERCEL_TOKEN not found in environment");
    console.log("You can get your token from: https://vercel.com/account/tokens");
    process.exit(1);
  }

  for (const envVar of envVars) {
    try {
      console.log(`Setting ${envVar.key}...`);

      const data = {
        key: envVar.key,
        value: envVar.value,
        target: envVar.target,
        type: envVar.type,
      };

      const result = await makeRequest("POST", `/v9/projects/${PROJECT_ID}/env`, data);

      console.log(`✓ ${envVar.key} added`);
      console.log(`  ID: ${result.id}`);
      console.log(`  Targets: ${result.target.join(", ")}\n`);
    } catch (error) {
      console.error(`✗ Failed to set ${envVar.key}:`);
      console.error(`  ${error.message}\n`);
    }
  }

  console.log("Environment variables setup complete!");
  console.log("Redeploying with new environment variables...\n");
}

setEnvironmentVariables().catch(console.error);
