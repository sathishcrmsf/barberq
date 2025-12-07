/**
 * Environment variable validation
 * 
 * Validates that required environment variables are set
 * Call this on app startup to catch configuration issues early
 */

export function validateEnv() {
  const required = ["DATABASE_URL"];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
      console.warn("⚠️  DATABASE_URL format might be incorrect. Expected postgresql:// or postgres://");
    }
    
    // Check if using connection pooler (recommended for serverless)
    if (dbUrl.includes("pooler.supabase.com")) {
      console.log("✅ Using Supabase connection pooler (recommended)");
    } else if (dbUrl.includes("db.supabase.co")) {
      console.warn("⚠️  Using direct Supabase connection. Consider using connection pooler for production.");
    }
  }
}

/**
 * Validate environment variables and return status
 * Safe to call without throwing (returns validation result)
 */
export function validateEnvSafe(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const required = ["DATABASE_URL"];
  const missing: string[] = [];
  const warnings: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    if (!dbUrl.startsWith("postgresql://") && !dbUrl.startsWith("postgres://")) {
      warnings.push("DATABASE_URL format might be incorrect");
    }
    
    if (dbUrl.includes("db.supabase.co") && !dbUrl.includes("pooler")) {
      warnings.push("Using direct connection. Consider pooler for production.");
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

