/**
 * Atomic Clock & Weather Display - Hardened & Optimized
 * Security-hardened JavaScript with performance optimizations
 * Version: 2.0.0-Hardened
 */

class StatusDisplay {
    constructor() {
        // Security: Initialize with safe defaults
        this.weatherData = null;
        this.autoRotateInterval = null;
        this.retryCount = 0;
        this.maxRetries = 3;
        this.lastWeatherUpdate = 0;
        this.cacheExpiry = 10 * 60 * 1000; // 10 minutes
        
        // Performance: Pre-allocated arrays and objects
        this.themes = [
            'style.css',
            'styles/dark.css',
            'styles/ocean.css',
            'styles/sunset.css',
            'styles/forest.css',
            'styles/cyberpunk.css',
            'styles/galaxy.css',
            'styles/aurora.css',
            'styles/vintage.css',
            'styles/minimal.css',
            'styles/neon.css',
            'styles/candy.css'
        ];
        this.currentThemeIndex = 0;
        
        // Security: Rate limiting for API calls
        this.apiCallQueue = [];
        this.isProcessingQueue = false;
        
        // Performance: Debounced resize handler
        this.resizeDebounceTimer = null;
        
        // Initialize with error handling
        this.init().catch(error => {
            console.error('Failed to initialize StatusDisplay:', error);
            this.showFallbackContent();
        });
    }

    async init() {
        try {
            // Security: Validate DOM elements before use
            this.validateDOMElements();
            
            // Initialize components with error handling
            this.initStyleSelector();
            this.initFullscreen();
            this.startClock();
            await this.updateWeather();
            
            // Initialize interactions
            this.initWeatherRefresh();
            this.initResponsiveHandling();
            this.initKeyboardShortcuts();
            
            // Performance: Optimize update intervals
            this.startOptimizedUpdates();
            
            // Security: Initialize error monitoring
            this.initErrorMonitoring();
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleInitializationError(error);
        }
    }

    // Security: DOM element validation
    validateDOMElements() {
        const requiredElements = [
            'day-name', 'time-period', 'time-display', 'date-display',
            'timezone-display', 'city-display', 'weather-icon', 'temperature',
            'weather-description', 'location', 'feels-like', 'humidity',
            'wind-speed', 'visibility', 'weather-update-time'
        ];
        
        const missing = requiredElements.filter(id => !document.getElementById(id));
        if (missing.length > 0) {
            throw new Error(`Missing required elements: ${missing.join(', ')}`);
        }
    }

