import React from "react";

interface ButtonPropsType {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
    text: string;
    variant?: string;
}

function RequestButton(props: ButtonPropsType) {
    const variantClass =
        props.variant === "light"
            ? "bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-500"
            : "bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800";

    return (
        <button
            className={`w-full ${variantClass} text-white font-bold py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/25 min-h-[44px]`}
            onClick={props.onClick}
            type={props.type}
        >
            {props.text}
        </button>
    );
}

export default RequestButton;
