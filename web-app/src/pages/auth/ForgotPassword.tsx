import {ForgotPasswordForm} from "@/components/forgot-password-form.tsx";

export default function ForgotPassword() {
    return (
        <div className="flex w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <ForgotPasswordForm />
            </div>
        </div>
    )
}