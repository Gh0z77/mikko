import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#26201C',
        cocoa: '#6F625A',
        cream: '#FFF8F3',
        shell: '#FFFFFF',
        sand: '#F7E8DB',
        orange: {
          DEFAULT: '#FE6700',
          deep: '#E05500',
          soft: '#FFE6D3',
          mist: '#FFF3EA',
        },
        pink: {
          DEFAULT: '#FFD9D9',
          soft: '#FFF1F1',
        },
        blue: {
          DEFAULT: '#D9ECFF',
          soft: '#EFF7FF',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
      boxShadow: {
        soft: '0 18px 50px -26px rgba(46, 31, 23, 0.28)',
        lift: '0 34px 70px -34px rgba(46, 31, 23, 0.38)',
        tag: '0 12px 28px -12px rgba(46, 31, 23, 0.35)',
        inset: 'inset 0 0 0 1px rgba(46, 31, 23, 0.06)',
      },
      transitionTimingFunction: {
        silk: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--tw-rotate, 0deg))' },
          '50%': { transform: 'translateY(-10px) rotate(var(--tw-rotate, 0deg))' },
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(-24px, 12px, 0)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-1.4deg)' },
          '50%': { transform: 'rotate(1.4deg)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-12deg)' },
          '45%': { transform: 'rotate(9deg)' },
          '70%': { transform: 'rotate(-5deg)' },
        },
        bearIn: {
          '0%': { transform: 'translateY(-60%) rotate(-25deg) scale(0.6)', opacity: '0' },
          '55%': { transform: 'translateY(6%) rotate(8deg) scale(1.08)', opacity: '1' },
          '75%': { transform: 'translateY(-3%) rotate(-4deg) scale(0.98)' },
          '100%': { transform: 'translateY(0) rotate(0) scale(1)' },
        },
        wordIn: {
          '0%': { clipPath: 'inset(0 100% 0 0)', transform: 'translateX(-6px)' },
          '100%': { clipPath: 'inset(0 0 0 0)', transform: 'translateX(0)' },
        },
        pop: {
          '0%': { transform: 'scale(1)' },
          '45%': { transform: 'scale(1.28)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'floatSlow 9s ease-in-out infinite',
        marquee: 'marquee 32s linear infinite',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite',
        sway: 'sway 6s ease-in-out infinite',
        wiggle: 'wiggle 700ms ease-in-out',
        'bear-in': 'bearIn 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'word-in': 'wordIn 700ms cubic-bezier(0.65, 0, 0.35, 1) 350ms both',
        pop: 'pop 420ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      aspectRatio: {
        '4/5': '4 / 5',
      },
    },
  },
  plugins: [],
};

export default config;
