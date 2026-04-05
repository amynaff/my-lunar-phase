#!/usr/bin/env node
/**
 * Generate Apple Sign In client secret JWT
 *
 * Usage:
 *   node scripts/generate-apple-secret.mjs \
 *     --key-file /path/to/AuthKey_XXXXXXXXXX.p8 \
 *     --team-id  <10-char Apple Team ID> \
 *     --key-id   <10-char Key ID from filename> \
 *     --client-id <Apple Services ID e.g. com.mylunarphase.siwa>
 *
 * The generated JWT is valid for 6 months (Apple's maximum).
 * Set the output as APPLE_CLIENT_SECRET in your .env / Vercel env vars.
 */

import { readFileSync } from "fs";
import { SignJWT, importPKCS8 } from "../node_modules/jose/dist/webapi/index.js";

const args = process.argv.slice(2);
function getArg(name) {
  const idx = args.indexOf(name);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

const keyFile = getArg("--key-file");
const teamId = getArg("--team-id");
const keyId = getArg("--key-id");
const clientId = getArg("--client-id");

if (!keyFile || !teamId || !keyId || !clientId) {
  console.error(`
Usage:
  node scripts/generate-apple-secret.mjs \\
    --key-file  /path/to/AuthKey_XXXXXXXXXX.p8 \\
    --team-id   <10-char Apple Team ID> \\
    --key-id    <10-char Key ID> \\
    --client-id <Apple Services ID>

Example:
  node scripts/generate-apple-secret.mjs \\
    --key-file  ~/Documents/AuthKey_53THZT6U4L,mlp_appledev.p8 \\
    --team-id   ABCDE12345 \\
    --key-id    53THZT6U4L \\
    --client-id com.mylunarphase.siwa
`);
  process.exit(1);
}

const privateKeyPem = readFileSync(keyFile, "utf8");
const now = Math.floor(Date.now() / 1000);
const sixMonths = 60 * 60 * 24 * 180; // 180 days — Apple's max

const privateKey = await importPKCS8(privateKeyPem, "ES256");

const jwt = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setIssuedAt(now)
  .setExpirationTime(now + sixMonths)
  .setAudience("https://appleid.apple.com")
  .setSubject(clientId)
  .sign(privateKey);

console.log("\n✅  Apple client secret JWT (valid ~6 months):\n");
console.log(jwt);
console.log(`\nExpires: ${new Date((now + sixMonths) * 1000).toISOString()}`);
console.log("\nAdd to Vercel environment variables:");
console.log(`APPLE_CLIENT_ID="${clientId}"`);
console.log(`APPLE_CLIENT_SECRET="${jwt}"\n`);
