import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FiArrowLeft } from "react-icons/fi";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authApi, type ChangePasswordPayload } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import { useAuthStore } from "@/store/auth.store";

const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .max(72, "Password must be at most 72 characters")
    .notOneOf(
      [Yup.ref("currentPassword")],
      "New password must be different from the current password"
    )
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

/**
 * Protected page for authenticated users to change their password.
 *
 * The backend revokes all sessions after a successful change, so we log the
 * user out and send them to /login afterwards.
 */
export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  const mutation = useMutation({
    mutationFn: (payload: ChangePasswordPayload) =>
      authApi.changePassword(payload),
    onSuccess: () => {
      toast.success("Password changed successfully. Please log in again.");
      logout();
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <div className="min-h-screen bg-brand-gray px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/profile"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-brand-dark"
        >
          <FiArrowLeft size={15} /> Back to Profile
        </Link>

        <Card className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-brand-dark">Change Password</h1>
          <p className="mt-1 text-sm text-gray-500">
            For your security, you'll be signed out after changing your password.
          </p>

          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={changePasswordSchema}
            onSubmit={(values) =>
              mutation.mutate({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
              })
            }
          >
            {() => (
              <Form className="mt-6 space-y-4">
                <FormField
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  required
                />
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
                  label="Confirm New Password"
                  type="password"
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                />

                <Button
                  type="submit"
                  className="!mt-6 h-11 w-full rounded-lg text-sm font-bold"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? "Changing..." : "Change Password"}
                </Button>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </div>
  );
}

