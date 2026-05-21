import { Navigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SignUp, useUser } from "@clerk/clerk-react";
import { Loader } from "lucide-react";

export function Signup() {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
          <div className="text-stone-500 text-sm tracking-wide">
            <Loader />
          </div>
        </main>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
        <div className="w-full max-w-md min-w-0">
          <SignUp
            routing="path"
            path="/signup"
            signInUrl="/login"
            afterSignUpUrl="/"
          />
        </div>
      </main>
    </div>
  );
}
