import { Hono } from "hono";
import { cors } from "hono/cors";
import "./env";
import { auth } from "./auth";
import { sampleRouter } from "./routes/sample";
import { aiChatRouter } from "./routes/ai-chat";
import { partnerRouter } from "./routes/partner";
import { moodRouter } from "./routes/mood";
import { communityRouter } from "./routes/community";
import { userRouter } from "./routes/user";
import { journalRouter } from "./routes/journal";
import { pushTokenRouter } from "./routes/push-token";
import { logger } from "hono/logger";

const app = new Hono<{
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}>();

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/mylunarphase\.com$/,
  /^https:\/\/[a-z0-9-]+\.mylunarphase\.com$/,
  /^https:\/\/[a-z0-9-]+\.up\.railway\.app$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Auth middleware - populates user/session for non-auth routes
app.use("*", async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) {
    c.set("user", null);
    c.set("session", null);
    await next();
    return;
  }
  c.set("user", session.user);
  c.set("session", session.session);
  await next();
});

// Health check endpoint (version tag to verify deploys)
app.get("/health", (c) => c.json({ status: "ok", v: 5 }));

// Protected route example
app.get("/api/me", (c) => {
  const user = c.get("user");
  if (!user) return c.body(null, 401);
  return c.json({ user });
});

// Routes
app.route("/api/sample", sampleRouter);
app.route("/api/ai-chat", aiChatRouter);
app.route("/api/partner", partnerRouter);
app.route("/api/mood", moodRouter);
app.route("/api/community", communityRouter);
app.route("/api/user", userRouter);
app.route("/api/journal", journalRouter);
app.route("/api/push-token", pushTokenRouter);

const port = Number(process.env.PORT) || 3000;

console.log(`Server starting on port ${port}...`);

// Auth routes bypass Hono entirely so middleware can't consume the request body.
// Better Auth handles its own CORS via trustedOrigins config.
const honoFetch = app.fetch;
export default {
  port,
  fetch: async (req: Request, server: any) => {
    const url = new URL(req.url);
    // Diagnostic: test body parsing directly
    if (url.pathname === "/api/auth/test-body") {
      try {
        const body = await req.json();
        return new Response(JSON.stringify({ received: body }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e: any) {
        return new Response(JSON.stringify({ parseError: e?.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    // Diagnostic: sign-up via auth.api directly (bypasses auth.handler)
    if (url.pathname === "/api/auth/test-signup" && req.method === "POST") {
      try {
        const body = await req.json();
        console.log("test-signup body:", JSON.stringify(body));
        const result = await auth.api.signUpEmail({ body });
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e: any) {
        console.error("test-signup error:", e);
        return new Response(JSON.stringify({ error: e?.message, stack: e?.stack }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    if (url.pathname.startsWith("/api/auth/")) {
      try {
        const res = await auth.handler(req);
        if (res.status >= 400) {
          const body = await res.clone().text();
          console.error(`Auth ${req.method} ${url.pathname} → ${res.status}: ${body}`);
        }
        return res;
      } catch (e: any) {
        console.error("Auth handler error:", e);
        return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
    return honoFetch(req, server);
  },
};
