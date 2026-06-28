import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthLayout } from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/OtpInput";
import { useCountdown } from "@/hooks/useCountdown";
import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import { useAuthStore } from "@/store/auth.store";
import type { AuthResult, AuthUser } from "@/types";

interface VerifyOtpState {
  email?: string;
}

/**
 * Registration OTP verification.
 *
 * Reached after /register (customer) or /seller/register submits and the
 * backend emails a 6-digit code. On success the backend creates the account
 * and returns JWT tokens + the user, so we log the user in directly.
 */
export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);

  const email = (location.state as VerifyOtpState | null)?.email ?? "";
  const [otp, setOtp] = useState("");
  const [showError, setShowError] = useState(false);
  const resend = useCountdown(60, true);

  const verifyMutation = useMutation({
    mutationFn: () =>
      authApi.verifyOtp({ email, purpose: "REGISTRATION", otp }),
    onSuccess: (result: AuthResult | null) => {
      if (!result) {
        toast.success("Verified successfully.");
        navigate("/login");
        return;
      }
      const user: AuthUser = result.user;
      login(user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      toast.success("Account verified! Welcome to World Knowledge 🎉");

      if (user.role === "SELLER") {
        // Newly verified sellers are PENDING_APPROVAL until an admin approves.
        toast.info("Your seller account is pending admin approval.");
        navigate("/seller/pending");
      } else {
        navigate("/", { replace: true });
      }
    },
    onError: (err) => {
      setShowError(true);
      toast.error(getApiErrorMessage(err));
    },
  });

  const resendMutation = useMutation({
    mutationFn: () =>
      authApi.resendOtp({ email, purpose: "REGISTRATION" }),
    onSuccess: () => {
      resend.restart();
      setOtp("");
      setShowError(false);
      toast.success("A new code has been sent to your email.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const handleVerify = () => {
    if (otp.length !== 6) {
      setShowError(true);
      toast.error("Please enter the 6-digit code.");
      return;
    }
    verifyMutation.mutate();
  };

  // Guard: if the page is opened directly without an email, send them back.
  if (!email) {
    return (
      <AuthLayout
        title="Verify your email"
        subtitle="We couldn't find which email to verify"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Please start the registration process again so we can send you a
            fresh verification code.
          </p>
          <Button
            type="button"
            className="h-11 w-full rounded-lg text-sm font-bold"
            onClick={() => navigate("/register")}
          >
            Go to Sign Up
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle="Enter the 6-digit code we sent you"
    >
      <div className="space-y-6">
        <p className="text-center text-sm text-gray-600">
          We sent a verification code to{" "}
          <span className="font-semibold text-brand-dark">{email}</span>
        </p>

        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v);
            if (showError) setShowError(false);
          }}
          disabled={verifyMutation.isPending}
          error={showError}
        />

        <Button
          type="button"
          className="h-11 w-full rounded-lg text-sm font-bold"
          onClick={handleVerify}
          disabled={verifyMutation.isPending || otp.length !== 6}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify"}
        </Button>

        <div className="text-center text-sm text-gray-600">
          {resend.isActive ? (
            <span>
              Resend code in{" "}
              <span className="font-semibold text-brand-dark">
                {resend.seconds}s
              </span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => resendMutation.mutate()}
              disabled={resendMutation.isPending}
              className="font-semibold text-brand-yellow-dark underline disabled:opacity-50"
            >
              {resendMutation.isPending ? "Sending..." : "Resend code"}
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Wrong email?{" "}
          <Link to="/register" className="underline">
            Go back
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
