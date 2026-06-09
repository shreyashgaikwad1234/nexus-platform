import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            const isDarkTheme = document.documentElement.classList.contains('dark');
            setIsDark(isDarkTheme);
        };

        // Check on mount
        checkTheme();

        // Listen for custom event from Layout.astro
        window.addEventListener('themechange', checkTheme);
        
        // Also listen for mutation to catch changes immediately
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            window.removeEventListener('themechange', checkTheme);
            observer.disconnect();
        };
    }, []);

    return isDark;
};
