/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import LoginPage from "../page"; // adjust path to match your actual file location

// Mocks

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const map: Record<string, string> = {
      login: "Login",
      email: "Email",
      password: "Password",
      loggingIn: "Logging in...",
      or: "OR",
      lineLogin: "Line Login",
      lineAsJobSeeker: "Continue with LINE as Job Seeker",
      lineAsCompany: "Continue with LINE as Company",
      lineHint: "LINE hint text",
      noAccount: "Don't have an account?",
      goBack: "Go back",
      invalidCredentials: "Invalid email or password",
      lineError: "LINE login failed",
    };
    return map[key] ?? key;
  },
}));

const loginMock = jest.fn();
const getProfileMock = jest.fn();
const lineLoginUrlMock = jest.fn(
  (role: string) => `/api/auth/line?role=${role}`,
);

jest.mock("@/lib/auth/api", () => ({
  login: (...args: unknown[]) => loginMock(...args),
  getProfile: (...args: unknown[]) => getProfileMock(...args),
  lineLoginUrl: (args: string) => lineLoginUrlMock(args),
}));

const saveTokenMock = jest.fn();
const getTokenMock = jest.fn();
const clearTokenMock = jest.fn();

jest.mock("@/lib/api", () => ({
  saveToken: (...args: unknown[]) => saveTokenMock(...args),
  getToken: (...args: unknown[]) => getTokenMock(...args),
  clearToken: (...args: unknown[]) => clearTokenMock(...args),
}));

// Helpers
function setWindowLocation(url: string) {
  const parsed = new URL(url);
  window.history.pushState(
    {},
    "",
    parsed.pathname + parsed.search + parsed.hash,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  getTokenMock.mockReturnValue(null);
  setWindowLocation("http://localhost/login");
});

afterEach(() => {
  window.history.pushState({}, "", "/");
});

// Tests

describe("LoginPage", () => {
  it("renders the login form with email, password fields and submit button", async () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with LINE as Job Seeker" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Continue with LINE as Company" }),
    ).toBeInTheDocument();
  });

  it("shows a LINE error message when redirected back with ?error=line", async () => {
    setWindowLocation("http://localhost/login?error=line");

    render(<LoginPage />);

    expect(await screen.findByText("LINE login failed")).toBeInTheDocument();
  });

  it("does not redirect on mount when there is no existing token", async () => {
    getTokenMock.mockReturnValue(null);

    render(<LoginPage />);

    expect(getProfileMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("redirects an already-authenticated ADMIN to the admin dashboard on mount", async () => {
    getTokenMock.mockReturnValue("existing-token");
    getProfileMock.mockResolvedValueOnce({ role: "ADMIN" });

    render(<LoginPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard/admin");
    });
  });

  it("clears the token if the existing session check fails", async () => {
    getTokenMock.mockReturnValue("stale-token");
    getProfileMock.mockRejectedValueOnce(new Error("unauthorized"));

    render(<LoginPage />);

    await waitFor(() => {
      expect(clearTokenMock).toHaveBeenCalled();
    });
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("logs in successfully and redirects a JOB_SEEKER to their dashboard", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({ access_token: "abc123" });
    getProfileMock.mockResolvedValueOnce({ role: "JOB_SEEKER" });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "seeker@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(loginMock).toHaveBeenCalledWith("seeker@example.com", "password123");
    expect(saveTokenMock).toHaveBeenCalledWith("abc123");
    expect(pushMock).toHaveBeenCalledWith("/dashboard/job-seeker");
  });

  it("redirects a COMPANY user to the company dashboard", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({ access_token: "token-co" });
    getProfileMock.mockResolvedValueOnce({ role: "COMPANY" });

    render(<LoginPage />);

    await user.type(
      screen.getByPlaceholderText("Email"),
      "company@example.com",
    );
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(pushMock).toHaveBeenCalledWith("/dashboard/company");
  });

  it("redirects to /home for an unrecognized role", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValueOnce({ access_token: "token-x" });
    getProfileMock.mockResolvedValueOnce({ role: "UNKNOWN" });

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "x@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(pushMock).toHaveBeenCalledWith("/home");
  });

  it("shows the error message returned by the login API on failure", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce(new Error("Wrong password"));

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "seeker@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "wrongpass");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Wrong password")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("shows a generic error message when login throws a non-Error value", async () => {
    const user = userEvent.setup();
    loginMock.mockRejectedValueOnce("some string rejection");

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "seeker@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(
      await screen.findByText("Invalid email or password"),
    ).toBeInTheDocument();
  });

  it("disables the submit button and shows loading text while submitting", async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: { access_token: string }) => void;
    loginMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
    );

    render(<LoginPage />);

    await user.type(screen.getByPlaceholderText("Email"), "seeker@example.com");
    await user.type(screen.getByPlaceholderText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: "Login" }));

    const loadingButton = await screen.findByRole("button", {
      name: "Logging in...",
    });
    expect(loadingButton).toBeDisabled();

    resolveLogin!({ access_token: "abc" });
    getProfileMock.mockResolvedValueOnce({ role: "JOB_SEEKER" });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalled();
    });
  });

  it("calls lineLoginUrl with the job-seeker role when that button is clicked", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: "Continue with LINE as Job Seeker" }),
    );

    expect(lineLoginUrlMock).toHaveBeenCalledWith("job-seeker");
  });

  it("calls lineLoginUrl with the company role when that button is clicked", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.click(
      screen.getByRole("button", { name: "Continue with LINE as Company" }),
    );

    expect(lineLoginUrlMock).toHaveBeenCalledWith("company");
  });
});
