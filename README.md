# Keyboard Practice Pro

A modern, feature-rich typing practice application to improve your typing speed and accuracy.

## Features

### Core Features
- **Real-time Character Highlighting** - Visual feedback as you type with color-coded correctness
- **Multiple Difficulty Levels** - Easy, Medium, and Hard word banks
- **Two Game Modes**
  - Word Mode: Type complete words at your own pace
  - Timer Mode: Race against the clock (30s, 60s, 120s)
- **Statistics Tracking** - WPM, accuracy, tests completed, best WPM
- **Test History** - View and manage your past performance with localStorage persistence

### New Features (v2.0)
1. **Dark/Light Mode Toggle** - Theme persistence with smooth transitions
2. **Comprehensive Word Banks** - 100+ easy words, 100+ medium words, 100+ complex words
3. **Results Modal** - Beautiful post-test statistics breakdown
4. **Keyboard Shortcuts** - Space to start, Tab to skip words, Escape to close modals
5. **Responsive Design** - Works perfectly on mobile, tablet, and desktop

### UI/UX Features
- Modern Inter font family
- Smooth micro-interactions and hover effects
- Accessible design with proper focus states
- WCAG 2.1 compliant color contrast
- Reduced motion support for accessibility
- Print-friendly styles

## Tech Stack

- **HTML5** - Semantic markup
- **CSS3** - CSS Variables, Flexbox, Grid, Animations
- **Vanilla JavaScript** - No dependencies, pure ES6+
- **LocalStorage API** - Persistent data storage

## Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser

Or serve locally:

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

### Usage

1. Select your difficulty level (Easy, Medium, Hard)
2. Choose your game mode (Words or Timer)
3. Click "Start Test" or press Space
4. Type the displayed word as accurately and quickly as possible
5. View your results in the modal after completion
6. Track your progress in the history section

### Game Controls

- **Space** - Start test (when not typing)
- **Tab** - Skip to next word
- **Escape** - Close modal

## Data Persistence

All data is stored locally in your browser:
- Theme preference (light/dark mode)
- Statistics (total tests, best WPM)
- Test history (up to 50 entries)

To clear data:
- Use "Clear All" in the history section
- Or clear browser data for this site

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

## File Structure

```
11-web-keyboard-practice/
├── index.html       # Complete application (HTML + CSS + JS)
├── README.md        # This file
└── package.json     # Project metadata
```

## Architecture

### Single-File Architecture

This application uses a progressive enhancement pattern with all code in a single HTML file:

```
index.html
├── <head>
│   ├── Meta tags & SEO
│   ├── Internal CSS (<style>)
│   │   ├── CSS Variables (theming)
│   │   ├── Reset & Base Styles
│   │   ├── Layout (Flexbox/Grid)
│   │   ├── Component Styles
│   │   └── Responsive Queries
│   └── Preconnect (fonts)
└── <body>
    ├── Header (logo, controls)
    ├── Main (game area, results)
    ├── Internal JavaScript (<script>)
    │   ├── State Management
    │   ├── DOM Elements Cache
    │   ├── Game Logic (word selection, timer)
    │   ├── Input Handling (typing, validation)
    │   ├── Statistics (WPM, accuracy)
    │   ├── UI Updates (highlighting, modal)
    │   ├── Storage (localStorage)
    │   └── Event Listeners
    └── Footer
```

### Core Patterns

- **State Object**: Centralized application state
- **Event Delegation**: Efficient event handling
- **localStorage**: Persistent data without backend
- **CSS Variables**: Dynamic theming (light/dark)
- **requestAnimationFrame**: Smooth animations
- **Debouncing**: Optimized input handling

### Data Flow

```
User Input → Event Listener → Validation → State Update → UI Render → Storage
```

## Deployment

## Performance

- **Load Time**: <100ms
- **First Contentful Paint**: <200ms
- **Bundle Size**: ~35KB (single HTML file)
- **Runtime Memory**: Minimal (vanilla JS)

## Accessibility

- Full keyboard navigation support
- ARIA labels and roles
- Focus indicators
- Screen reader friendly
- High contrast mode support
- Reduced motion support

## Credits

Developed as a modern typing practice tool for improving keyboard skills.

## License

MIT License - Free to use and modify.

## Deployment

### Quick Deploy

Since this is a static HTML file, you can deploy it anywhere:

```bash
# Deploy to Vercel (recommended)
npm install -g vercel
vercel

# Deploy to Netlify
npm install -g netlify-cli
netlify deploy --prod

# Deploy to GitHub Pages
# Settings → Pages → Source: main branch
```

### Live Demos

| Platform | URL |
|----------|-----|
| Vercel | [Deployed Link] |
| Netlify | [Deployed Link] |
| GitHub Pages | [Deployed Link] |

### Custom Domain

After deploying, add a custom domain:
1. Go to platform settings
2. Add your domain (e.g., typing.yourdomain.com)
3. Update DNS records (CNAME)
4. Enable SSL/HTTPS (automatic)

## Contributing

Contributions are welcome! Here's how you can help:

### Setup

```bash
git clone https://github.com/mk-knight23/11-web-keyboard-practice.git
cd 11-web-keyboard-practice
npm start
```

### Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Edit `index.html` (HTML/CSS/JS all in one file)
3. Test locally in multiple browsers
4. Submit a pull request

### Feature Ideas

- Add more word languages (Spanish, French, etc.)
- Sound effects on typing
- Multiplayer typing races
- Leaderboards with cloud sync
- Typing practice with code snippets
- Voice dictation mode

### Code Style

- Use semantic HTML5
- Follow existing CSS conventions
- Write clean ES6+ JavaScript
- Add comments for complex logic
- Ensure accessibility (ARIA, keyboard nav)

---

Built with ❤️ by MK
