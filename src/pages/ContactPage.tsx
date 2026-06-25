import { Formik, Form, useField } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiCheckCircle,
  FiMail,
  FiArrowUpRight,
  FiPhone,
  FiMapPin,
  FiSend,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Testimonials } from "@/components/home/Testimonials";
import { fadeUp, fadeUpItem, stagger } from "@/lib/motion";
import { cn } from "@/lib/utils";

const HELP_POINTS = [
  "Request a demo of the marketplace",
  "Learn which plan is right for your store",
  "Get onboarding & seller support",
];

const contactSchema = Yup.object({
  firstName: Yup.string().trim().required("First name is required"),
  lastName: Yup.string().trim().required("Last name is required"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: Yup.string().trim().required("Phone number is required"),
  website: Yup.string().trim(),
  message: Yup.string()
    .trim()
    .required("Please tell us a little about your query"),
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-brand-gray">
      <Navbar />

 {/* Hero + Form  */}
      <section className="relative overflow-hidden bg-[#0f0d1a] py-16 text-white">
        <div className="blob-drift pointer-events-none absolute -top-20 -right-16 h-96 w-96 rounded-full bg-purple-600/15 blur-3xl" />
        <div
          className="blob-drift pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="blob-drift pointer-events-none absolute top-1/3 left-10 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl"
          style={{ animationDelay: "6s" }}
        />

        <div className="relative z-10 mx-auto grid max-w-[1400px] gap-12 px-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start lg:px-10">
          {/* Left column */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger(0.12)}
            className="flex flex-col"
          >
            <motion.div
              variants={fadeUpItem}
              className="mb-6 flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs text-purple-300"
            >
              <span className="glow-pulse h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              We usually reply within 24 hours
            </motion.div>

            <motion.h1
              variants={fadeUpItem}
              className="font-serif text-4xl font-bold leading-tight sm:text-5xl"
            >
              How can{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg,#f5a623,#ec4899,#8b5cf6)",
                }}
              >
                We Help?
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUpItem}
              className="mt-4 max-w-md text-sm leading-relaxed text-[#b0aac8]"
            >
              Get in touch with our sales and support teams for demos,
              onboarding support, or any product questions about World
              Knowledge.
            </motion.p>

            <motion.ul variants={fadeUpItem} className="mt-7 space-y-3">
              {HELP_POINTS.map((point) => (
                <li
                  key={point}
                  className="flex items-center gap-3 text-sm text-[#e7e4f3]"
                >
                  <FiCheckCircle
                    className="flex-shrink-0 text-pink-400"
                    size={18}
                  />
                  {point}
                </li>
              ))}
            </motion.ul>

            {/* Info cards */}
            <motion.div
              variants={fadeUpItem}
              className="mt-9 grid gap-4 sm:grid-cols-2"
            >
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
                <h3 className="text-sm font-semibold text-white">
                  General communication
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#8b86a8]">
                  For other queries, please get in touch with us via email.
                </p>
                <a
                  href="mailto:hello@worldknowledge.com"
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-300 transition hover:text-amber-200"
                >
                  <FiMail size={15} /> hello@rajan_worldknowledge.com
                </a>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-white/20 hover:bg-white/[0.07]">
                <h3 className="text-sm font-semibold text-white">
                  Documentation
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-[#8b86a8]">
                  Get an overview of our features, integrations, and how to use
                  them.
                </p>
                <Link
                  to="/books"
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-pink-300 transition hover:text-pink-200"
                >
                  See Docs <FiArrowUpRight size={15} />
                </Link>
              </div>
            </motion.div>

            {/* Quick contact chips */}
            <motion.div
              variants={fadeUpItem}
              className="mt-6 flex flex-wrap gap-5 text-xs text-[#8b86a8]"
            >
              <span className="flex items-center gap-2">
                <FiPhone size={14} className="text-purple-300" /> +8580432871
              </span>
              <span className="flex items-center gap-2">
                <FiMapPin size={14} className="text-purple-300" /> Chandigarh,
                India
              </span>
            </motion.div>
          </motion.div>

          {/* Right column — Contact form */}
          <motion.div
            initial="hidden"
            animate="show"
            variants={fadeUp}
            className="rounded-3xl border border-gray-100 bg-white p-6 text-brand-dark shadow-2xl sm:p-8"
          >
            <h2 className="font-serif text-2xl font-bold">Contact our team</h2>
            <p className="mt-1 text-sm text-gray-500">
              Fill out the form and we'll get back to you shortly.
            </p>

            <Formik
              initialValues={{
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                subject: "",
                message: "",
              }}
              validationSchema={contactSchema}
              onSubmit={(values, { resetForm }) => {
                toast.success(
                  `Thanks ${values.firstName}! Your message has been sent. We'll be in touch soon.`,
                );
                resetForm();
              }}
            >
              {() => (
                <Form className="mt-6 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      name="firstName"
                      label="First name"
                      placeholder="Johaness Mark"
                      autoComplete="given-name"
                      required
                    />
                    <FormField
                      name="lastName"
                      label="Last name"
                      placeholder="Parker"
                      autoComplete="family-name"
                      required
                    />
                  </div>

                  <FormField
                    name="email"
                    label="Email address"
                    type="email"
                    placeholder="contact@gmail.com"
                    autoComplete="email"
                    required
                  />

                  <FormField
                    name="phone"
                    label="Phone number"
                    type="tel"
                    placeholder="+91 123 4554 784"
                    autoComplete="tel"
                    required
                  />

                  <FormField
                    name="subject"
                    label="Subject"
                    placeholder="Enter subject"
                    autoComplete="off"
                  />

                  {/* Message — textarea (FormField is single-line, so inline here) */}
                  <MessageField />

                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_18px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_28px_rgba(236,72,153,0.5)]"
                    style={{
                      background: "linear-gradient(135deg,#1f2937,#0f172a)",
                    }}
                  >
                    <FiSend size={16} /> Send Message
                  </button>
                </Form>
              )}
            </Formik>
          </motion.div>
        </div>
      </section>
      <Testimonials />

      <Footer />
    </div>
  );
}

/* Multiline message field wired into Formik, styled like the other inputs. */
function MessageField() {
  const [field, meta] = useField("message");
  const hasError = Boolean(meta.touched && meta.error);
  return (
    <div className="space-y-1.5">
      <Label htmlFor="message">
        Your message<span className="ml-0.5 text-red-500">*</span>
      </Label>
      <textarea
        id="message"
        rows={4}
        placeholder="Tell us more about your project…"
        className={cn(
          "flex w-full resize-none rounded-lg border border-input bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/60 focus-visible:border-brand-yellow transition-shadow",
          hasError && "border-red-500 focus-visible:ring-red-500/40",
        )}
        {...field}
      />
      {hasError && (
        <p className="text-xs font-medium text-red-500">{meta.error}</p>
      )}
    </div>
  );
}



