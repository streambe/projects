import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next-auth/jwt
const mockGetToken = vi.fn();
vi.mock("next-auth/jwt", () => ({
  getToken: (...args: unknown[]) => mockGetToken(...args),
}));

// Mock next/server
const mockRedirect = vi.fn();
const mockNext = vi.fn();
vi.mock("next/server", () => ({
  NextRequest: class {
    nextUrl: URL;
    url: string;
    constructor(url: string) {
      this.url = url;
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    redirect: (...args: unknown[]) => {
      mockRedirect(...args);
      return { type: "redirect" };
    },
    next: () => {
      mockNext();
      return { type: "next" };
    },
  },
}));

describe("Middleware - route protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXTAUTH_SECRET = "test-secret";
  });

  async function runMiddleware(pathname: string, hasToken: boolean) {
    mockGetToken.mockResolvedValue(hasToken ? { userId: "user-1" } : null);
    const { NextRequest } = await import("next/server");
    const { middleware } = await import("@/middleware");
    const req = new NextRequest(`http://localhost:3000${pathname}`);
    return middleware(req as any);
  }

  it("should allow unauthenticated access to /login", async () => {
    await runMiddleware("/login", false);
    expect(mockNext).toHaveBeenCalled();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("should redirect authenticated users from /login to /surveys", async () => {
    await runMiddleware("/login", true);
    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/surveys");
  });

  it("should allow unauthenticated access to /s/slug", async () => {
    await runMiddleware("/s/my-survey", false);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should allow unauthenticated access to /api/auth/*", async () => {
    await runMiddleware("/api/auth/session", false);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should allow unauthenticated access to /api/public/*", async () => {
    await runMiddleware("/api/public/health", false);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should redirect unauthenticated users from /surveys to /login", async () => {
    await runMiddleware("/surveys", false);
    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/login");
    expect(redirectUrl.searchParams.get("callbackUrl")).toBe("/surveys");
  });

  it("should allow authenticated users to access /surveys", async () => {
    await runMiddleware("/surveys", true);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should redirect unauthenticated users from /surveys/123/edit to /login", async () => {
    await runMiddleware("/surveys/123/edit", false);
    expect(mockRedirect).toHaveBeenCalled();
  });

  it("should allow authenticated users to access /surveys/123/edit", async () => {
    await runMiddleware("/surveys/123/edit", true);
    expect(mockNext).toHaveBeenCalled();
  });
});
