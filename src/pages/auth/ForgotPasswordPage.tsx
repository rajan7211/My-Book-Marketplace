import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthLayout } from "./AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { authApi } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-helpers";

const forgotSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
});

/**
 * Step 1 of password recovery: collect the email and ask the backend to send a
 * PASSWORD_RESET OTP. The backend always responds success (no email
 * enumeration), so we forward the user to /reset-password regardless.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: (_data, email) => {
      toast.success("If that email exists, a reset code has been sent.");
      navigate("/reset-password", { state: { email } });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset code"
    >
      <Formik
        initialValues={{ email: "" }}
        validationSchema={forgotSchema}
        onSubmit={(values) => mutation.mutate(values.email.trim())}
      >
        {() => (
          <Form className="space-y-5">
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="Johndoe@mail.com"
              autoComplete="email"
              required
            />

            <Button
              type="submit"
              className="h-11 w-full rounded-lg text-sm font-bold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Sending code..." : "Send reset code"}
            </Button>

            <p className="pt-2 text-center text-sm text-gray-600">
              Remembered your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-yellow-dark underline"
              >
                Back to Login
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}

