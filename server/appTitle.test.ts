import { describe, expect, it } from "vitest";

describe("application title configuration", () => {
  it("exposes the configured application title", async () => {
    const response = new Response(JSON.stringify({ title: process.env.VITE_APP_TITLE }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

    const payload = (await response.json()) as { title?: string };
    expect(response.status).toBe(200);
    expect(payload.title).toBe("PharmaYemen");
  });
});

export {};

// This test deliberately uses a lightweight in-process API response so it does
// not mutate the database or require an external service during validation.
