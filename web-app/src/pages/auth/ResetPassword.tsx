import { ResetPasswordForm } from "@/components/auth/reset-password-form.tsx";

export default function ResetPassword() {
    return (
        <div className="flex w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ResetPasswordForm />
            </div>
        </div>
    )
}
