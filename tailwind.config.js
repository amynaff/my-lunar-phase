/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  corePlugins: {
    space: false,
  },
  theme: {
    // NOTE to AI: You can extend the theme with custom colors or styles here.
    extend: {
      colors: {
        // Ethereal feminine palette - lighter, dreamy tones
        luna: {
          50: '#fefafc',
          100: '#fdf2f8',
          200: '#fce7f3',
          300: '#fbcfe8',
          400: '#f9a8d4',
          500: '#f472b6',
          600: '#ec4899',
          700: '#db2777',
          800: '#be185d',
          900: '#9d174d',
        },
        cosmic: {
          50: '#fdfaff',
          100: '#f5f0ff',
          200: '#ede5ff',
          300: '#ddd2fe',
          400: '#c4b5fd',
          500: '#a78bfa',
          600: '#8b5cf6',
          700: '#7c3aed',
          800: '#6d28d9',
          900: '#5b21b6',
          950: '#2e1065',
        },
        // Soft lavender and periwinkle tones
        moon: {
          50: '#f8f7ff',
          100: '#f0edff',
          200: '#e4deff',
          300: '#d1c7ff',
          400: '#b9a6f7',
          500: '#9d84ed',
          600: '#8466db',
          700: '#6d4fc4',
          800: '#5a3fa3',
          900: '#4a3485',
        },
        // Warm rose tones
        rose: {
          50: '#fff5f7',
          100: '#ffebef',
          200: '#ffd6df',
          300: '#ffb3c4',
          400: '#ff8aa6',
          500: '#ff6289',
          600: '#ed3d6b',
          700: '#d42a56',
          800: '#b02448',
          900: '#92203d',
        },
        // Soft cream/ivory for light backgrounds
        cream: {
          50: '#fffdfb',
          100: '#fefcf8',
          200: '#fdf8f0',
          300: '#faf3e6',
          400: '#f5ebd8',
          500: '#efe2ca',
        },
        night: {
          50: '#f8f6ff',
          100: '#f0edfe',
          200: '#e4ddfe',
          300: '#d0c4fc',
          400: '#b5a0f8',
          500: '#9a7cf3',
          600: '#8259e8',
          700: '#7046d4',
          800: '#5d3ab2',
          900: '#4d3192',
          950: '#1a0d36',
        },
        blush: {
          50: '#fff5f6',
          100: '#ffebee',
          200: '#ffd5dc',
          300: '#ffb3c0',
          400: '#ff8599',
          500: '#ff5777',
          600: '#ed2f55',
          700: '#c91f42',
          800: '#a71c3a',
          900: '#8b1b35',
        },
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "56px",
        "7xl": "64px",
        "8xl": "72px",
        "9xl": "80px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      const spacing = theme("spacing");

      // space-{n}  ->  gap: {n}
      matchUtilities(
        { space: (value) => ({ gap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-x-{n}  ->  column-gap: {n}
      matchUtilities(
        { "space-x": (value) => ({ columnGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-y-{n}  ->  row-gap: {n}
      matchUtilities(
        { "space-y": (value) => ({ rowGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );
    }),
  ],
};

