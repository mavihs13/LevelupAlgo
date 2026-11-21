import { useNavigate } from "react-router-dom";
import LoginForm from "../util-components/AuthComponents/LoginForm";
import RegisterForm from "../util-components/AuthComponents/RegisterForm";
import VerifyPage from "../util-components/AuthComponents/VerifyPage";

export default function AuthUI({ page }: { page?: string }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (page === "Login") navigate("/register");
    else navigate("/login");
  };

  const isVerify = page === "Verify";
  const title = page === "Login" ? "Sign in to LevelupAlgo" : page === "Register" ? "Create your account" : "Verify your email";
  const subtitle = page === "Login" ? "Welcome back — log in with your account" : page === "Register" ? "Join the next generation of DSA practice" : "Enter the 6-digit code from your email";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1220] via-[#0b0e18] to-[#06090d] px-4">
      <div className="w-full max-w-md bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-10">
        <div className="flex flex-col items-center text-center mb-7">
          <img src="/logo.png" alt="logo" className="w-11 h-11 sm:w-12 sm:h-12" />
          <h2 className="font-display font-bold text-2xl tracking-tight text-white mt-3">{title}</h2>
          <p className="text-sm text-gray-400 mt-1.5">{subtitle}</p>
        </div>

        {page === "Login" ? <LoginForm /> : page === "Register" ? <RegisterForm /> : <VerifyPage />}

        {!isVerify && (
          <p className="text-sm text-center mt-5">
            {page === "Login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={handleNavigate}
              className="font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              {page === "Login" ? "Register here" : "Log in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
