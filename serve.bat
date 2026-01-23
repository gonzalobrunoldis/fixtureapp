@echo off
echo Starting local development server...
echo.
echo Open your browser and navigate to:
echo   http://localhost:8000/test-widget.html  (Widget test)
echo   http://localhost:8000/index.html        (Main app)
echo.
echo Press Ctrl+C to stop the server
echo.
python -m http.server 8000
