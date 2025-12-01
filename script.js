class StatusDisplay {
    constructor() {
        this.weatherData = null;
        this.autoRotateInterval = null;
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
        this.init();
    }

    async init() {
        this.initStyleSelector();
        this.initFullscreen();
        this.startClock();
        await this.updateWeather();
        
        // Add click-to-refresh weather functionality
        this.initWeatherRefresh();
        
        // Add window resize listener for dynamic adjustment
        this.initResponsiveHandling();
        
        // Update every second
        setInterval(() => this.updateAll(), 1000);
        
        // Weather updates every 10 minutes
        setInterval(() => this.updateWeather(), 600000);
    }

    initWeatherRefresh() {
        const weatherDisplay = document.querySelector('.weather-display');
        if (weatherDisplay) {
            weatherDisplay.style.cursor = 'pointer';
            weatherDisplay.title = 'Click to refresh weather';
            
            weatherDisplay.addEventListener('click', async (e) => {
                // Don't refresh if clicking on interactive elements
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                    return;
                }
                
                console.log('Manual weather refresh triggered');
                
                // Add visual feedback
                weatherDisplay.style.transform = 'scale(0.98)';
                weatherDisplay.style.opacity = '0.7';
                
                setTimeout(() => {
                    weatherDisplay.style.transform = '';
                    weatherDisplay.style.opacity = '';
                }, 200);
                
                await this.updateWeather();
            });
        }
    }

    initStyleSelector() {
        const styleDropdown = document.getElementById('style-dropdown');
        const mainStyle = document.getElementById('main-style');
        const themePanel = document.getElementById('theme-panel');
        const autoRotateCheckbox = document.getElementById('auto-rotate');
        
        if (!styleDropdown || !mainStyle) return;
        
        // Initialize drag functionality for theme panel
        this.initDraggablePanel(themePanel);
        
        // Load saved style
        const savedStyle = localStorage.getItem('selectedStyle');
        if (savedStyle && this.validateStylePath(savedStyle)) {
            this.applyStyle(savedStyle, styleDropdown, mainStyle);
        }
        
        // Load auto-rotate setting
        const savedAutoRotate = localStorage.getItem('autoRotateThemes') === 'true';
        if (autoRotateCheckbox) {
            autoRotateCheckbox.checked = savedAutoRotate;
            if (savedAutoRotate) {
                this.startAutoRotate();
            }
        }
        
        // Handle style changes
        styleDropdown.addEventListener('change', (e) => {
            this.applyStyle(e.target.value, styleDropdown, mainStyle);
            this.currentThemeIndex = this.themes.indexOf(e.target.value);
        });
        
        // Handle auto-rotate checkbox
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



    initDraggablePanel(panel) {
        if (!panel) {
            console.log('Theme panel not found');
            return;
        }
        
        console.log('Initializing draggable theme panel');
        
        // Add tooltip to indicate panel is draggable
        panel.title = "Drag to move this panel anywhere on screen";
        
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        // Load saved position from localStorage
        const savedPosition = localStorage.getItem('themePanelPosition');
        if (savedPosition) {
            try {
                const position = JSON.parse(savedPosition);
                xOffset = position.x || 0;
                yOffset = position.y || 0;
                this.setTranslate(xOffset, yOffset, panel);
                console.log('Restored panel position:', { x: xOffset, y: yOffset });
            } catch (e) {
                console.log('Could not restore panel position:', e);
            }
        }

        const dragStart = (e) => {
            // Prevent dragging on interactive elements
            if (e.target.tagName === 'SELECT' || 
                e.target.tagName === 'INPUT' || 
                e.target.tagName === 'BUTTON' ||
                e.target.tagName === 'A') {
                return;
            }

            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === panel || panel.contains(e.target)) {
                isDragging = true;
                panel.classList.add('dragging');
                console.log('Started dragging theme panel');
            }
        };

        const dragEnd = (e) => {
            if (isDragging) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
                panel.classList.remove('dragging');
                
                // Save position to localStorage
                localStorage.setItem('themePanelPosition', JSON.stringify({
                    x: xOffset,
                    y: yOffset
                }));
                console.log('Stopped dragging theme panel, saved position:', { x: xOffset, y: yOffset });
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                // Keep panel within viewport bounds
                const rect = panel.getBoundingClientRect();
                const maxX = window.innerWidth - rect.width;
                const maxY = window.innerHeight - rect.height;
                
                xOffset = Math.max(0, Math.min(xOffset, maxX));
                yOffset = Math.max(0, Math.min(yOffset, maxY));

                this.setTranslate(xOffset, yOffset, panel);
            }
        };

        const setTranslate = (xPos, yPos, el) => {
            el.style.transform = `translate(${xPos}px, ${yPos}px)`;
        };

        // Mouse events
        panel.addEventListener('mousedown', dragStart);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('mousemove', drag);
        
        // Touch events for mobile
        panel.addEventListener('touchstart', dragStart, { passive: false });
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('touchmove', drag, { passive: false });

        // Store reference to setTranslate for use in drag function
        this.setTranslate = setTranslate;
    }

    applyStyle(stylePath, dropdown, mainStyle) {
        if (!this.validateStylePath(stylePath)) {
            console.error('Invalid style path:', stylePath);
            return;
        }
        
        mainStyle.href = stylePath;
        dropdown.value = stylePath;
        localStorage.setItem('selectedStyle', stylePath);
        console.log('Style changed to:', stylePath);
    }

    validateStylePath(stylePath) {
        const validPaths = [
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
        return validPaths.includes(stylePath);
    }

    initFullscreen() {
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        if (!fullscreenBtn) return;
        
        fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.body.classList.add('fullscreen');
        } else {
            document.exitFullscreen();
            document.body.classList.remove('fullscreen');
        }
    }

    startClock() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }

    updateTime() {
        const now = new Date();
        
        // Update time
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTime(now);
        }
        
        // Update date
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            dateDisplay.textContent = this.formatDate(now);
        }
        
        // Update day
        const dayDisplay = document.getElementById('day-name');
        if (dayDisplay) {
            dayDisplay.textContent = this.formatDay(now);
        }
        
        // Update timezone
        const timezoneDisplay = document.getElementById('timezone-display');
        if (timezoneDisplay) {
            timezoneDisplay.textContent = this.getTimezone();
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatDay(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long'
        });
    }

    getTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    async updateWeather() {
        try {
            console.log('Updating weather...');
            
            // Show loading state
            this.setWeatherLoading();
            
            // Atlanta (ZIP 30318) coordinates
            const lat = 33.8026;
            const lon = -84.3984;
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=apparent_temperature,relativehumidity_2m,windspeed_10m,pressure_msl,uv_index,visibility,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&pressure_unit_inhg&precipitation_unit=inch&timezone=America%2FNew_York`;
            
            console.log('Fetching weather from:', weatherUrl);
            
            const response = await fetch(weatherUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Weather data received:', data);
            
            this.weatherData = this.parseWeatherResponse(data);
            console.log('Parsed weather data:', this.weatherData);
            
            this.updateWeatherDisplay();
            console.log('Weather display updated successfully');
            
        } catch (error) {
            console.error('Weather update failed:', error);
            console.log('Using fallback weather data');
            this.setWeatherFallback();
        }
    }

    setWeatherLoading() {
        try {
            const weatherIcon = document.getElementById('weather-icon');
            const temperature = document.getElementById('temperature');
            const weatherDescription = document.getElementById('weather-description');
            
            if (weatherIcon) weatherIcon.textContent = '⏳';
            if (temperature) temperature.textContent = 'Loading...';
            if (weatherDescription) weatherDescription.textContent = 'Updating weather...';
            
            // Clear details while loading
            const details = ['feels-like', 'humidity', 'wind-speed', 'pressure', 'uv-index', 'visibility'];
            details.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.textContent = '--';
            });
            
        } catch (error) {
            console.error('Error setting loading state:', error);
        }
    }

    parseWeatherResponse(data) {
        const weatherCode = data.current?.weathercode ?? data.current_weather?.weathercode ?? 0;
        
        const currentWeather = data.current_weather || data.current || {};
        const hourlyTime = data.hourly?.time || [];
        const index = hourlyTime.indexOf(currentWeather.time);

        const humidity = index > -1 ? data.hourly.relativehumidity_2m[index] : '--';
        const pressure = index > -1 ? data.hourly.pressure_msl[index] : '--';
        const uvIndex = index > -1 ? data.hourly.uv_index[index] : '--';
        const visibilityMeters = index > -1 ? data.hourly.visibility[index] : '--';

        const toMiles = (meters) => (typeof meters === 'number' ? (meters / 1609.344).toFixed(1) : '--');

        return {
            temperature: currentWeather.temperature ? Math.round(currentWeather.temperature) : '--',
            description: this.getWeatherDescriptionFromCode(currentWeather.weathercode),
            icon: this.getWeatherIconFromCode(currentWeather.weathercode),
            location: 'Atlanta, GA (30318)',
            feelsLike: (index > -1 && data.hourly.apparent_temperature[index] !== undefined)
                ? Math.round(data.hourly.apparent_temperature[index])
                : '--',
            humidity: typeof humidity === 'number' ? humidity : '--',
            windSpeed: currentWeather.windspeed ? Math.round(currentWeather.windspeed) : '--',
            pressure: typeof pressure === 'number' ? pressure.toFixed(2) : '--',
            uvIndex: typeof uvIndex === 'number' ? uvIndex : '--',
            visibility: toMiles(visibilityMeters)
        };
    }

    getWeatherIconFromCode(code) {
        const iconMap = {
            0: '☀️', 1: '☀️', 2: '⛅', 3: '☁️',
            45: '🌫️', 48: '🌫️', 51: '🌧️', 53: '🌧️',
            55: '🌧️', 56: '🌧️', 57: '🌧️', 61: '🌧️',
            63: '🌧️', 65: '🌧️', 66: '🌧️', 67: '🌧️',
            71: '❄️', 73: '❄️', 75: '❄️', 77: '❄️',
            80: '🌧️', 81: '🌧️', 82: '🌧️', 85: '❄️',
            86: '❄️', 95: '⛈️', 96: '⛈️', 99: '⛈️'
        };
        return iconMap[code] || '🌤️';
    }

    getWeatherDescriptionFromCode(code) {
        const descMap = {
            0: 'Clear Sky', 1: 'Mainly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
            45: 'Fog', 48: 'Fog', 51: 'Drizzle', 53: 'Drizzle',
            55: 'Drizzle', 56: 'Freezing Drizzle', 57: 'Freezing Drizzle', 61: 'Rain',
            63: 'Rain', 65: 'Rain', 66: 'Freezing Rain', 67: 'Freezing Rain',
            71: 'Snow', 73: 'Snow', 75: 'Snow', 77: 'Snow Grains',
            80: 'Rain Showers', 81: 'Rain Showers', 82: 'Rain Showers', 85: 'Snow Showers',
            86: 'Snow Showers', 95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Thunderstorm'
        };
        return descMap[code] || 'Unknown';
    }

    setWeatherFallback() {
        this.weatherData = {
            temperature: 72,
            description: 'Pleasant',
            icon: '🌤️',
            location: 'Atlanta, GA',
            feelsLike: 72,
            humidity: 65,
            windSpeed: 5,
            pressure: 30.00,
            uvIndex: 5,
            visibility: 10
        };
        this.updateWeatherDisplay();
    }

    updateWeatherDisplay() {
        if (!this.weatherData) {
            console.log('No weather data available, using fallback');
            this.setWeatherFallback();
            return;
        }
        
        try {
            console.log('Updating weather display with:', this.weatherData);
            
            // Update main weather elements
            const weatherIcon = document.getElementById('weather-icon');
            const temperature = document.getElementById('temperature');
            const weatherDescription = document.getElementById('weather-description');
            const location = document.getElementById('location');
            
            if (weatherIcon) weatherIcon.textContent = this.weatherData.icon;
            if (temperature) temperature.textContent = `${this.weatherData.temperature}°F`;
            if (weatherDescription) weatherDescription.textContent = this.weatherData.description;
            if (location) location.textContent = this.weatherData.location;
            
            // Update weather details
            const feelsLike = document.getElementById('feels-like');
            const humidity = document.getElementById('humidity');
            const windSpeed = document.getElementById('wind-speed');
            const pressure = document.getElementById('pressure');
            const uvIndex = document.getElementById('uv-index');
            const visibility = document.getElementById('visibility');
            
            if (feelsLike) feelsLike.textContent = `${this.weatherData.feelsLike}°F`;
            if (humidity) humidity.textContent = `${this.weatherData.humidity}%`;
            if (windSpeed) windSpeed.textContent = `${this.weatherData.windSpeed} mph`;
            if (pressure) pressure.textContent = `${this.weatherData.pressure} in`;
            if (uvIndex) uvIndex.textContent = this.weatherData.uvIndex;
            if (visibility) visibility.textContent = `${this.weatherData.visibility} mi`;
            
            // Update timestamp
            const updateTime = document.getElementById('weather-update-time');
            if (updateTime) {
                updateTime.textContent = `Updated: ${new Date().toLocaleTimeString()}`;
            }
            
            console.log('Weather display updated successfully');
            
        } catch (error) {
            console.error('Error updating weather display:', error);
            this.setWeatherFallback();
        }
    }

    updateAll() {
        this.updateTime();
    }

    startAutoRotate() {
        console.log('Starting theme auto-rotation');
        this.stopAutoRotate(); // Clear any existing interval
        
        this.autoRotateInterval = setInterval(() => {
            this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
            const nextTheme = this.themes[this.currentThemeIndex];
            
            const styleDropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            
            if (styleDropdown && mainStyle) {
                this.applyStyle(nextTheme, styleDropdown, mainStyle);
                console.log('Auto-rotated to theme:', nextTheme);
            }
        }, 30000); // Rotate every 30 seconds
    }

    stopAutoRotate() {
        if (this.autoRotateInterval) {
            console.log('Stopping theme auto-rotation');
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
        }
    }

    initResponsiveHandling() {
        // Debounce function to limit resize events
        let resizeTimeout;
        
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Screen size adjusted:', window.innerWidth + 'x' + window.innerHeight);
                
                // Adjust theme panel position if it's outside viewport
                this.adjustThemePanelPosition();
                
                // Trigger any other responsive adjustments
                this.applyResponsiveAdjustments();
            }, 250); // Wait 250ms after resize stops
        };
        
        // Listen for window resize
        window.addEventListener('resize', handleResize);
        
        // Listen for orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                console.log('Orientation changed, adjusting layout');
                this.adjustThemePanelPosition();
                this.applyResponsiveAdjustments();
            }, 100); // Small delay for orientation change to complete
        });
        
        // Initial adjustment
        this.adjustThemePanelPosition();
        this.applyResponsiveAdjustments();
    }

    adjustThemePanelPosition() {
        const themePanel = document.getElementById('theme-panel');
        if (!themePanel) return;
        
        const rect = themePanel.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        // Get current transform
        const transform = window.getComputedStyle(themePanel).transform;
        
        if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            let currentX = matrix.m41;
            let currentY = matrix.m42;
            
            // Adjust if panel is outside viewport
            if (currentX > maxX) {
                currentX = maxX;
            }
            if (currentY > maxY) {
                currentY = maxY;
            }
            if (currentX < 0) {
                currentX = 0;
            }
            if (currentY < 0) {
                currentY = 0;
            }
            
            // Apply adjusted position
            themePanel.style.transform = `translate(${currentX}px, ${currentY}px)`;
            
            // Save adjusted position
            localStorage.setItem('themePanelPosition', JSON.stringify({
                x: currentX,
                y: currentY
            }));
        }
    }

    applyResponsiveAdjustments() {
        // Add any additional responsive adjustments here
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
        const isDesktop = window.innerWidth > 1024;
        
        // Update body class for responsive styling
        document.body.classList.remove('mobile-view', 'tablet-view', 'desktop-view');
        
        if (isMobile) {
            document.body.classList.add('mobile-view');
        } else if (isTablet) {
            document.body.classList.add('tablet-view');
        } else {
            document.body.classList.add('desktop-view');
        }
        
        console.log('Applied responsive adjustments for:', isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StatusDisplay();
});
