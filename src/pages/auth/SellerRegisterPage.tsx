import { Formik, Form } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AuthLayout } from "./AuthLayout";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { authApi } from "@/api/auth.api";

/**
 * PDF seller fields: Business Name, Contact Person, Email, Mobile Number.
 * Assumption (documented): seller also needs a password to login.
 * Seller status starts as PENDING_APPROVAL (admin must approve).
 */
const sellerSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .min(3, "Business name must be at least 3 characters")
    .required("Business name is required"),
  contactPerson: Yup.string()
    .trim()
    .min(2, "Contact person must be at least 2 characters")
    .matches(/^[A-Za-z\s]+$/, "Contact person can contain only letters")
    .required("Contact person is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  mobile: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")
    .required("Mobile number is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password cannot be empty"),
});

interface SellerPayload {
  businessName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  password: string;
}

export default function SellerRegisterPage() {
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (payload: SellerPayload) => {
      const exists = await authApi.checkEmailExists(payload.email);
      if (exists) throw new Error("Email already registered. Please login.");

      const { data: user } = await api.post("/users", {
        email: payload.email.toLowerCase(),
        password: payload.password,
        roleId: 2,
        createdAt: new Date().toISOString(),
      });

      await api.post("/sellers", {
        userId: user.id,
        businessName: payload.businessName,
        contactPerson: payload.contactPerson,
        email: payload.email.toLowerCase(),
        mobile: payload.mobile,
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      toast.success(
        "Seller registration submitted! Status: Pending Approval. You can login once the admin approves your account."
      );
      navigate("/login");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <AuthLayout
      title="Become a Seller"
      subtitle="Register your business and reach thousands of readers"
    >
      <Formik
        initialValues={{
          businessName: "",
          contactPerson: "",
          email: "",
          mobile: "",
          password: "",
        }}
        validationSchema={sellerSchema}
        onSubmit={(values) => mutation.mutate(values)}
      >
        {() => (
          <Form className="space-y-4">
            <FormField
              name="businessName"
              label="Business Name"
              placeholder="e.g. BookHub Traders"
              required
            />
            <FormField
              name="contactPerson"
              label="Contact Person"
              placeholder="Full name"
              required
            />
            <FormField
              name="email"
              label="Email"
              type="email"
              placeholder="business@mail.com"
              required
            />
            <FormField
              name="mobile"
              label="Mobile Number"
              placeholder="10-digit mobile number"
              required
            />
            <FormField
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              required
            />

            <Button
              type="submit"
              className="!mt-6 h-11 w-full rounded-lg text-sm font-bold"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Register as Seller"}
            </Button>

            <p className="pt-1 text-center text-xs text-gray-400">
              Your account will be reviewed by the marketplace admin before
              activation.
            </p>
            <p className="text-center text-sm text-gray-600">
              Already approved?{" "}
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