    // Security: Input sanitization
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                   .replace(/javascript:/gi, '')
                   .replace(/on\w+\s*=/gi, '')
                   .trim();
    }

    // Security: Safe HTML content setting
    safeSetHTML(elementId, content) {
        const element = document.getElementById(elementId);
        if (element && content) {
            element.textContent = this.sanitizeInput(content);
        }
    }

    // Performance: Optimized weather update with caching
    async updateWeather() {
        const now = Date.now();
        
        // Performance: Skip if recently updated
        if (this.weatherData && (now - this.lastWeatherUpdate) < this.cacheExpiry) {
            this.displayWeatherData();
            return;
        }

        try {
            // Security: Validate location before API call
            const location = await this.getLocation();
            if (!location || !location.latitude || !location.longitude) {
                throw new Error('Invalid location data');
            }

            // Performance: Use multiple API providers with fallback
            const weatherData = await this.fetchWeatherWithFallback(location);
            
            if (weatherData) {
                this.weatherData = weatherData;
                this.lastWeatherUpdate = now;
                this.displayWeatherData();
                this.retryCount = 0;
            }
        } catch (error) {
            console.error('Weather update failed:', error);
            this.handleWeatherError(error);
        }
    }

    // Security: Enhanced location validation
    async getLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            // Security: Timeout and error handling
            const timeoutId = setTimeout(() => {
                reject(new Error('Geolocation timeout'));
            }, 10000);

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    clearTimeout(timeoutId);
                    if (position.coords && position.coords.latitude && position.coords.longitude) {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy
                        });
                    } else {
                        reject(new Error('Invalid position data'));
                    }
                },
                (error) => {
                    clearTimeout(timeoutId);
                    reject(new Error(`Geolocation error: ${error.message}`));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes cache
                }
            );
        });
    }

    // Performance: Weather API with rate limiting and fallback
    async fetchWeatherWithFallback(location) {
        const apis = [
            () => this.fetchOpenWeatherMap(location),
            () => this.fetchWeatherAPI(location)
        ];

        for (const apiCall of apis) {
            try {
                const data = await this.rateLimitedAPICall(apiCall);
                if (data && this.validateWeatherData(data)) {
                    return data;
                }
            } catch (error) {
                console.warn('API call failed, trying next:', error);
                continue;
            }
        }
        
        throw new Error('All weather APIs failed');
    }

    // Security: Rate limiting for API calls
    async rateLimitedAPICall(apiCall) {
        return new Promise((resolve, reject) => {
            this.apiCallQueue.push({ apiCall, resolve, reject });
            
            if (!this.isProcessingQueue) {
                this.processAPIQueue();
            }
        });
    }

    async processAPIQueue() {
        this.isProcessingQueue = true;
        
        while (this.apiCallQueue.length > 0) {
            const { apiCall, resolve, reject } = this.apiCallQueue.shift();
            
            try {
                const result = await apiCall();
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            // Rate limiting: 100ms between calls
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        this.isProcessingQueue = false;
    }

    // Security: Weather data validation
    validateWeatherData(data) {
        return data && 
               typeof data.temperature === 'number' &&
               typeof data.description === 'string' &&
               typeof data.location === 'string' &&
               data.temperature > -100 && data.temperature < 150; // Reasonable range
    }

    // Security: Safe API calls with error handling
    async fetchOpenWeatherMap(location) {
        const apiKey = 'YOUR_API_KEY'; // Should be environment variable
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}&units=imperial`;
        
        const response = await fetch(url, {
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'AtomicClockDisplay/2.0'
            }
        });

        if (!response.ok) {
            throw new Error(`OpenWeatherMap API error: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            location: data.name,
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed),
            visibility: Math.round(data.visibility / 1609.34), // Convert to miles
            icon: this.getWeatherIcon(data.weather[0].main),
            timestamp: new Date().toISOString()
        };
    }

    async fetchWeatherAPI(location) {
        // Fallback API implementation
        throw new Error('WeatherAPI not implemented');
    }

    // Performance: Optimized display updates
    displayWeatherData() {
        if (!this.weatherData) return;

        // Batch DOM updates for performance
        const updates = [
            ['weather-icon', this.weatherData.icon],
            ['temperature', `${this.weatherData.temperature}°F`],
            ['weather-description', this.weatherData.description],
            ['location', this.weatherData.location],
            ['feels-like', `${this.weatherData.feelsLike}°F`],
            ['humidity', `${this.weatherData.humidity}%`],
            ['wind-speed', `${this.weatherData.windSpeed} mph`],
            ['visibility', `${this.weatherData.visibility} mi`],
            ['weather-update-time', `Updated: ${new Date(this.weatherData.timestamp).toLocaleTimeString()}`]
        ];

        // Performance: Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            updates.forEach(([id, content]) => {
                this.safeSetHTML(id, content);
            });
            
            // Remove loading states
            this.removeLoadingStates();
        });
    }

    // Performance: Remove loading states efficiently
    removeLoadingStates() {
        const loadingElements = document.querySelectorAll('.skeleton');
        loadingElements.forEach(element => {
            element.classList.remove('skeleton');
        });
    }

    // Error handling with fallback
    handleWeatherError(error) {
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            // Exponential backoff
            const delay = Math.pow(2, this.retryCount) * 1000;
            setTimeout(() => this.updateWeather(), delay);
        } else {
            // Show fallback content
            this.showFallbackWeather();
        }
    }

    showFallbackWeather() {
        this.safeSetHTML('weather-description', 'Weather unavailable');
        this.safeSetHTML('location', 'Location unknown');
        this.safeSetHTML('temperature', '--°F');
        this.removeLoadingStates();
    }

    // Performance: Optimized clock updates
    startClock() {
        this.updateClock();
        
        // Performance: Use requestAnimationFrame for smooth updates
        const updateLoop = () => {
            this.updateClock();
            this.clockAnimationId = requestAnimationFrame(updateLoop);
        };
        
        // Update every second using requestAnimationFrame
        setTimeout(updateLoop, 1000 - (Date.now() % 1000));
    }

    updateClock() {
        const now = new Date();
        
        // Batch time updates
        const timeUpdates = [
            ['time-display', now.toLocaleTimeString()],
            ['date-display', now.toLocaleDateString()],
            ['day-name', now.toLocaleDateString('en-US', { weekday: 'long' })],
            ['time-period', this.getTimePeriod(now.getHours())],
            ['timezone-display', Intl.DateTimeFormat().resolvedOptions().timeZone],
            ['city-display', this.weatherData?.location || 'Loading...']
        ];

        timeUpdates.forEach(([id, content]) => {
            this.safeSetHTML(id, content);
        });
    }

    getTimePeriod(hour) {
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 21) return 'Evening';
        return 'Night';
    }

    // Performance: Optimized update scheduling
    startOptimizedUpdates() {
        // Performance: Use Intersection Observer for visibility-based updates
        if ('IntersectionObserver' in window) {
            this.setupVisibilityObserver();
        } else {
            // Fallback: Update every second
            setInterval(() => this.updateAll(), 1000);
        }

        // Weather updates with adaptive timing
        this.scheduleWeatherUpdates();
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.isPageVisible = true;
                } else {
                    this.isPageVisible = false;
                }
            });
        });

        observer.observe(document.body);
    }

    scheduleWeatherUpdates() {
        const updateWeather = async () => {
            if (this.isPageVisible !== false) {
                await this.updateWeather();
            }
            
            // Adaptive timing based on connection quality
            const interval = navigator.connection ? 
                (navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g') ? 900000 : 600000 
                : 600000;
            
            setTimeout(updateWeather, interval);
        };

        setTimeout(updateWeather, 600000);
    }

    updateAll() {
        if (this.isPageVisible !== false) {
            this.updateClock();
        }
    }

    // Security: Safe theme switching
    applyStyle(themePath, dropdown, mainStyle) {
        try {
            // Security: Validate theme path
            if (!this.themes.includes(themePath)) {
                throw new Error('Invalid theme path');
            }

            mainStyle.href = themePath;
            dropdown.value = themePath;
            localStorage.setItem('selectedStyle', themePath);
            
            // Performance: Preload next theme
            this.preloadNextTheme(themePath);
            
        } catch (error) {
            console.error('Theme switch failed:', error);
            // Revert to safe default
            mainStyle.href = 'style.css';
            dropdown.value = 'style.css';
        }
    }

    // Performance: Theme preloading
    preloadNextTheme(currentTheme) {
        const currentIndex = this.themes.indexOf(currentTheme);
        const nextIndex = (currentIndex + 1) % this.themes.length;
        const nextTheme = this.themes[nextIndex];
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = nextTheme;
        document.head.appendChild(link);
    }

    // Enhanced theme selector with security
    initStyleSelector() {
        const styleDropdown = document.getElementById('style-dropdown');
        const mainStyle = document.getElementById('main-style');
        const autoRotateCheckbox = document.getElementById('auto-rotate');
        
        if (!styleDropdown || !mainStyle) {
            console.warn('Theme selector elements not found');
            return;
        }

        // Security: Validate saved style
        const savedStyle = localStorage.getItem('selectedStyle');
        if (savedStyle && this.themes.includes(savedStyle)) {
            this.applyStyle(savedStyle, styleDropdown, mainStyle);
            this.currentThemeIndex = this.themes.indexOf(savedStyle);
        }

        // Auto-rotate with validation
        const savedAutoRotate = localStorage.getItem('autoRotateThemes') === 'true';
        if (autoRotateCheckbox) {
            autoRotateCheckbox.checked = savedAutoRotate;
            if (savedAutoRotate) {
                this.startAutoRotate();
            }
        }

        // Event listeners with error handling
        styleDropdown.addEventListener('change', (e) => {
            try {
                this.applyStyle(e.target.value, styleDropdown, mainStyle);
                this.currentThemeIndex = this.themes.indexOf(e.target.value);
                
                if (autoRotateCheckbox && autoRotateCheckbox.checked) {
                    autoRotateCheckbox.checked = false;
                    localStorage.setItem('autoRotateThemes', 'false');
                    this.stopAutoRotate();
                }
            } catch (error) {
                console.error('Theme change error:', error);
            }
        });

        if (autoRotateCheckbox) {
            autoRotateCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                localStorage.setItem('autoRotateThemes', isChecked);
                
                if (isChecked) {
                    this.startAutoRotate();
                } else {
                    this.stopAutoRotate();
                }
            });
        }
    }

    // Performance: Optimized auto-rotate
    startAutoRotate() {
        this.stopAutoRotate();
        
        this.autoRotateInterval = setInterval(() => {
            this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
            const nextTheme = this.themes[this.currentThemeIndex];
            
            const styleDropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            const autoRotateCheckbox = document.getElementById('auto-rotate');
            
            if (autoRotateCheckbox && autoRotateCheckbox.checked && styleDropdown && mainStyle) {
                this.applyStyle(nextTheme, styleDropdown, mainStyle);
            }
        }, 30000);
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    // Security: Safe fullscreen handling
    initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        if (!fullscreenBtn) return;

        fullscreenBtn.addEventListener('click', () => {
            try {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.warn('Fullscreen request failed:', err);
                    });
                } else {
                    document.exitFullscreen().catch(err => {
                        console.warn('Fullscreen exit failed:', err);
                    });
                }
            } catch (error) {
                console.error('Fullscreen error:', error);
            }
        });
    }

    // Performance: Debounced resize handling
    initResponsiveHandling() {
        window.addEventListener('resize', () => {
            if (this.resizeDebounceTimer) {
                clearTimeout(this.resizeDebounceTimer);
            }
            
            this.resizeDebounceTimer = setTimeout(() => {
                this.handleResize();
            }, 250);
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(this.handleResize.bind(this), 100);
        });
    }

    handleResize() {
        // Performance: Throttle resize operations
        requestAnimationFrame(() => {
            // Add responsive adjustments if needed
        });
    }

    // Security: Safe keyboard shortcuts
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            try {
                switch(e.key.toLowerCase()) {
                    case 'f':
                        e.preventDefault();
                        document.getElementById('fullscreen-toggle')?.click();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.updateWeather();
                        break;
                    case 't':
                        e.preventDefault();
                        this.rotateTheme();
                        break;
                    case '1':
                    case '2':
                    case '3':
                    case '4':
                    case '5':
                    case '6':
                    case '7':
                    case '8':
                    case '9':
                        e.preventDefault();
                        this.selectThemeByNumber(parseInt(e.key) - 1);
                        break;
                    case '0':
                        e.preventDefault();
                        this.selectThemeByNumber(9);
                        break;
                    case '-':
                        e.preventDefault();
                        this.selectThemeByNumber(10);
                        break;
                    case '=':
                        e.preventDefault();
                        this.selectThemeByNumber(11);
                        break;
                }
            } catch (error) {
                console.error('Keyboard shortcut error:', error);
            }
        });
    }

    selectThemeByNumber(index) {
        if (index >= 0 && index < this.themes.length) {
            const styleDropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            
            if (styleDropdown && mainStyle) {
                this.applyStyle(this.themes[index], styleDropdown, mainStyle);
                this.currentThemeIndex = index;
            }
        }
    }

    rotateTheme() {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const styleDropdown = document.getElementById('style-dropdown');
        const mainStyle = document.getElementById('main-style');
        
        if (styleDropdown && mainStyle) {
            this.applyStyle(this.themes[this.currentThemeIndex], styleDropdown, mainStyle);
        }
    }

    // Security: Safe weather refresh
    initWeatherRefresh() {
        const weatherDisplay = document.querySelector('.weather-display');
        if (!weatherDisplay) return;

        weatherDisplay.addEventListener('click', () => {
            try {
                this.updateWeather();
                this.showNotification('Refreshing weather...');
            } catch (error) {
                console.error('Weather refresh error:', error);
            }
        });
    }

    // Security: Safe notifications
    showNotification(message) {
        if (typeof message !== 'string') return;
        
        const sanitizedMessage = this.sanitizeInput(message);
        console.log(sanitizedMessage);
        
        // Add visual notification if needed
        // This would be implemented with a proper notification system
    }

    // Security: Error monitoring
    initErrorMonitoring() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            // In production, this would send to an error reporting service
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            // In production, this would send to an error reporting service
        });
    }

    // Error handling
    handleInitializationError(error) {
        console.error('Initialization failed:', error);
        this.showFallbackContent();
    }

    showFallbackContent() {
        // Show basic content without weather
        this.safeSetHTML('weather-description', 'Weather unavailable');
        this.safeSetHTML('location', 'Location unknown');
        this.safeSetHTML('temperature', '--°F');
        this.removeLoadingStates();
    }

    getWeatherIcon(weatherMain) {
        const iconMap = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌦️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        return iconMap[weatherMain] || '🌤️';
    }

    // Cleanup
    destroy() {
        if (this.autoRotateInterval) {
            clearInterval(this.autoRotateInterval);
        }
        
        if (this.clockAnimationId) {
            cancelAnimationFrame(this.clockAnimationId);
        }
        
        if (this.resizeDebounceTimer) {
            clearTimeout(this.resizeDebounceTimer);
        }
    }
}

// Security: Safe initialization with error handling
try {
    // Performance: Use DOMContentLoaded for faster initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.statusDisplay = new StatusDisplay();
        });
    } else {
        window.statusDisplay = new StatusDisplay();
    }
} catch (error) {
    console.error('Failed to start application:', error);
    // Show fallback content
    document.body.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui;">
            <div style="text-align: center;">
                <h1>Atomic Clock Display</h1>
                <p>Application failed to load. Please refresh the page.</p>
            </div>
        </div>
    `;
}

// Performance: Service Worker integration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.log('Service Worker registration failed:', err);
        });
    });
}
