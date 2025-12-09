import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Light theme colors
                light: {
                    primary: '#6C8EE0',
                    secondary: '#C6B7E6',
                    background: '#FDFCFD',
                    surface: '#F5F5F7',
                    accent: '#FF7F7F',
                    success: '#7FE0B2',
                    text: {
                        primary: '#2E2E3A',
                        secondary: '#6B6B7B',
                    },
                },
                // Dark theme colors
                dark: {
                    primary: '#4DFFFE',
                    secondary: '#FF4DFF',
                    background: '#1B1B23',
                    surface: '#2A2A34',
                    text: {
                        primary: '#E6E6E6',
                        secondary: '#A0A0A0',
                    },
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                heading: ['Poppins', 'Inter', 'sans-serif'],
                serif: ['Merriweather', 'Georgia', 'serif'],
            },
            borderRadius: {
                'card': '12px',
                'button': '8px',
            },
            boxShadow: {
                'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
                'card-hover': '0 6px 18px rgba(0, 0, 0, 0.12)',
                'dark-card': '0 6px 18px rgba(0, 0, 0, 0.45)',
                'neon-blue': '0 0 20px rgba(77, 255, 254, 0.3)',
                'neon-pink': '0 0 20px rgba(255, 77, 255, 0.3)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 3s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config;
