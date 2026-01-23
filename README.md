# Fixture App

A Champions League fixtures, standings, and schedules web application.

## 🚀 Quick Start

### 1. Start Local Server
```bash
# Windows
serve.bat

# Alternative (requires Python)
python -m http.server 8000
```

### 2. Open the App
- **Widget Test**: http://localhost:8000/tests/test-widget.html (recommended first)
- **Main App**: http://localhost:8000/index.html

### 3. Navigate the App
- **Fixtures** - View matches by date (← → navigation)
- **Standings** - View league table
- **Schedule** - View full season schedule

## 📋 Features

- ⚽ Champions League fixtures with live updates
- 📊 League standings
- 📅 Full season schedule
- 🌙 Dark theme
- 📱 Mobile responsive
- ⚡ Auto-refresh every 15 seconds for live matches

## 🛠️ Tech Stack

**MVP (v1) - Current:**
- Pure HTML, CSS, JavaScript
- API-Football Widgets v3.1.0
- Python HTTP server (local dev)

**v2 - Planned:**
- Modern JavaScript framework (React/Vue/Svelte TBD)
- Custom API integration
- Backend with authentication
- Database for user data
- See `Planning/development_plan.md` for details

## 📁 Project Structure

```
Fixture/
├── .claude/              # Claude Code configuration
├── Planning/             # Product & technical planning docs
├── tests/                # All test files and documentation
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── index.html            # Main fixtures page
├── standings.html        # Standings page
├── schedule.html         # Schedule page
└── serve.bat             # Local development server
```

## 🧪 Testing

```bash
# Run automated validation
node tests/validate-mvp.js

# Manual testing
# 1. Open tests/test-widget.html in browser
# 2. Follow tests/TEST_CHECKLIST.md
# 3. See tests/TESTING.md for full guide
```

## 📖 Documentation

- **Quick Start**: This README
- **Testing Guide**: `tests/TESTING.md`
- **Development Plan**: `Planning/development_plan.md`
- **Widget Implementation**: `Planning/WIDGET_IMPLEMENTATION_PLAN.md`
- **API Documentation**: `Planning/API_DOCUMENTATION.md`
- **Claude Guide**: `.claude/claude.md`

## 🎯 Development Workflow

See `.claude/claude.md` for complete development workflow including:
- Linear ticket structure (parent + sub-issues)
- Git branching strategy
- Testing requirements
- Project naming conventions

## 🔗 API

- **Provider**: API-Football
- **Widgets**: v3.1.0 from api-sports.io
- **API Key**: Configured in HTML files
- **Rate Limit**: 100 requests/day (free tier)

## 🚀 Deployment

Deploy to any static hosting:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

See Planning/development_plan.md for deployment details.

## 📊 Project Status

**Current**: MVP (v1) - Widget-based implementation
- ✅ Day 1-2: Foundation & Core Pages (Complete)
- 🔄 Day 3: Additional Pages (In Progress - FIX-13)
- ⏳ Day 4: Enhanced Features (FIX-14)
- ⏳ Day 5: Testing & Optimization (FIX-15)
- ⏳ Day 6-7: Deploy & Launch (FIX-16)

**Linear Workspace**: Fixture App
**Team**: Fixture App

## 🤝 Contributing

This project uses Linear for task management. All features must follow the sub-issue structure defined in `.claude/claude.md`.

## 📝 License

MIT
