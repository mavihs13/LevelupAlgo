import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import type { verifyRequestType } from "@repo/types/apiRequests/verifyRequestType";
import axios, { isAxiosError, type AxiosResponse } from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import type { verifyResponseType } from "@repo/types/apiResponse/verifyResponseType";

import type { sendMailRequestType } from "@repo/types/apiRequests/sendMailRequestType";
import type { sendMailResponseType } from "@repo/types/apiResponse/sendMailResponseType";
import RequestButton from "../others/RequestButton";

const OTP_INPUT_CLASS =
  "h-11 w-11 rounded-lg border-2 border-white/[0.12] bg-white/[0.05] text-white text-center text-lg font-bold focus:outline-none focus:border-blue-400 transition";

function VerifyPage() {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [countOfMailSent, setCountOfMailSent] = useState<number>(0);
    const [timerValue, setTimerValue] = useState<number>(0);
    const navigate = useNavigate();

    const verifyHandler = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const finalOtp = otp.join("");
        const id = toast.loading("Verifying...");
        const email = localStorage.getItem("email");

        if (finalOtp.length < 6) {
            toast.update(id, {
                render: "Enter the 6-digit code from your email",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
            return;
        }

        const body: verifyRequestType = {
            otp: finalOtp,
            email: email
        };

        try {
            const response: AxiosResponse<verifyResponseType> = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/verify`, body, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = response.data;
            if (data.error) throw new Error(data.error);
            localStorage.setItem("token", data.token);
            toast.update(id, {
                render: data.message,
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
            navigate(data.redirect ?? "/dashboard");
        } catch (err) {
            const message = isAxiosError(err)
                ? err.response?.data?.error || err.message
                : err instanceof Error
                    ? err.message
                    : "Unknown error";
            toast.update(id, { render: message, type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (!/^[0-9]?$/.test(e.target.value)) {
            e.target.value = "";
            return;
        }
        const newOtp = [...otp];
        newOtp[index] = e.target.value;
        setOtp(newOtp);
    };

    const mailHandler = async () => {
        if (timerValue > 0) return;
        const email = localStorage.getItem("email");
        const token = localStorage.getItem("token");
        if (!email) {
            toast.error("Try after logging in again!");
            navigate("/login");
            return;
        }
        const id = toast.loading("Sending mail...");
        try {
            const body: sendMailRequestType = { token, email };
            const response: AxiosResponse<sendMailResponseType> = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/auth/sendMail`,
                body,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = response.data;
            if (!data.success) throw new Error(data.error);
            toast.update(id, { render: "Check your mail", type: "success", isLoading: false, autoClose: 3000 });
            setCountOfMailSent((prev) => prev + 1);
            setTimerValue(59);
        } catch (err) {
            const message = isAxiosError(err)
                ? err.response?.data?.error || err.message
                : err instanceof Error
                    ? err.message
                    : "Unknown error";
            toast.update(id, { render: message, type: "error", isLoading: false, autoClose: 3000 });
        }
    };

    const skipHandler = () => navigate("/dashboard");

    useEffect(() => {
        if (timerValue <= 0) return;
        const interval = setInterval(() => setTimerValue((prev) => Math.max(0, prev - 1)), 1000);
        return () => clearInterval(interval);
    }, [timerValue]);

    if (!localStorage.getItem("token")) return <Navigate to="/login" />;

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-6 items-center justify-center p-8">
            <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <input
                        key={i}
                        maxLength={1}
                        type="text"
                        inputMode="numeric"
                        onChange={(e) => handleChange(e, i)}
                        className={OTP_INPUT_CLASS}
                    />
                ))}
            </div>

            <div className="flex w-full gap-3">
                {countOfMailSent === 0 && <RequestButton variant="light" text="Send Mail" onClick={mailHandler} />}
                <RequestButton variant="dark" text="Skip" onClick={skipHandler} />
            </div>
            <RequestButton text="Verify" variant="dark" onClick={(e) => verifyHandler(e)} />

            {countOfMailSent > 0 && (
                <div className="w-full flex items-center justify-center gap-1 text-sm">
                    <button
                        onClick={mailHandler}
                        className={`text-blue-400 hover:text-blue-300 font-semibold ${timerValue > 0 ? "cursor-not-allowed" : "cursor-pointer"}`}
                    >
                        Resend mail?
                    </button>
                    {timerValue > 0 && <span className="text-gray-500">{timerValue}s</span>}
                </div>
            )}
        </div>
    );
}

export default VerifyPage;
