// src/components/Navigation.tsx

export default function Footer() {
    return (
        <footer className="bg-gray-900 py-12 border-t border-gray-800">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-6 md:mb-0">
                        <div className="text-xl font-bold text-white">
                            SKomp<span className="text-blue-500">X</span>cel <span className="font-light">Calibrate</span>
                        </div>
                        <p className="text-gray-400 mt-1">A product by SKompXcel Academic Solutions</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end">
                        <p className="text-gray-400">© 2024 SKompXcel Calibrate. All rights reserved.</p>
                        <div className="flex space-x-4 mt-2">
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Privacy Policy</a>
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Terms of Service</a>
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">Contact</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}