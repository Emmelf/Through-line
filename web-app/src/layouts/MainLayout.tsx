import { Outlet } from "react-router-dom"
import { Header } from "@/components/header"

export default function MainLayout() {
    return (
        <>
            <Header />
            <main className="w-full">
                <Outlet />
            </main>
        </>
    )
}