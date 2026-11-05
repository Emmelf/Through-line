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
import { Link, useSearchParams } from "react-router-dom"
import React, { useState } from "react"
import { isAxiosError } from "axios"
import { AlertCircleIcon, CheckCircle2Icon } from "lucide-react"
import axios from "@/lib/axios"
import { MIN_PASSWORD_LENGTH } from "@/lib/validation"

export function ResetPasswordForm({
   className,
   ...props
}: React.ComponentProps<"div">) {
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") ?? ""
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [done, setDone] = useState(false)

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError("")

        if (!password || !confirmPassword) {
            setError("Both password fields are required")
            return
        }

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        try {
            setLoading(true)
            await axios.post("/api/reset-password", { token, password })
            setDone(true)
        } catch (err: unknown) {
            if (isAxiosError(err)) {
                setError(err.response?.data?.error || "Could not reset the password")
            } else {
                setError("An error occurred while resetting the password")
            }
        } finally {
            setLoading(false)
        }
    }

    const renderContent = () => {
        if (!token) {
            return (
                <Alert variant="destructive">
                    <AlertCircleIcon />
                    <AlertTitle>
                        This reset link is invalid. <Link to="/forgot-password" className="underline">Request a new one</Link>.
                    </AlertTitle>
                </Alert>
            )
        }

        if (done) {
            return (
                <Alert>
                    <CheckCircle2Icon />
                    <AlertTitle>
                        Your password has been updated. <Link to="/login" className="underline">Login</Link>
                    </AlertTitle>
                </Alert>
            )
        }

        return (
            <form onSubmit={handleSubmit}>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircleIcon />
                        <AlertTitle>{error}</AlertTitle>
                    </Alert>
                )}
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="password">New password</FieldLabel>
                        <Input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirm-password">Confirm password</FieldLabel>
                        <Input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <FieldDescription>Must be at least {MIN_PASSWORD_LENGTH} characters.</FieldDescription>
                    </Field>
                    <Field>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Saving..." : "Reset password"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
        )
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Choose a new password</CardTitle>
                    <CardDescription>Enter and confirm your new password</CardDescription>
                </CardHeader>
                <CardContent>{renderContent()}</CardContent>
            </Card>
        </div>
    )
}
