// Runs before each test file requires the app, so JWT signing/verifying
// always has a secret even when no .env file is present (e.g. in CI).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
