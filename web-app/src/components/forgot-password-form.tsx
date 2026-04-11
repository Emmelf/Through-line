import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

export function ForgotPasswordForm({
   className,
   ...props
}: React.ComponentProps<"div">) {
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
                    <form>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input id="email" type="email" placeholder="m@example.com" required/>
                            </Field>

                            <Field>
                                <Button type="submit" className="w-full">Send reset link</Button>

                                <FieldDescription className="text-center">
                                    Remember your password ?
                                    <Link to="/login" className="ms-1 underline underline-offset-4 hover:underline">
                                        Login
                                    </Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}