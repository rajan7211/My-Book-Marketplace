import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthLayout } from "./AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { OtpInput } from "@/components/ui/OtpInput";
import { useCountdown } from "@/hooks/useCountdown";
import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-helpers";

interface ResetState {
  email?: string;
}

const resetSchema = Yup.object({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters")
    .required("Password cannot be empty"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

/**
 * Step 2 of password recovery. The backend takes the OTP and the new password
 * together in a single /auth/reset-password request, so we collect both here.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as ResetState | null)?.email ?? "";

  const [email] = useState(emailFromState);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(false);
  const resend = useCountdown(60, true);

  const resetMutation = useMutation({
    mutationFn: (newPassword: string) =>
      authApi.resetPassword({ email, otp, newPassword }),
    onSuccess: () => {
      toast.success("Password reset successfully. Please log in again.");
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendOtp({ email, purpose: "PASSWORD_RESET" }),
    onSuccess: () => {
      resend.restart();
      setOtp("");
      setOtpError(false);
      toast.success("A new code has been sent to your email.");
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  // Guard: opened directly without an email — send back to forgot-password.
  if (!email) {
    return (
      <AuthLayout
        title="Reset your password"
        subtitle="We need your email first"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-600">
            Please request a reset code first so we know which account to reset.
          </p>
          <Button
            type="button"
            className="h-11 w-full rounded-lg text-sm font-bold"
            onClick={() => navigate("/forgot-password")}
          >
            Request a reset code
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the code and choose a new password"
    >
      <Formik
        initialValues={{ newPassword: "", confirmPassword: "" }}
        validationSchema={resetSchema}
        onSubmit={(values) => {
          if (otp.length !== 6) {
            setOtpError(true);
            toast.error("Please enter the 6-digit code.");
            return;
          }
          resetMutation.mutate(values.newPassword);
        }}
      >
        {() => (
          <Form className="space-y-5">
            <p className="text-center text-sm text-gray-600">
              We sent a reset code to{" "}
              <span className="font-semibold text-brand-dark">{email}</span>
            </p>

            <div className="space-y-2">
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  if (otpError) setOtpError(false);
                }}
                disabled={resetMutation.isPending}
                error={otpError}
                ariaLabel="Password reset code"
              />
              <div className="text-center text-xs text-gray-500">
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
            </div>

            <FormField
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="Create a new password"
              autoComplete="new-password"
              required
            />
            <FormField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-lg text-sm font-bold"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <p className="pt-1 text-center text-sm text-gray-600">
              Back to{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-yellow-dark underline"
              >
                Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}
