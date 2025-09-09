# RotateChain Frontend

A revolutionary platform that combines rotational savings groups with modern DeFi capabilities, built with React 18, TypeScript, and Tailwind CSS.

## Features

- 🔐 **Secure Authentication** - Internet Identity integration (mocked for development)
- 📊 **Dashboard** - System health monitoring and portfolio management
- 🔄 **Chain Management** - Create and manage rotational savings chains
- 👥 **Group Management** - Comprehensive group functionality
- 💰 **Pool Management** - DeFi pool interactions
- 🎨 **Modern UI** - Professional design with dark/light mode
- 📱 **Responsive** - Mobile-first responsive design
- ♿ **Accessible** - Full keyboard navigation and ARIA support

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Routing**: React Router v6
- **State Management**: TanStack Query
- **Animations**: Motion (Framer Motion)
- **Build Tool**: Vite
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Installation

1. **Clone or download this project**

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
├── components/
│   ├── common/          # Shared components (BackButton, Pagination, etc.)
│   ├── layout/          # Layout components (Header, Footer, Sidebar)
│   └── ui/              # shadcn/ui components
├── contexts/            # React contexts (Auth, Theme)
├── lib/                 # Utilities and API functions
├── pages/               # Page components
├── styles/              # Global CSS and Tailwind config
└── types/               # TypeScript type definitions
```

## Authentication

The app currently uses mock authentication for development. To log in:

1. Go to the login page
2. Click "Sign in with Internet Identity"
3. Use any mock principal ID (e.g., "user123")

## Development Notes

- All components use TypeScript for type safety
- Tailwind CSS v4 is configured with custom RotateChain theme
- Mock API data is used for development (see `lib/mockApi.ts`)
- The app is fully responsive and accessible
- Dark/light mode is implemented with system preference detection

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is private and proprietary to RotateChain.