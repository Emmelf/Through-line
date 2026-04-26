import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

export function Footer() {
    return (
        <footer>
            <Separator />

            <div className='mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 max-md:flex-col sm:px-6 sm:py-6 md:gap-6 md:py-8'>

                    <div className='flex items-center gap-3'>
                        <Link to="/" className="flex items-center gap-2 font-semibold">
                            <img src="/emmelfpfp.svg" alt="logo" className="h-5 w-5" />
                            <span>Through-line.</span>
                        </Link>
                    </div>

                <div className='flex items-center gap-5 whitespace-nowrap'>
                    <button className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
                        About
                    </button>
                    <button className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
                        Features
                    </button>
                    <button className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
                        Works
                    </button>
                    <button className='opacity-80 transition-opacity duration-300 hover:opacity-100'>
                        Career
                    </button>
                </div>
            </div>

        </footer>
    )
}