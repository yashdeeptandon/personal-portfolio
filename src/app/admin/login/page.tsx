"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const cubicEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: cubicEase } },
};

const roles = ["Full-Stack Developer", "Sr. Software Engineer", "Endurance Athlete"];

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentRole, setCurrentRole] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session?.user?.role === "admin") {
        router.push("/admin");
      }
    };
    checkSession();
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      const session = await getSession();
      if (session?.user?.role !== "admin") {
        setError("Access denied. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      const callbackUrl = searchParams.get("callbackUrl") || "/admin";
      router.push(callbackUrl);
    } catch {
      setError("An error occurred during login");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-16">
      {/* Signature dot-grid, same as the homepage hero */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        className="relative z-10 w-full max-w-sm"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Identity */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-blue-400 via-indigo-500 to-purple-600 opacity-30 blur-md" />
            <div className="h-20 w-20 rounded-full bg-linear-to-br from-blue-400 via-indigo-500 to-purple-600 p-0.5">
              <div className="h-full w-full overflow-hidden rounded-full bg-muted">
                <Image
                  src="/avatar.jpg"
                  alt="Yashdeep Tandon"
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50" />
            </motion.div>
          </motion.div>

          <h1 className="mt-5 font-display text-2xl font-bold text-transparent">
            <span className="bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text dark:from-blue-400 dark:to-indigo-400">
              Yashdeep Tandon
            </span>
          </h1>

          <div className="mt-1 h-5 text-sm text-muted-foreground">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentRole}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="inline-block font-medium text-indigo-500 dark:text-indigo-400"
              >
                {roles[currentRole]}
              </motion.span>
            </AnimatePresence>
          </div>

          <p className="mt-4 text-xs tracking-widest text-muted-foreground/70 uppercase">
            Private workshop · admin only
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-sm text-destructive"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-xs tracking-wide text-muted-foreground uppercase"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-0 border-b border-border bg-transparent px-0 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500 focus:ring-0 focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="text-xs tracking-wide text-muted-foreground uppercase"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-0 border-b border-border bg-transparent px-0 py-2 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-indigo-500 focus:ring-0 focus:outline-none"
              />
              <button
                type="button"
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: "0 8px 30px rgba(99,102,241,0.35)" }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className="w-full rounded-lg bg-linear-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg transition-opacity disabled:opacity-60"
          >
            {isLoading ? "Signing in…" : "Sign in"}
          </motion.button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-8 text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground transition-colors hover:text-indigo-500"
          >
            ← back to the portfolio
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-indigo-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
