"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
          emailRedirectTo: `${window.location.origin}/dashboard`,
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
          redirectTo: `${window.location.origin}/dashboard`,
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
          redirectTo: `${window.location.origin}/dashboard`,
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

              {/* OAuth Section - Only show when not in email sent state */}
              {!emailSent && (
                <>
                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  {/* OAuth Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                    >
                      {isGoogleLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                      )}
                      Google
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleGitHubSignIn}
                      disabled={isGitHubLoading}
                    >
                      {isGitHubLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                      GitHub
                    </Button>
                  </div>
                </>
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
