// Widget configuration utilities
// This file can be used for additional widget customization in the future

// Example: Function to update widget theme dynamically
function updateWidgetTheme(theme) {
  const configWidget = document.querySelector('[data-type="config"]');
  if (configWidget) {
    configWidget.setAttribute('data-theme', theme);
  }
}

// Example: Function to update widget language
function updateWidgetLanguage(lang) {
  const configWidget = document.querySelector('[data-type="config"]');
  if (configWidget) {
    configWidget.setAttribute('data-lang', lang);
  }
}

// Export functions for use in other scripts if needed
window.widgetConfig = {
  updateTheme: updateWidgetTheme,
  updateLanguage: updateWidgetLanguage
};
