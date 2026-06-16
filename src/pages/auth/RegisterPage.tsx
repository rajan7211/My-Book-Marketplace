import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthLayout } from "./AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { authApi, type RegisterPayload } from "@/api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import loginSide from "@/assets/login-side.svg";

/**
 * PDF required fields: First Name, Last Name, Email, Password.
 * Validation rules: email must be unique (checked in API), password not empty.
 */
const registerSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(2, "First name must be at least 2 characters")
    .matches(/^[A-Za-z\s]+$/, "First name can contain only letters")
    .required("First name is required"),
  lastName: Yup.string()
    .trim()
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[A-Za-z\s]+$/, "Last name can contain only letters")
    .required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password cannot be empty"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const mutation = useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.registerCustomer(payload),
    onSuccess: (user) => {
      login(user);
      toast.success("Account created! Welcome to World Knowledge 🎉");
      navigate("/");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join us and start your reading adventure"
    >
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={registerSchema}
        onSubmit={({ confirmPassword, ...values }) => mutation.mutate(values)}
      >
        {() => (
          <Form className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                name="firstName"
                label="First Name"
                placeholder="John"
                autoComplete="given-name"
                required
              />
              <FormField
                name="lastName"
                label="Last Name"
                placeholder="Doe"
                autoComplete="family-name"
                required
              />
            </div>
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
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
            <FormField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />

            <Button
              type="submit"
              className="!mt-6 h-11 w-full rounded-lg text-sm font-bold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Creating account..." : "Sign Up"}
            </Button>

            <p className="pt-2 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-brand-yellow-dark underline"
              >
                Login
              </Link>
            </p>
            <p className="text-center text-xs text-gray-400">
              Want to sell books?{" "}
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
