export function LoadingScreen() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="text-center">
                <div className="inline-flex h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-900"></div>
                <p className="mt-4 text-sm text-gray-600">Loading...</p>
            </div>
        </div>
    );
}
