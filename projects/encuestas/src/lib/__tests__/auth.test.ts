import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
const mockFindUnique = vi.fn();
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

// Mock bcryptjs
const mockCompare = vi.fn();
vi.mock("bcryptjs", () => ({
  default: { compare: (...args: unknown[]) => mockCompare(...args) },
  compare: (...args: unknown[]) => mockCompare(...args),
}));

// We test the authorize function by extracting the provider config
// Since NextAuth wraps things, we test the core logic directly
describe("Auth - authorize logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Import auth options after mocks are set up
  async function getAuthorize() {
    const { authOptions } = await import("@/lib/auth");
    const credentialsProvider = authOptions.providers[0];
    // Access the authorize function from the provider
    // next-auth CredentialsProvider stores it in options
    const provider = credentialsProvider as unknown as {
      options: { authorize: (credentials: Record<string, string>) => Promise<unknown> };
    };
    return provider.options.authorize;
  }

  it("should reject when email is missing", async () => {
    const authorize = await getAuthorize();
    await expect(
      authorize({ email: "", password: "pass123" })
    ).rejects.toThrow("Email y contraseña son requeridos");
  });

  it("should reject when password is missing", async () => {
    const authorize = await getAuthorize();
    await expect(
      authorize({ email: "test@test.com", password: "" })
    ).rejects.toThrow("Email y contraseña son requeridos");
  });

  it("should reject when user not found", async () => {
    mockFindUnique.mockResolvedValue(null);
    const authorize = await getAuthorize();
    await expect(
      authorize({ email: "unknown@test.com", password: "pass123" })
    ).rejects.toThrow("Credenciales inválidas");
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "unknown@test.com" },
    });
  });

  it("should reject when password is wrong", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      password: "$2a$10$hashedpassword",
      name: "Test User",
    });
    mockCompare.mockResolvedValue(false);
    const authorize = await getAuthorize();
    await expect(
      authorize({ email: "test@test.com", password: "wrongpass" })
    ).rejects.toThrow("Credenciales inválidas");
  });

  it("should return user on valid credentials", async () => {
    mockFindUnique.mockResolvedValue({
      id: "user-1",
      email: "test@test.com",
      password: "$2a$10$hashedpassword",
      name: "Test User",
    });
    mockCompare.mockResolvedValue(true);
    const authorize = await getAuthorize();
    const result = await authorize({
      email: "test@test.com",
      password: "correctpass",
    });
    expect(result).toEqual({
      id: "user-1",
      email: "test@test.com",
      name: "Test User",
    });
  });
});

describe("Auth - JWT callback", () => {
  it("should add userId to token when user is present", async () => {
    const { authOptions } = await import("@/lib/auth");
    const jwtCallback = authOptions.callbacks!.jwt!;
    const result = await (jwtCallback as Function)({
      token: { sub: "123" },
      user: { id: "user-1" },
      account: null,
      trigger: "signIn",
    });
    expect(result.userId).toBe("user-1");
  });

  it("should preserve existing token when no user", async () => {
    const { authOptions } = await import("@/lib/auth");
    const jwtCallback = authOptions.callbacks!.jwt!;
    const result = await (jwtCallback as Function)({
      token: { sub: "123", userId: "user-1" },
      trigger: "update",
    });
    expect(result.userId).toBe("user-1");
  });
});

describe("Auth - Session callback", () => {
  it("should expose userId in session", async () => {
    const { authOptions } = await import("@/lib/auth");
    const sessionCallback = authOptions.callbacks!.session!;
    const result = await (sessionCallback as Function)({
      session: { user: { name: "Test", email: "test@test.com" }, expires: "" },
      token: { userId: "user-1", sub: "123" },
    });
    expect(result.user.id).toBe("user-1");
  });
});

describe("Auth - configuration", () => {
  it("should use jwt session strategy", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("should configure custom sign-in page", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.pages?.signIn).toBe("/login");
  });

  it("should have exactly one provider (Credentials)", async () => {
    const { authOptions } = await import("@/lib/auth");
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0].name).toBe("Credentials");
  });
});
