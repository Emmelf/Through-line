import { Outlet } from "react-router-dom"
import { Header } from "@/components/layout/header.tsx"
import { Footer } from "@/components/layout/footer.tsx"

export default function MainLayout() {
    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="flex flex-1 flex-col items-center justify-center">
                <Outlet />
            </main>
            <Footer/>
        </div>
    )
}