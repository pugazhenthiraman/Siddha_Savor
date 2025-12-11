import Link from "next/link";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md border-b border-green-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-green-600">
                Siddha Savor
              </span>
            </div>
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button href="/signup" variant="outline" size="sm">
              Sign Up
            </Button>
            <Button href="/login" variant="primary" size="sm">
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

