import React from "react";

function Popup({ children, onPopUpClick, isOpen, className = "" }) {
    return (
        <div
            className={`
                fixed inset-0 flex items-center justify-center bg-black/50
                transition-all duration-200 z-10
                ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
        >
            <div
                className={`
                    p-8 relative text-center rounded-xl 
                    transition-all duration-200
                    ${isOpen ? "scale-100" : "scale-95"}
                    ${className}
                `}
            >

                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Popup;
