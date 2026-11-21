import { Eye, EyeOff, Mail } from "lucide-react";
import { useState } from "react";
import type { loginRequestType } from "@repo/types/apiRequests/loginRequestType";
import axios, { isAxiosError, type AxiosResponse } from "axios";
import type { loginResponseType } from "@repo/types/apiResponse/loginResponseType";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const inputClass =
  "w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 transition-colors";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldsEmpty, setFieldsEmpty] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setFieldsEmpty(true);
      toast.error("Please fill in your email and password.");
      return;
    }
    setFieldsEmpty(false);
    const id = toast.loading("Logging in...");

    try {
      const body: loginRequestType = { email, password };
      const response: AxiosResponse<loginResponseType> = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/login`,
        body
      );
      const data = response.data;
      if (!data.success) throw new Error(data.error);

      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      if (data.isVerified) navigate("/dashboard");
      else navigate(data.redirect ?? "/login");

      toast.update(id, { render: data.message, type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      const message = isAxiosError(err) ? err.response?.data?.error || err.message : err instanceof Error ? err.message : "Unknown error";
      toast.update(id, { render: message, type: "error", isLoading: false, autoClose: 3000 });
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div className="relative">
        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass + " pl-10"}
          autoComplete="email"
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          autoComplete="current-password"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-300 transition"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {fieldsEmpty && <p className="text-xs text-red-400 font-medium">Please fill in both fields.</p>}

      <button
        type="button"
        onClick={(e) => handleLogin(e)}
        className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-500 text-white font-semibold py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
      >
        Login
      </button>

      <p className="text-xs text-center text-gray-500">JWT-secured session · you stay signed in across the app</p>
    </form>
  );
}
