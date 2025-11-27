"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { HoverButton } from "@/components/animations/HoverAnimations";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (response?.error) {
        // Check for specific error messages and customize them
        if (response.error.includes("CredentialsSignin")) {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        } else {
          setError(response.error || "Login failed");
          toast.error(response.error || "Login failed");
        }
        setLoading(false);
      } else {
        // Authentication successful - redirect to dashboard
        toast.success("Login successful!");
        router.push(callbackUrl);
        router.refresh(); // Refresh to update layout with user context
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-green-200 bg-white dark:bg-gray-800 dark:border-gray-700 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-gradient-to-r from-green-600 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Inventory Management
            </CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="admin@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <HoverButton
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-medium transition-all flex items-center justify-center hover:from-green-700 hover:to-emerald-700"
                >
                  <span className="flex items-center">
                    {loading ? "Signing in..." : "Sign In"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </HoverButton>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-600 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-md border border-green-200 dark:border-green-800">
              <p>
                <strong>Test Credentials:</strong>
              </p>
              <p>Email: admin@gmail.com</p>
              <p>Password: Admin123</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
