import { Navigate, useLocation } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { SignIn } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useAdminAccess } from "../hooks/useAdminAccess";

export function Login() {
  const location = useLocation();
  const { isLoading, isSignedIn, isAdmin } = useAdminAccess();
  const redirectTo = location.state?.from || "/admin";

  if (isLoading) {
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
    return <Navigate to={isAdmin ? redirectTo : "/"} replace />;
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-16">
        <div className="w-full max-w-md min-w-0">
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/signup"
            afterSignInUrl="/login"
          />
        </div>
      </main>
    </div>
  );
}
