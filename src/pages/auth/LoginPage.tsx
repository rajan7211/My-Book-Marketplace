import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { FaApple, FaGoogle, FaFacebook } from "react-icons/fa";
import { AuthLayout } from "./AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { authApi, type LoginPayload } from "@/api/auth.api";
import { getApiErrorMessage } from "@/lib/api-helpers";
import { useAuthStore } from "@/store/auth.store";


/** PDF validation: email unique + valid, password cannot be empty */
const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string().required("Password cannot be empty"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (result) => {
      const user = result.user;
      // Edge case: rejected seller cannot access seller features
      if (user.role === "SELLER" && user.sellerStatus === "REJECTED") {
        toast.error(
          "Your seller account was rejected. Contact marketplace admin."
        );
        return;
      }
      login(user, {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === "ADMIN") navigate("/admin");
      else if (user.role === "SELLER") {
        if (user.sellerStatus === "PENDING_APPROVAL") {
          toast.info("Your seller account is pending admin approval.");
          navigate("/seller/pending");
        } else navigate("/seller");
      } else {
        // Customers always land on the Home page after login, regardless of
        // where they were before logging out (never restore /profile etc.).
        navigate("/", { replace: true });
      }
    },
    onError: (err) => toast.error(getApiErrorMessage(err)),
  });

  return (
    <AuthLayout
      title="Hello, welcome back!"
      subtitle="Start your day with the perfect read"
    >
      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={loginSchema}
        onSubmit={(values) => mutation.mutate(values)}
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
            <FormField
              name="password"
              label="Password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-brand-yellow"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="font-medium text-gray-700 underline hover:text-brand-dark"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-lg text-sm font-bold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Signing in..." : "Let's read!"}
            </Button>

            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs text-gray-400">Or continue with :</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex justify-center gap-6">
              {[FaApple, FaGoogle, FaFacebook].map((Icon, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() =>
                    toast.info("Social login is not part of this assignment.")
                  }
                  className="grid h-10 w-10 place-items-center rounded-full border border-gray-200 text-brand-dark transition hover:border-brand-yellow hover:text-brand-yellow-dark"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>

            <p className="pt-2 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-brand-yellow-dark underline"
              >
                Sign Up
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400">
              Are you a seller?{" "}
              <Link to="/seller/register" className="underline">
                Register as Seller
              </Link>
            </p>
          </Form>
        )}
      </Formik>
    </AuthLayout>
  );
}


