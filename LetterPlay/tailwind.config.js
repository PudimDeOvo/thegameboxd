/** @type {import('tailwindcss').Config} */

export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],


    theme: {
        extend: {
            colors: {
                text: "#FFF",
                primary: "#573798",
                secondary: "#C8AEFF",
                background: "#1D1A21",
                "text-secondary": "#9E9E9E"
            },

            boxShadow: {
                shadowEffect: "0px 11px 7px rgba(0,0,0,0.02), \
         0px 7px 7px rgba(0,0,0,0.03), \
         0px 4px 6px rgba(0,0,0,0.06), \
         0px 2px 4px rgba(0,0,0,0.10), \
         0px 0px 2px rgba(0,0,0,0.12), \
         inset 0px 2px 3px rgba(255,255,255,0.10)"
            },

            fontFamily: {
                primary: ["Calistoga", "sans-serif"],
                secondary: ["Montserrat", "sans-serif"]
            },
        },
    },
    plugins: [],
};

