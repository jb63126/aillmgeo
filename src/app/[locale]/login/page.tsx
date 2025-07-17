"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Loader2, Mail, CheckCircle } from "lucide-react";
import { supabase } from "~/lib/supabase";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState("/en/dashboard");

  useEffect(() => {
    // Get redirect URL from query params, default to dashboard if none provided
    const redirect = searchParams.get("redirect");
    if (redirect) {
      setRedirectUrl(redirect);
    }
    // If no redirect param, stays as default "/en/dashboard"
  }, [searchParams]);

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/en/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setEmailSent(true);
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Magic link error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendMagicLink = async () => {
    setResendLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/en/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("Failed to resend magic link");
      console.error("Resend magic link error:", err);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/en/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        setError(error.message);
        setIsGoogleLoading(false);
      }
    } catch (err) {
      setError("Failed to sign in with Google");
      setIsGoogleLoading(false);
      console.error("Google OAuth error:", err);
    }
  };

  const handleGitHubSignIn = async () => {
    setIsGitHubLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/en/auth/callback?redirect=${encodeURIComponent(redirectUrl)}`,
        },
      });

      if (error) {
        setError(error.message);
        setIsGitHubLoading(false);
      }
    } catch (err) {
      setError("Failed to sign in with GitHub");
      setIsGitHubLoading(false);
      console.error("GitHub OAuth error:", err);
    }
  };

  return (
    <section className="min-h-screen">
      <div className="container flex w-full flex-col items-center justify-center space-y-12 px-4 py-12 sm:space-y-20 sm:py-16 md:py-20 lg:py-24 xl:py-28">
        {/* FlowQL Brand */}
        <div className="text-center">
          <Link
            href="/"
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-2xl font-black text-transparent dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-900"
          >
            FlowQL
          </Link>
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Toggle Badge */}
          <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full bg-blue-100 px-4 py-2 transition-colors duration-300 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 sm:mb-5 sm:px-7">
            <AlertCircle className="h-4 w-4 text-blue-700 dark:text-blue-300 sm:h-5 sm:w-5" />
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </p>
          </div>

          {/* Main Heading */}
          <h1 className="text-balance bg-gradient-to-br from-gray-900 via-gray-800 to-gray-400 bg-clip-text text-center font-heading text-3xl font-bold leading-tight tracking-[-0.02em] text-transparent drop-shadow-sm duration-300 ease-linear [word-spacing:theme(spacing.1)] dark:bg-gradient-to-br dark:from-gray-100 dark:to-gray-900 sm:text-4xl">
            {isSignUp ? "Join FlowQL" : "Sign In"}
          </h1>

          <p className="mx-auto mt-4 max-w-3xl text-balance px-4 text-center text-base text-muted-foreground sm:mt-6 sm:px-0">
            {isSignUp
              ? "Create your account to access advanced LLM analytics and insights"
              : "Access your dashboard and view detailed LLM performance data"}
          </p>

          {/* Auth Card */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-center">
                {/* Mode Toggle */}
                <div className="flex items-center justify-center space-x-1 rounded-lg bg-muted p-1">
                  <Button
                    variant={!isSignUp ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsSignUp(false)}
                    className="flex-1"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant={isSignUp ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsSignUp(true)}
                    className="flex-1"
                  >
                    Sign Up
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Magic Link Success Message */}
              {emailSent && (
                <div className="space-y-3 rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Check your email!
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    We&apos;ve sent a magic link to <strong>{email}</strong>
                  </p>
                  <p className="text-xs text-green-600">
                    Click the link in your email to{" "}
                    {isSignUp ? "create your account and " : ""}sign in to
                    FlowQL
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResendMagicLink}
                    disabled={resendLoading}
                    className="mt-2"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend magic link
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Magic Link Form */}
              {!emailSent && (
                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !email.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending magic link...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        {isSignUp ? "Send sign up link" : "Send magic link"}
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    {isSignUp
                      ? "We&apos;ll send you a secure link to create your account"
                      : "We&apos;ll send you a secure link to sign in instantly"}
                  </p>
                </form>
              )}

              {/* Terms */}
              <p className="text-center text-xs text-muted-foreground">
                By {isSignUp ? "creating an account" : "signing in"}, you agree
                to our{" "}
                <Link
                  href="/terms"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
