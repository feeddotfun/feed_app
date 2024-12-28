/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
	  './pages/**/*.{ts,tsx}',
	  './components/**/*.{ts,tsx}',
	  './constants/**/*.{ts,tsx}',
	  './app/**/*.{ts,tsx}',
	],
	theme: {
	  container: {
		center: true,
		padding: '2rem',
		screens: {
		  '2xl': '1400px'
		}
	  },
	  extend: {
		colors: {
		  border: 'hsl(var(--border))',
		  input: 'hsl(var(--input))',
		  ring: 'hsl(var(--ring))',
		  background: 'hsl(var(--background))',
		  foreground: 'hsl(var(--foreground))',
		  primary: {
			DEFAULT: 'hsl(var(--primary))',
			foreground: 'hsl(var(--primary-foreground))'
		  },
		  secondary: {
			DEFAULT: 'hsl(var(--secondary))',
			foreground: 'hsl(var(--secondary-foreground))'
		  },
		  destructive: {
			DEFAULT: 'hsl(var(--destructive))',
			foreground: 'hsl(var(--destructive-foreground))'
		  },
		  muted: {
			DEFAULT: 'hsl(var(--muted))',
			foreground: 'hsl(var(--muted-foreground))'
		  },
		  accent: {
			DEFAULT: 'hsl(var(--accent))',
			foreground: 'hsl(var(--accent-foreground))'
		  },
		  popover: {
			DEFAULT: 'hsl(var(--popover))',
			foreground: 'hsl(var(--popover-foreground))'
		  },
		  card: {
			DEFAULT: 'hsl(var(--card))',
			foreground: 'hsl(var(--card-foreground))'
		  },
		  // Feed.fun colors
		  brand: {
			DEFAULT: '#99FF19',
			50: '#F2FFE6',
			100: '#E6FFD9',
			200: '#CCFFB3',
			300: '#B3FF8C',
			400: '#99FF66',
			500: '#99FF19',
			600: '#7ACC14',
			700: '#5C990F',
			800: '#3D660A',
			900: '#1F3305',
		  },
		  dark: {
			DEFAULT: '#0A0A0A',
			50: '#404040',
			100: '#333333',
			200: '#262626',
			300: '#1A1A1A',
			400: '#0D0D0D',
			500: '#0A0A0A',
			600: '#000000',
		  }
		},
		borderRadius: {
		  lg: 'var(--radius)',
		  md: 'calc(var(--radius) - 2px)',
		  sm: 'calc(var(--radius) - 4px)'
		},
		keyframes: {
		  'accordion-down': {
			from: { height: 0 },
			to: { height: 'var(--radix-accordion-content-height)' }
		  },
		  'accordion-up': {
			from: { height: 'var(--radix-accordion-content-height)' },
			to: { height: 0 }
		  },
		  'spin-slow': {
			from: { transform: 'rotate(0deg)' },
			to: { transform: 'rotate(360deg)' }
		  },
		  'background-shine': {
			from: { backgroundPosition: '0 0' },
			to: { backgroundPosition: '-200% 0' }
		  }
		},
		animation: {
		  'accordion-down': 'accordion-down 0.2s ease-out',
		  'accordion-up': 'accordion-up 0.2s ease-out',
		  'spin-slow': 'spin-slow 20s linear infinite',
		  'background-shine': 'background-shine 2s linear infinite'
		}
	  }
	},
	plugins: [require('tailwindcss-animate')]
  };