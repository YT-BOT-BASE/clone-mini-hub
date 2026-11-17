/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#07030f',
        panel: '#0e0821',
        card: '#150c2e',
        neon: '#8b5cf6',
        electric: '#22d3ee',
        glow: '#a78bfa',
      },
      fontFamily: {
        display: ['Orbitron', 'Segoe UI', 'sans-serif'],
        body: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 24px rgba(139, 92, 246, 0.45)',
        electric: '0 0 24px rgba(34, 211, 238, 0.35)',
      },
      keyframes: {
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow: { '0%, 100%': { opacity: 0.6 }, '50%': { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(24px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        slideUp: 'slideUp 0.6s ease-out both',
        fadeIn: 'fadeIn 0.5s ease-out both',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
};
