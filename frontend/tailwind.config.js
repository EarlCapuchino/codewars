/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: '#00ff41',
          bright: '#33ff66',
          dim: '#00cc33',
          dark: '#00aa22',
          muted: '#006618',
          bg: '#001a00',
        },
        amber: {
          terminal: '#ffb000',
          bright: '#ffc333',
          dim: '#cc8800',
          dark: '#995500',
        },
        crt: {
          black: '#0a0e0a',
          surface: '#0d140d',
          lighter: '#142014',
          border: '#1a3a1a',
          highlight: '#1f4f1f',
        },
        win: {
          titlebar: '#003318',
          'titlebar-active': '#004d26',
          button: '#001a0d',
          'button-hover': '#002a15',
          gray: '#c0c0c0',
        },
        error: {
          red: '#ff0033',
          dim: '#cc0029',
          bg: '#1a0005',
          border: '#3a0011',
        },
      },
      fontFamily: {
        terminal: ['"VT323"', '"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'scanline-move': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%': { opacity: '0.97' },
          '5%': { opacity: '0.95' },
          '10%': { opacity: '0.98' },
          '15%': { opacity: '0.96' },
          '20%': { opacity: '0.99' },
          '100%': { opacity: '0.98' },
        },
        'glow-pulse': {
          '0%, 100%': { textShadow: '0 0 4px #00ff41, 0 0 8px #00ff4180' },
          '50%': { textShadow: '0 0 8px #00ff41, 0 0 16px #00ff4180, 0 0 24px #00ff4140' },
        },
        typewriter: {
          '0%': { width: '0' },
          '100%': { width: '100%' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '60%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        blink: 'blink 1s step-end infinite',
        scanline: 'scanline-move 8s linear infinite',
        flicker: 'flicker 4s infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.3s ease-out',
        'bounce-in': 'bounce-in 0.4s ease-out',
      },
      boxShadow: {
        'crt-glow': '0 0 20px rgba(0, 255, 65, 0.1), inset 0 0 60px rgba(0, 255, 65, 0.03)',
        'terminal-inset': 'inset 1px 1px 3px rgba(0, 0, 0, 0.8), inset -1px -1px 1px rgba(0, 255, 65, 0.05)',
        'win-raised': '1px 1px 0 #001a00, -1px -1px 0 #00ff4130',
        'win-pressed': 'inset 1px 1px 0 #001a00, inset -1px -1px 0 #00ff4130',
      },
    },
  },
  plugins: [],
};
