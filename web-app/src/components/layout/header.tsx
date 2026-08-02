import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu.tsx"
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <header className="w-full border-b bg-background">
            <div className="flex h-14 items-center md:gap-15 px-4">

                <Link to="/" className="flex items-center gap-2 font-semibold">
                    <img src="/emmelfpfp.svg" alt="logo" className="h-5 w-5" />
                    <span>Through-line.</span>
                </Link>

                <NavigationMenu className="hidden md:block">
                    <NavigationMenuList className="flex gap-6">

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/" className="text-sm font-medium">
                                    Home
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/" className="text-sm font-medium">
                                    Services
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/" className="text-sm font-medium">
                                    Projects
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <NavigationMenuLink asChild>
                                <Link to="/" className="text-sm font-medium">
                                    Contact
                                </Link>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                    </NavigationMenuList>
                </NavigationMenu>

                <div className="ml-auto flex items-center gap-2">
                    {user ? (
                        <>
                            <span className="text-sm font-medium text-gray-700">
                                {user.username}
                            </span>
                            <Button variant="destructive" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline">Login</Button>
                            </Link>

                            <Link to="/register">
                                <Button>Register</Button>
                            </Link>
                        </>
                    )}
                </div>

            </div>
        </header>
    )
}