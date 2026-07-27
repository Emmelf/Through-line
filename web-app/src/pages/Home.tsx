import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import {useState} from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {

    const [message, setMessage] = useState("")
    const { user } = useAuth();

    async function ping() {
        const response = await axios.get("/api/ping")
        console.log(response.data)
        setMessage(response.data.message)
    }

    return (
        <>
            <div className="flex flex-row justify-center mb-60">
                <div className="text-center">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight text-balance">
                        Welcome to <span className="text-blue-900">Through-line.</span>
                    </h1>
                    {user && (
                        <p className="text-lg text-gray-600 mt-4">
                            <span className="font-semibold text-blue-900">{user.username} !</span>
                        </p>
                    )}
                </div>
            </div>
            <div className="flex flex-row justify-center items-center gap-1">
                <Button variant="default" onClick={ping}> {message || "Ping"}</Button>
            </div>
        </>
    )
}