import React from "react";

const textVariants = {
    default: "text-2xl text-text font-secondary font-normal",
    titulo: "text-3xl text-text font-primary font-normal",
    muted: "text-lg text-text-secondary font-secondary font-normal"
}

function TypographyUI({ as: Component = "span", children, variant = "", className = "", ...props }) {
    return (
        <Component className={`${textVariants[variant]} ${className}`} {...props}>
            {children}
        </Component>
    )
}

export default TypographyUI