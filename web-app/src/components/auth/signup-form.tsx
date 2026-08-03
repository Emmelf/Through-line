import { Button } from "@/components/ui/button.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field.tsx"
import { Input } from "@/components/ui/input.tsx"
import {Link, useNavigate} from "react-router-dom";
import {cn} from "@/lib/utils.ts";
import React, { useState} from "react";
import { isAxiosError } from "axios";
import axios from "@/lib/axios";
import {Alert, AlertTitle} from "@/components/ui/alert";
import {AlertCircleIcon} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function SignupForm({ className, ...props }: React.ComponentProps<typeof Card>) {

  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`/api/register`, {
        username,
        email,
        password,
      });
      // Auto-login after registration
      setUser(response.data.user);
      navigate("/");
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || err.response?.data?.error || "Registration failed");
      } else {
        setError("An error occurred during registration");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleSignup = () => {
    setLoading(true);
    const apiOrigin = import.meta.env.PROD
        ? globalThis.location.origin
        : (import.meta.env.VITE_API_URL || globalThis.location.origin);
    globalThis.location.href = new URL("/api/auth/google", apiOrigin).toString();
  }

  return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircleIcon />
                <AlertTitle>{error}</AlertTitle>
              </Alert>
            )}
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <FieldDescription>
                  We&apos;ll use this to contact you. We will not share your email
                  with anyone else.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <FieldDescription>Please confirm your password.</FieldDescription>
              </Field>
              <FieldGroup>
                <Field>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                  <Button variant="outline" type="button" disabled={loading} onClick={handleGoogleSignup}>
                    Sign up with Google
                  </Button>
                  <FieldDescription className="px-6 text-center">
                    Already have an account ?
                    {loading ? (
                      <span className="ms-1 underline underline-offset-4 hover:underline opacity-50 cursor-not-allowed">Sign in</span>
                    ) : (
                      <Link to="/login" className="ms-1 underline underline-offset-4 hover:underline">Sign in</Link>
                    )}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
