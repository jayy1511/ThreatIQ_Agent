"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const [error, setError] = useState("");
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleGoogleSignUp = async () => {
    setIsLoadingGoogle(true);
    setError("");
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError("Failed to create account with Google. Please try again.");
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingEmail(true);
    setError("");

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      setIsLoadingEmail(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoadingEmail(false);
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      setIsLoadingEmail(false);
      return;
    }

    try {
      await signUpWithEmail(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Email signup error:", err);
      setError(
        "Failed to create account with email. This email may already be in use or invalid."
      );
    } finally {
      setIsLoadingEmail(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg border-none sm:border bg-background">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join ThreatIQ to start your security journey
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}

          {/* Email / Password sign up form */}
          <form onSubmit={handleEmailSignup} className="space-y-3">
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="text-xs font-medium text-muted-foreground"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingEmail || isLoadingGoogle}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="password"
                className="text-xs font-medium text-muted-foreground"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoadingEmail || isLoadingGoogle}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="confirm-password"
                className="text-xs font-medium text-muted-foreground"
              >
                Confirm Password
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoadingEmail || isLoadingGoogle}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-sm font-medium"
              disabled={isLoadingEmail || isLoadingGoogle}
            >
              {isLoadingEmail ? "Creating account..." : "Sign up with Email"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google signup */}
          <Button
            variant="outline"
            onClick={handleGoogleSignUp}
            className="w-full h-12 text-base font-medium relative"
            disabled={isLoadingGoogle || isLoadingEmail}
          >
            {isLoadingGoogle ? (
              "Creating account..."
            ) : (
              <>
                <svg
                  className="mr-2 h-5 w-5"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
                Sign up with Google
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
