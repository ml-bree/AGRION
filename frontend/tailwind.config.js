/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // AgriConnect brand palette
        harvest: "#1f7a3d",
        soil: "#6b4423",
        savanna: "#e8c44d",
      },
    },
  },
  plugins: [],
};
