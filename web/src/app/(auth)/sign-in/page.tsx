"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AUTH_ERRORS: Record<string, string> = {
  OAuthSignin: "Could not start OAuth sign in. Please try again.",
  OAuthCallback: "OAuth sign in failed. Check that the app is correctly configured.",
  OAuthCreateAccount: "Could not create account via OAuth. Please try email sign up.",
  OAuthAccountNotLinked: "This email is already linked to a different sign-in method.",
  Callback: "Sign in callback failed. Please try again.",
  AccessDenied: "Access denied. You may have cancelled the sign-in.",
  Verification: "The sign in link has expired. Please request a new one.",
  Default: "An unexpected error occurred. Please try again.",
};

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignUpForm = z.infer<typeof signUpSchema>;
type FieldErrors = Partial<Record<keyof SignUpForm, string>>;

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Sign-in state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Sign-up state
  const [signUpForm, setSignUpForm] = useState<SignUpForm>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError) {
      setError(AUTH_ERRORS[oauthError] ?? AUTH_ERRORS.Default);
    }
    if (searchParams.get("registered") === "true") {
      setSuccessMessage("Account created! Please check your email to verify, then sign in.");
    }
  }, [searchParams]);

  function switchMode(newMode: "signin" | "signup") {
    setMode(newMode);
    setError("");
    setFieldErrors({});
    setSuccessMessage("");
  }

  function updateSignUpField(field: keyof SignUpForm, value: string) {
    setSignUpForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    const result = signUpSchema.safeParse(signUpForm);
    if (!result.success) {
      const errs: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignUpForm;
        if (!errs[field]) errs[field] = issue.message;
      });
      setFieldErrors(errs);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signUpForm.name,
          email: signUpForm.email,
          password: signUpForm.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSuccessMessage("Account created! Please check your email to verify, then sign in.");
      switchMode("signin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-8"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
          {mode === "signin" ? "Welcome Back" : "Get Started"}
        </h1>
        <p className="text-sm text-text-secondary font-quicksand mt-2">
          {mode === "signin"
            ? "Sign in to continue your wellness journey"
            : "Begin your personalized wellness journey"}
        </p>
      </div>

      {/* OAuth Buttons — always visible */}
      <div className="space-y-3 mb-6">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-border-light bg-bg-secondary font-quicksand font-semibold text-sm text-text-primary hover:brightness-95 transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </button>

        <button
          onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl border border-border-light bg-bg-secondary font-quicksand font-semibold text-sm text-text-primary hover:brightness-95 transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Continue with Apple
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-border-light" />
        <span className="text-xs text-text-muted font-quicksand">or continue with email</span>
        <div className="flex-1 h-px bg-border-light" />
      </div>

      {/* Mode Toggle */}
      <div className="flex rounded-2xl border border-border-light bg-bg-secondary p-1 mb-6">
        <button
          onClick={() => switchMode("signin")}
          className={`flex-1 py-2 rounded-xl text-sm font-quicksand font-semibold transition-all ${
            mode === "signin"
              ? "bg-bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => switchMode("signup")}
          className={`flex-1 py-2 rounded-xl text-sm font-quicksand font-semibold transition-all ${
            mode === "signup"
              ? "bg-bg-card text-text-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 font-quicksand text-center mb-4"
          >
            {error}
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-600 font-quicksand text-center mb-4"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forms */}
      <AnimatePresence mode="wait">
        {mode === "signin" ? (
          <motion.form
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSignIn}
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-text-muted" />
                ) : (
                  <Eye className="h-4 w-4 text-text-muted" />
                )}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs text-accent-purple font-quicksand font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </motion.form>
        ) : (
          <motion.form
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSignUp}
            className="space-y-4"
          >
            <div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Full name"
                  value={signUpForm.name}
                  onChange={(e) => updateSignUpField("name", e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-500 font-quicksand mt-1 ml-1">{fieldErrors.name}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={signUpForm.email}
                  onChange={(e) => updateSignUpField("email", e.target.value)}
                  className="pl-11"
                  required
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-500 font-quicksand mt-1 ml-1">{fieldErrors.email}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={signUpForm.password}
                  onChange={(e) => updateSignUpField("password", e.target.value)}
                  className="pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-muted" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-500 font-quicksand mt-1 ml-1">{fieldErrors.password}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) => updateSignUpField("confirmPassword", e.target.value)}
                  className="pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showConfirm ? (
                    <EyeOff className="h-4 w-4 text-text-muted" />
                  ) : (
                    <Eye className="h-4 w-4 text-text-muted" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-500 font-quicksand mt-1 ml-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
