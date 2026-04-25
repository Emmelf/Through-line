import { Outlet } from "react-router-dom"
import { Header } from "@/components/layout/header.tsx"
import { Footer } from "@/components/layout/footer.tsx"

export default function MainLayout() {
    return (
        <div className="flex min-h-svh flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer/>
        </div>
    )
}