/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        soot: '#17150F',   // burnt wick — headings, dark panels
        ink: '#2A261E',    // body text
        smoke: '#6F675C',  // muted text
        ash: '#E5E2DB',    // page ground (the catalogue paper)
        wax: '#FBFAF6',    // unlit wax — cards, surfaces
        wick: '#D3CEC3',   // hairlines, borders
        ember: '#C1441E',  // the one action colour
        glow: '#FFB65C',   // light emission only — never a fill
        sea: '#3E5C63',    // Tide collection accent
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Instrument Sans"', 'system-ui', 'sans-serif'],
      },
      spacing: { 13: '3.25rem' },
      letterSpacing: { label: '0.14em' },
      borderRadius: { card: '18px' },
      boxShadow: {
        lift: '0 18px 40px -22px rgba(23,21,15,0.35)',
        lit: '0 0 60px -10px rgba(255,182,92,0.55)',
      },
      keyframes: {
        melt: { '0%': { height: '105%' }, '100%': { height: '0%' } },
        riseIn: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        flicker: {
          '0%,100%': { opacity: 0.85, transform: 'scale(1)' },
          '45%': { opacity: 1, transform: 'scale(1.06)' },
          '70%': { opacity: 0.78, transform: 'scale(0.97)' },
        },
        slideUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'none' } },
        slideLeft: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
      animation: {
        melt: 'melt 1600ms cubic-bezier(.5,.05,.3,1) 350ms forwards',
        riseIn: 'riseIn 700ms cubic-bezier(.2,.7,.2,1) both',
        flicker: 'flicker 3.2s ease-in-out infinite',
        slideUp: 'slideUp 320ms cubic-bezier(.2,.8,.2,1)',
        slideLeft: 'slideLeft 300ms cubic-bezier(.2,.8,.2,1)',
        fadeIn: 'fadeIn 220ms ease both',
      },
    },
  },
  plugins: [],
}
