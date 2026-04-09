// Test setup file
// Mock environment variables
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.DIRECT_URL = "postgresql://test:test@localhost:5432/test";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.NEXTAUTH_SECRET = "test-secret";
process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_123";
process.env.RESEND_API_KEY = "re_test_123";
process.env.EMAIL_FROM = "test@test.com";
