/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],

  variants: {
    extend: {
      display: ["group-hover"],
    },
  },

  theme: {
    extend: {},
  },

  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#111827",

          secondary: "#c9207a",

          accent: "#e2bd8c",

          neutral: "#1c1917",

          "base-100": "#0e1421",

          info: "#A6C5E2",

          success: "#84cc16",

          warning: "#ea580c",

          error: "#E56A5D",
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
