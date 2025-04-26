# StreamAll Frontend

This is the frontend application for StreamAll, a media streaming platform built with React, TypeScript, and Material-UI.

## Features

- User authentication
- Media browsing and streaming
- Responsive design
- Dark theme

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher
- Backend server running on http://localhost:5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

### Building for Production

To create a production build:
```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
  ├── assets/         # Static assets
  ├── components/     # Reusable components
  ├── features/       # Feature-specific components and logic
  ├── services/       # API services
  ├── store/          # Redux store configuration
  ├── types/          # TypeScript type definitions
  └── utils/          # Utility functions
```

## API Integration

The frontend communicates with the backend API running on port 5000. The API proxy is configured in `vite.config.ts` to handle CORS and routing.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
