"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-text-muted">Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(
    async (verifyCode: string) => {
      setError("");
      setIsLoading(true);

      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verifyCode }),
        });

        if (!res.ok) {
          const data = await res.json();
          setError(data.error || "Invalid verification code.");
          return;
        }

        setSuccess(true);
        setTimeout(() => router.push("/sign-in"), 2000);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, router]
  );

  function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    if (value.length > 1) {
      const digits = value.slice(0, 6).split("");
      digits.forEach((digit, i) => {
        if (index + i < 6) newCode[index + i] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();

      if (newCode.every((d) => d !== "")) {
        handleVerify(newCode.join(""));
      }
      return;
    }

    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every((d) => d !== "")) {
      handleVerify(newCode.join(""));
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setResendCooldown(60);
    } catch {
      setError("Failed to resend code. Please try again.");
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[20px] border border-border-light bg-bg-card p-8 text-center"
      >
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/15 mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="font-cormorant text-2xl font-semibold text-text-primary">
          Email Verified!
        </h2>
        <p className="text-sm text-text-secondary font-quicksand mt-2">
          Redirecting you to sign in...
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[20px] border border-border-light bg-bg-card p-8"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-accent-purple/15 mx-auto mb-4">
          <Mail className="h-7 w-7 text-accent-purple" />
        </div>
        <h1 className="font-cormorant text-3xl font-semibold text-text-primary">
          Verify Your Email
        </h1>
        <p className="text-sm text-text-secondary font-quicksand mt-2">
          We sent a 6-digit code to{" "}
          <span className="font-semibold text-text-primary">{email || "your email"}</span>
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 font-quicksand text-center mb-6"
        >
          {error}
        </motion.div>
      )}

      {/* Code Input */}
      <div className="flex justify-center gap-3 mb-8">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={digit}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={isLoading}
            className="w-12 h-14 text-center text-xl font-quicksand font-semibold rounded-xl border border-border-light bg-bg-input text-text-primary focus:outline-none focus:border-accent-purple focus:ring-2 focus:ring-accent-purple/20 disabled:opacity-50 transition-colors"
          />
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 mb-6">
          <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
          <span className="text-sm text-text-muted font-quicksand">Verifying...</span>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-text-secondary font-quicksand">
          Didn&apos;t receive a code?{" "}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-accent-purple font-semibold px-1 h-auto"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
          </Button>
        </p>
      </div>
    </motion.div>
  );
}
