import {Link} from "react-router-dom";

export default function Home() {
    return (
        <div className="flex flex-wrap">
            <div className="w-full sm:w-8/12 mb-10">
                <div className="container mx-auto h-full sm:p-10">
                    <nav className="flex px-4 justify-between items-center">
                        <div className="text-4xl font-bold">
                            Through-line<span className="text-violet-950">.</span>
                        </div>
                    </nav>
                    <header className="container px-4 lg:flex mt-10 items-center h-full lg:mt-0">
                        <div className="w-full">
                            <h1 className="text-4xl lg:text-6xl font-bold">Landing page for testing <span
                                className="text-violet-950"><a className="underline" target="_blank" href="https://tailwindcss.com">tailwindcss</a></span></h1>
                            <div className="w-20 h-2 bg-violet-950 my-4"></div>
                            <Link to="/login">
                                <button className="bg-purple-950 text-white text-2xl font-medium px-4 py-2 rounded shadow">Login</button>
                            </Link>
                        </div>
                    </header>
                </div>
            </div>
            <img
                src="https://blogger.googleusercontent.com/img/a/AVvXsEjmXHv8rWwVRYgNS_AYPdiQEFWFHoH3GHcc6c94DJXGZA-oOpxULRZNkXeaBrTqIjHpv6H4LPH2tKNBFIIK4uMe4LE4VB7CKMpQAMEiMQxqfl-Or5LB9ajZAxqiN60kUGk-K6AZbF-_V9CBO-UvEBJsFII8uW3gVom361utXqZx2sI4anD1ErDXy1s3biRa"
                alt="CyberpunkCity-wallpaperize" className="w-full h-48 object-cover sm:h-screen sm:w-4/12"/>
        </div>
    )
}