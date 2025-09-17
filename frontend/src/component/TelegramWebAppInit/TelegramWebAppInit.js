// src/components/TelegramWebAppInit.js
import { useEffect } from 'react';

const TelegramWebAppInit = ({ children }) => {
    useEffect(() => {
        if (window.Telegram?.WebApp) {
            const webApp = window.Telegram.WebApp;

            webApp.ready();
            webApp.expand();

            // Обработка изменений темы
            const handleThemeChange = () => {
                document.body.style.backgroundColor = webApp.themeParams.bg_color || '#ffffff';
                document.body.style.color = webApp.themeParams.text_color || '#000000';
            };

            webApp.onEvent('themeChanged', handleThemeChange);
            handleThemeChange(); // Применяем текущую тему

            return () => {
                webApp.offEvent('themeChanged', handleThemeChange);
            };
        }
    }, []);

  return children;
};

export default TelegramWebAppInit;