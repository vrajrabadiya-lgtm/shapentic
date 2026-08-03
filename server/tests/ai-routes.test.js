/**
 * Unit + Property tests for AI routes
 *
 * Validates: Requirements R4.1, R4.2, R4.3, R4.4, R4.6
 *
 * Tests:
 *   - GET /api/ai/health returns { status: 'ok', timestamp: <ISO string> }
 *   - POST /api/ai/generate-3d-model (no MESHY_API_KEY) returns { fallback: true }
 *   - Property 1: AI generation routes return valid structure for any non-empty prompt
 *   - Property 2: Code generation returns valid code structure for any valid blueprint
 */

import { describe, it, expect, beforeAll, vi } from "vitest";
import fc from "fast-check";

process.env.NODE_ENV = "test";

let app;

beforeAll(async () => {
  const mod = await import("../index.js");
  app = mod.default;
});

/**
 * Helper: make a request to the app with supertest
 */
async function request(method, path, body = null) {
  const { default: supertest } = await import("supertest");
  const req = supertest(app);
  let r;
  if (method === "GET") {
    r = req.get(path);
  } else if (method === "POST") {
    r = req.post(path).send(body);
  }
  return r;
}

// ─── Unit: Health endpoint ───────────────────────────────────────────────────

describe("GET /api/ai/health", () => {
  it("should return status ok with ISO timestamp", async () => {
    const res = await request("GET", "/api/ai/health");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
    expect(res.body).toHaveProperty("timestamp");
    expect(() => new Date(res.body.timestamp)).not.toThrow();
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });
});

// ─── Unit: 3D model fallback ─────────────────────────────────────────────────

describe("POST /api/ai/generate-3d-model fallback", () => {
  it("should return fallback when MESHY_API_KEY is unset", async () => {
    // Ensure MESHY_API_KEY is not set
    const originalKey = process.env.MESHY_API_KEY;
    delete process.env.MESHY_API_KEY;

    const res = await request("POST", "/api/ai/generate-3d-model", {
      prompt: "a futuristic robot",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("fallback", true);
    expect(res.body).toHaveProperty("modelUrl", null);
    expect(res.body).toHaveProperty("previewUrl", null);
    expect(res.body).toHaveProperty("status", "fallback");

    if (originalKey) process.env.MESHY_API_KEY = originalKey;
  });
});

describe("POST /api/ai/generate-3d-model validation", () => {
  it("should return 400 when prompt is missing", async () => {
    const res = await request("POST", "/api/ai/generate-3d-model", {});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// ─── Property 1: AI generation routes return valid structure ─────────────────

describe("Property 1: AI generation routes return valid structure", () => {
  it("generate-blueprint should return blueprint and plan for any non-empty prompt", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        async (prompt) => {
          const res = await request("POST", "/api/ai/generate-blueprint", { prompt });
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("blueprint");
          expect(res.body).toHaveProperty("plan");
          expect(typeof res.body.blueprint).toBe("object");
          expect(typeof res.body.plan).toBe("object");
        }
      ),
      { numRuns: 50 }
    );
  });

  it("generate-agentic-website should return result and plan for any non-empty prompt", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
        async (prompt) => {
          const res = await request("POST", "/api/ai/generate-agentic-website", { prompt });
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("result");
          expect(res.body).toHaveProperty("plan");
          expect(typeof res.body.result).toBe("object");
        }
      ),
      { numRuns: 50 }
    );
  });
});

// ─── Property 2: Code generation returns valid code structure ────────────────

describe("Property 2: Code generation returns valid code structure", () => {
  it("generate-code should return heroJSX, sceneJSX, sampleSection for any valid blueprint", async () => {
    // Create an arbitrary blueprint generator
    const arbitraryBlueprint = fc.record({
      brand: fc.record({
        name: fc.string({ minLength: 1 }),
        industry: fc.constantFrom("SaaS", "E-Commerce", "Agency", "Gaming"),
        tagline: fc.string({ minLength: 1 }),
      }),
      navigation: fc.record({
        links: fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            path: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        cta: fc.record({
          label: fc.string({ minLength: 1 }),
          path: fc.string({ minLength: 1 }),
        }),
      }),
      hero: fc.record({
        headline: fc.string({ minLength: 1 }),
        description: fc.string({ minLength: 1 }),
        buttons: fc.array(
          fc.record({
            label: fc.string({ minLength: 1 }),
            action: fc.string({ minLength: 1 }),
          })
        ),
        badge: fc.string(),
        scene: fc.string({ minLength: 1 }),
        layout: fc.constantFrom("split", "centered"),
      }),
      scene: fc.record({
        sceneId: fc.constantFrom("FloatingBlobScene", "GlassOrbScene", "ParticleGalaxyScene"),
        camera: fc.constant("Hero Camera"),
        lighting: fc.constant("Studio"),
        interaction: fc.constant("Hover Rotation"),
        quality: fc.constant("High"),
      }),
      sections: fc.array(
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          title: fc.string({ minLength: 1 }),
          subtitle: fc.string({ minLength: 1 }),
          componentName: fc.constantFrom("FeaturesSection", "PricingSection", "FAQSection"),
          content: fc.record({
            items: fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
          }),
        }),
        { minLength: 1, maxLength: 5 }
      ),
    });

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          prompt: fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          blueprint: arbitraryBlueprint,
        }),
        async (input) => {
          const res = await request("POST", "/api/ai/generate-code", input);
          expect(res.status).toBe(200);
          expect(res.body).toHaveProperty("code");
          expect(res.body.code).toHaveProperty("heroJSX");
          expect(res.body.code).toHaveProperty("sceneJSX");
          expect(res.body.code).toHaveProperty("sampleSection");
          expect(typeof res.body.code.heroJSX).toBe("string");
          expect(typeof res.body.code.sceneJSX).toBe("string");
          expect(typeof res.body.code.sampleSection).toBe("string");
        }
      ),
      { numRuns: 30 }
    );
  });

  it("generate-code should return 400 when prompt is missing", async () => {
    const res = await request("POST", "/api/ai/generate-code", { blueprint: {} });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("generate-code should return 400 when blueprint is missing", async () => {
    const res = await request("POST", "/api/ai/generate-code", { prompt: "test" });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});
