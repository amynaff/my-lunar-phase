#!/usr/bin/env node
/**
 * Generates VAPID keys for web push notifications.
 *
 * Usage:
 *   node scripts/generate-vapid-keys.mjs
 *
 * Add the output values to your Netlify/Vercel environment variables:
 *   VAPID_PUBLIC_KEY=<publicKey>
 *   VAPID_PRIVATE_KEY=<privateKey>
 *   VAPID_EMAIL=support@mylunarphase.com
 */

import webpush from "web-push";

const keys = webpush.generateVAPIDKeys();

console.log("\n✅ VAPID keys generated successfully!\n");
console.log("Add these to your environment variables (Netlify or Vercel):\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`VAPID_EMAIL=support@mylunarphase.com`);
console.log("\n⚠️  Keep VAPID_PRIVATE_KEY secret — never commit it to git.\n");
console.log(
  "The VAPID_PUBLIC_KEY also needs to go into NEXT_PUBLIC_VAPID_PUBLIC_KEY\n" +
    "so the browser can subscribe to push notifications:\n"
);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${keys.publicKey}`);
