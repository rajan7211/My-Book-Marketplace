import { api } from "./client";
import { mockApi } from "./mock-client";
import { unwrap } from "@/lib/api-helpers";
import type {
  ApiEnvelope,
  AuthResult,
  Customer,
  OtpPurpose,
  Seller,
} from "@/types";

// ───────────────────────── Request payload types ─────────────────────────

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterSellerPayload {
  businessName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  purpose: OtpPurpose;
  otp: string;
}

export interface ResendOtpPayload {
  email: string;
  purpose: OtpPurpose;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

/**
 * Auth service — talks to the real NestJS backend.
 *
 * Every endpoint is mounted under the global `/api` prefix (configured via
 * VITE_API_URL) and returns the standard response envelope
 * `{ success, statusCode, message, data, timestamp }`, so we `unwrap` the
 * `data` field before returning.
 */
export const authApi = {
  // ───── Registration (customer) ─────
  // Sends a 6-digit OTP to the email. No account is created until verify-otp.
  async register(payload: RegisterPayload): Promise<void> {
    await api.post("/auth/register", {
      email: payload.email.toLowerCase(),
      purpose: "REGISTRATION",
      firstName: payload.firstName,
      lastName: payload.lastName,
      password: payload.password,
    });
  },

  // ───── Registration (seller) ─────
  // Sends OTP; the seller account is created PENDING_APPROVAL after verify-otp.
  async registerSeller(payload: RegisterSellerPayload): Promise<void> {
    await api.post("/auth/register-seller", {
      businessName: payload.businessName,
      contactPerson: payload.contactPerson,
      email: payload.email.toLowerCase(),
      mobile: payload.mobile,
      password: payload.password,
    });
  },

  // ───── Verify OTP ─────
  // For REGISTRATION the backend creates the user and returns tokens + user.
  // For PASSWORD_RESET it returns null (the reset itself happens separately).
  async verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult | null> {
    const { data } = await api.post<ApiEnvelope<AuthResult | null>>(
      "/auth/verify-otp",
      {
        email: payload.email.toLowerCase(),
        purpose: payload.purpose,
        otp: payload.otp,
      }
    );
    return unwrap(data);
  },

  // ───── Resend OTP ─────
  // Backend enforces a 60-second cooldown and returns 409 if called too soon.
  async resendOtp(payload: ResendOtpPayload): Promise<void> {
    await api.post("/auth/resend-otp", {
      email: payload.email.toLowerCase(),
      purpose: payload.purpose,
    });
  },

  // ───── Login ─────
  async login(payload: LoginPayload): Promise<AuthResult> {
    const { data } = await api.post<ApiEnvelope<AuthResult>>("/auth/login", {
      email: payload.email.toLowerCase(),
      password: payload.password,
    });
    return unwrap(data);
  },

  // ───── Logout (revokes the refresh token server-side) ─────
  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  // ───── Current identity ─────
  async me(): Promise<AuthResult["user"]> {
    const { data } = await api.get<ApiEnvelope<AuthResult["user"]>>("/auth/me");
    return unwrap(data);
  },

  // ───── Password recovery ─────
  // Always succeeds (no email enumeration); sends a PASSWORD_RESET OTP.
  async forgotPassword(email: string): Promise<void> {
    await api.post("/auth/forgot-password", { email: email.toLowerCase() });
  },

  // Single-step reset: OTP + new password are submitted together.
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    await api.post("/auth/reset-password", {
      email: payload.email.toLowerCase(),
      otp: payload.otp,
      newPassword: payload.newPassword,
    });
  },

  // ───── Change password (authenticated) ─────
  // Backend revokes all sessions afterwards, so the UI must log out.
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await api.patch("/auth/change-password", {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
    });
  },

  // ───── Profile editing (legacy mock json-server) ─────
  // NOTE: These still target the legacy mock API and are used by the Profile
  // "Settings" tab. They are intentionally left untouched as part of the
  // auth-focused migration (Path 1) and will move to the real backend when the
  // profile/customer/seller modules are migrated.
  async updateCustomerProfile(
    customerId: string | number,
    changes: { firstName: string; lastName: string }
  ): Promise<string> {
    const { data } = await mockApi.patch<Customer>(`/customers/${customerId}`, {
      firstName: changes.firstName,
      lastName: changes.lastName,
    });
    return `${data.firstName} ${data.lastName}`;
  },

  async updateSellerProfile(
    sellerId: string | number,
    changes: { businessName: string; contactPerson: string; mobile: string }
  ): Promise<string> {
    const { data } = await mockApi.patch<Seller>(`/sellers/${sellerId}`, {
      businessName: changes.businessName,
      contactPerson: changes.contactPerson,
      mobile: changes.mobile,
    });
    return data.businessName;
  },
};
