import { cn } from "@/lib/utils.ts"
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
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Link } from "react-router-dom"
import React, { useState } from "react"
import { isAxiosError } from "axios"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import axios from "@/lib/axios"
import { isValidEmail } from "@/lib/validation"

export function ForgotPasswordForm({
   className,
   ...props
}: React.ComponentProps<"div">) {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        if (!email) {
            setError("Email is required")
            return
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address")
            return
        }

        try {
            setLoading(true)
            await axios.post("/api/forgot-password", { email })
            setSent(true)
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.error || "Could not send the reset link")
            } else {
                setError("An error occurred while sending the reset link")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                <CardTitle>Forgot your password ?</CardTitle>
                <CardDescription>
                    Enter your email and we’ll send you a reset link
                </CardDescription>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <Alert>
                            <CheckCircle2Icon />
                            <AlertTitle>
                                If an account exists for this email, a reset link has been sent.
                            </AlertTitle>
                        </Alert>
                    ) : (
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
                            </Field>

                            <Field>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? "Sending..." : "Send reset link"}
                                </Button>

                                <FieldDescription className="text-center">
                                    Remember your password ?
                                    <Link to="/login" className="ms-1 underline underline-offset-4 hover:underline">
                                        Login
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
