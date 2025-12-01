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
        
        // Ensure weather always populates with retry logic
        await this.ensureWeatherPopulates();
        
        // Add click-to-refresh weather functionality
        this.initWeatherRefresh();
        
        // Add window resize listener for dynamic adjustment
        this.initResponsiveHandling();
        
        // Add keyboard shortcuts
        this.initKeyboardShortcuts();
        
        // Update every second
        setInterval(() => this.updateAll(), 1000);
        
        // Weather updates every 10 minutes with retry
        setInterval(async () => {
            await this.ensureWeatherPopulates();
        }, 600000);
        
        // Ensure text is not cropped on initialization
        setTimeout(() => this.ensureTextNotCropped(), 500);
        
        // Monitor for text cropping after window resize
        window.addEventListener('resize', () => {
            setTimeout(() => this.ensureTextNotCropped(), 200);
        });
        
        // Ensure auto-rotate is working
        this.verifyAutoRotateFunctionality();
    }

    async ensureWeatherPopulates() {
        console.log('Ensuring weather populates...');
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
            try {
                await this.updateWeather();
                
                // Verify weather data is populated
                if (this.weatherData && this.weatherData.temperature && this.weatherData.location) {
                    console.log('Weather populated successfully on attempt:', attempts + 1);
                    return true;
                } else {
                    console.warn('Weather data incomplete, retrying...');
                    attempts++;
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                }
            } catch (error) {
                console.error('Weather update failed on attempt', attempts + 1, ':', error);
                attempts++;
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                }
            }
        }
        
        // If all attempts failed, ensure fallback is set
        console.log('All weather attempts failed, ensuring fallback data');
        this.setWeatherFallback();
        return false;
    }
    
    verifyAutoRotateFunctionality() {
        console.log('Verifying auto-rotate functionality...');
        
        const autoRotateCheckbox = document.getElementById('auto-rotate');
        const autoRotateStatus = document.getElementById('auto-rotate-status');
        
        if (autoRotateCheckbox) {
            // Check if auto-rotate was previously enabled
            const savedAutoRotate = localStorage.getItem('autoRotateThemes') === 'true';
            
            if (savedAutoRotate) {
                console.log('Auto-rotate was previously enabled, restarting...');
                autoRotateCheckbox.checked = true;
                this.startAutoRotate();
                this.updateAutoRotateStatus(true);
            } else {
                this.updateAutoRotateStatus(false);
            }
            
            // Add verification listener
            autoRotateCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                console.log('Auto-rotate checkbox changed:', isChecked);
                
                if (isChecked) {
                    console.log('Starting auto-rotate verification...');
                    this.startAutoRotate();
                    this.updateAutoRotateStatus(true);
                    
                    // Verify it's actually running
                    setTimeout(() => {
                        if (!this.autoRotateInterval) {
                            console.warn('Auto-rotate failed to start, retrying...');
                            this.startAutoRotate();
                        }
                    }, 1000);
                } else {
                    this.stopAutoRotate();
                    this.updateAutoRotateStatus(false);
                }
            });
        }
        
        console.log('Auto-rotate functionality verification complete');
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
        const minimizeBtn = document.getElementById('minimize-btn');
        const autoRotateStatus = document.getElementById('auto-rotate-status');
        
        if (!styleDropdown || !mainStyle) return;
        
        // Initialize drag functionality for theme panel
        this.initDraggablePanel(themePanel);
        
        // Initialize minimize functionality
        this.initMinimizeFunctionality(themePanel, minimizeBtn);
        
        // Load saved style
        const savedStyle = localStorage.getItem('selectedStyle');
        if (savedStyle && this.validateStylePath(savedStyle)) {
            this.applyStyle(savedStyle, styleDropdown, mainStyle);
            // Sync currentThemeIndex with loaded theme
            this.currentThemeIndex = this.themes.indexOf(savedStyle);
            console.log('Loaded saved theme:', savedStyle, 'at index:', this.currentThemeIndex);
        } else {
            // Set currentThemeIndex to default theme (first in array)
            this.currentThemeIndex = 0;
            console.log('Using default theme at index:', this.currentThemeIndex);
        }
        
        // Load auto-rotate setting
        const savedAutoRotate = localStorage.getItem('autoRotateThemes') === 'true';
        if (autoRotateCheckbox) {
            autoRotateCheckbox.checked = savedAutoRotate;
            if (savedAutoRotate) {
                this.startAutoRotate();
            }
            this.updateAutoRotateStatus(savedAutoRotate);
        }
        
        // Load minimized state
        const savedMinimized = localStorage.getItem('themePanelMinimized') === 'true';
        if (savedMinimized && minimizeBtn) {
            this.toggleMinimize(themePanel, minimizeBtn);
        }
        
        // Handle style changes
        styleDropdown.addEventListener('change', (e) => {
            this.applyStyle(e.target.value, styleDropdown, mainStyle);
            this.currentThemeIndex = this.themes.indexOf(e.target.value);
            
            // Stop auto-rotation when user manually selects a theme
            if (autoRotateCheckbox && autoRotateCheckbox.checked) {
                autoRotateCheckbox.checked = false;
                localStorage.setItem('autoRotateThemes', 'false');
                this.stopAutoRotate();
                this.updateAutoRotateStatus(false);
                this.showNotification(`Switched to ${this.getThemeName(e.target.value)} theme (auto-rotation stopped)`);
                console.log('Auto-rotation stopped due to manual theme selection');
            } else {
                this.showNotification(`Switched to ${this.getThemeName(e.target.value)} theme`);
            }
        });
        
        // Handle auto-rotate checkbox
        if (autoRotateCheckbox) {
            autoRotateCheckbox.addEventListener('change', (e) => {
                const isChecked = e.target.checked;
                localStorage.setItem('autoRotateThemes', isChecked);
                this.updateAutoRotateStatus(isChecked);
                
                if (isChecked) {
                    this.startAutoRotate();
                } else {
                    this.stopAutoRotate();
                }
            });
        }
    }



    initMinimizeFunctionality(themePanel, minimizeBtn) {
        if (!minimizeBtn || !themePanel) return;
        
        minimizeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMinimize(themePanel, minimizeBtn);
        });
        
        console.log('Minimize functionality initialized');
    }
    
    toggleMinimize(themePanel, minimizeBtn) {
        if (!themePanel || !minimizeBtn) return;
        
        const isMinimized = themePanel.classList.contains('minimized');
        
        if (isMinimized) {
            // Maximize
            themePanel.classList.remove('minimized');
            minimizeBtn.textContent = '−';
            minimizeBtn.title = 'Minimize theme panel';
            localStorage.setItem('themePanelMinimized', 'false');
            console.log('Theme panel maximized');
        } else {
            // Minimize
            themePanel.classList.add('minimized');
            minimizeBtn.textContent = '+';
            minimizeBtn.title = 'Maximize theme panel';
            localStorage.setItem('themePanelMinimized', 'true');
            console.log('Theme panel minimized');
        }
    }
    
    updateAutoRotateStatus(isActive) {
        const statusElement = document.getElementById('auto-rotate-status');
        if (statusElement) {
            if (isActive) {
                statusElement.classList.add('active');
            } else {
                statusElement.classList.remove('active');
            }
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
        // Force Atlanta timezone for consistent display
        const now = new Date();
        
        // Update time in Atlanta timezone
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = this.formatTimeAtlanta(now);
        }
        
        // Update date in Atlanta timezone
        const dateDisplay = document.getElementById('date-display');
        if (dateDisplay) {
            dateDisplay.textContent = this.formatDateAtlanta(now);
        }
        
        // Update day in Atlanta timezone
        const dayDisplay = document.getElementById('day-name');
        if (dayDisplay) {
            dayDisplay.textContent = this.formatDayAtlanta(now);
        }
        
        // Update timezone display
        const timezoneDisplay = document.getElementById('timezone-display');
        if (timezoneDisplay) {
            timezoneDisplay.textContent = 'Eastern Time (Atlanta, GA)';
        }
        
        // Update city display
        const cityDisplay = document.getElementById('city-display');
        if (cityDisplay) {
            cityDisplay.textContent = 'Atlanta, Georgia';
        }
        
        // Update time period
        const timePeriod = document.getElementById('time-period');
        if (timePeriod) {
            timePeriod.textContent = this.getTimeOfDay(now);
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

    formatTimeAtlanta(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            timeZone: 'America/New_York'
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    }

    formatDateAtlanta(date) {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: 'America/New_York'
        });
    }

    formatDay(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long'
        });
    }

    formatDayAtlanta(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            timeZone: 'America/New_York'
        });
    }

    getTimeOfDay(date) {
        const hour = date.getHours();
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 21) return 'Evening';
        return 'Night';
    }

    getTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    async updateWeather() {
        try {
            console.log('Updating weather...');
            
            // Show loading state
            this.setWeatherLoading();
            
            // Atlanta (ZIP 30318) coordinates with fallback locations
            const locations = [
                { lat: 33.8026, lon: -84.3984, name: 'Atlanta, GA' },
                { lat: 40.7128, lon: -74.0060, name: 'New York, NY' },
                { lat: 51.5074, lon: -0.1278, name: 'London, UK' }
            ];
            
            let weatherData = null;
            let lastError = null;
            
            // Try each location until one succeeds
            for (const location of locations) {
                try {
                    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true&hourly=apparent_temperature,relativehumidity_2m,windspeed_10m,pressure_msl,uv_index,visibility,weathercode&temperature_unit=fahrenheit&windspeed_unit=mph&pressure_unit_inhg&precipitation_unit=inch&timezone=America%2FNew_York`;
                    
                    console.log(`Fetching weather from ${location.name}:`, weatherUrl);
                    
                    const response = await fetch(weatherUrl, {
                        timeout: 10000, // 10 second timeout
                        headers: {
                            'User-Agent': 'AtomicClockDisplay/2.0.0'
                        }
                    });
                    
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log(`Weather data received from ${location.name}:`, data);
                    
                    weatherData = this.parseWeatherResponse(data);
                    weatherData.location = location.name;
                    weatherData.timestamp = new Date().toISOString();
                    
                    console.log('Parsed weather data:', weatherData);
                    break; // Success, exit loop
                    
                } catch (error) {
                    console.warn(`Failed to fetch weather from ${location.name}:`, error);
                    lastError = error;
                    continue; // Try next location
                }
            }
            
            if (weatherData) {
                this.weatherData = weatherData;
                this.updateWeatherDisplay();
                console.log('Weather display updated successfully');
            } else {
                throw lastError || new Error('All weather locations failed');
            }
            
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
            
            // Extract city name and update time panel
            const cityDisplay = document.getElementById('city-display');
            if (cityDisplay && this.weatherData.location) {
                // Extract city name (first part before comma)
                const cityName = this.weatherData.location.split(',')[0].trim();
                cityDisplay.textContent = cityName;
            }
            
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
        
        // Sync currentThemeIndex with currently selected theme
        const styleDropdown = document.getElementById('style-dropdown');
        if (styleDropdown) {
            const currentTheme = styleDropdown.value;
            const currentIndex = this.themes.indexOf(currentTheme);
            if (currentIndex !== -1) {
                this.currentThemeIndex = currentIndex;
                console.log('Synced currentThemeIndex to:', this.currentThemeIndex, 'for theme:', currentTheme);
            } else {
                console.log('Current theme not found in themes array, using index 0');
                this.currentThemeIndex = 0;
            }
        }
        
        // Show notification that rotation is starting
        this.showNotification('Theme rotation started (30s intervals)');
        
        // Update status
        this.updateAutoRotateStatus(true);
        
        // Ensure text is not cropped before starting rotation
        this.ensureTextNotCropped();
        
        this.autoRotateInterval = setInterval(() => {
            this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
            const nextTheme = this.themes[this.currentThemeIndex];
            
            const styleDropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            const autoRotateCheckbox = document.getElementById('auto-rotate');
            
            // Double-check that auto-rotate is still enabled before switching
            if (autoRotateCheckbox && autoRotateCheckbox.checked && styleDropdown && mainStyle) {
                this.applyStyle(nextTheme, styleDropdown, mainStyle);
                console.log('Auto-rotated to theme:', nextTheme, '(index:', this.currentThemeIndex, ')');
                
                // Ensure text is not cropped after theme change
                setTimeout(() => this.ensureTextNotCropped(), 100);
                
                // Show subtle notification for theme change (only in test mode or if debug is enabled)
                if (window.location.search.includes('debug=true') || window.location.hostname === 'localhost') {
                    this.showNotification(`Theme: ${this.getThemeName(nextTheme)}`);
                }
            } else {
                console.log('Auto-rotation disabled or elements missing, stopping rotation');
                this.stopAutoRotate();
            }
        }, 30000); // Rotate every 30 seconds
        
        console.log('Auto-rotation started with 30-second intervals from index:', this.currentThemeIndex);
    }

    ensureTextNotCropped() {
        try {
            console.log('Checking for text cropping issues...');
            
            // Check all text elements for potential cropping
            const textElements = [
                { id: 'day-name', name: 'Day name' },
                { id: 'time-period', name: 'Time period' },
                { id: 'time-display', name: 'Time display' },
                { id: 'date-display', name: 'Date display' },
                { id: 'timezone-display', name: 'Timezone display' },
                { id: 'city-display', name: 'City display' },
                { id: 'temperature', name: 'Temperature' },
                { id: 'weather-description', name: 'Weather description' },
                { id: 'location', name: 'Location' },
                { id: 'feels-like', name: 'Feels like' },
                { id: 'humidity', name: 'Humidity' },
                { id: 'wind-speed', name: 'Wind speed' },
                { id: 'visibility', name: 'Visibility' }
            ];
            
            let issuesFound = 0;
            
            textElements.forEach(element => {
                const el = document.getElementById(element.id);
                if (el) {
                    // Check for text overflow
                    const isOverflowing = el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;
                    
                    if (isOverflowing) {
                        console.warn(`Text cropping detected in ${element.name}:`, {
                            element: element.id,
                            scrollWidth: el.scrollWidth,
                            clientWidth: el.clientWidth,
                            scrollHeight: el.scrollHeight,
                            clientHeight: el.clientHeight,
                            text: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : '')
                        });
                        
                        // Apply fixes to prevent cropping
                        this.fixTextCropping(el);
                        issuesFound++;
                    }
                    
                    // Ensure proper text properties
                    this.ensureTextProperties(el);
                }
            });
            
            // Check container constraints
            this.checkContainerConstraints();
            
            if (issuesFound > 0) {
                console.log(`Fixed ${issuesFound} text cropping issues`);
            } else {
                console.log('No text cropping issues detected');
            }
            
        } catch (error) {
            console.error('Error checking text cropping:', error);
        }
    }
    
    fixTextCropping(element) {
        try {
            // Apply common fixes for text cropping
            const originalStyles = {
                overflow: element.style.overflow,
                textOverflow: element.style.textOverflow,
                whiteSpace: element.style.whiteSpace,
                wordWrap: element.style.wordWrap,
                wordBreak: element.style.wordBreak
            };
            
            // Fix overflow issues
            element.style.overflow = 'visible';
            element.style.textOverflow = 'ellipsis';
            
            // Handle text wrapping based on element type
            if (element.id === 'time-display' || element.id === 'day-name') {
                element.style.whiteSpace = 'nowrap';
                element.style.wordBreak = 'normal';
            } else {
                element.style.whiteSpace = 'normal';
                element.style.wordWrap = 'break-word';
                element.style.wordBreak = 'break-word';
            }
            
            // Adjust font size if needed (only for non-critical elements)
            if (element.scrollWidth > element.clientWidth * 1.1 && 
                !['day-name', 'time-display'].includes(element.id)) {
                const currentFontSize = parseFloat(window.getComputedStyle(element).fontSize);
                const newFontSize = currentFontSize * 0.9;
                element.style.fontSize = `${newFontSize}px`;
                console.log(`Reduced font size for ${element.id} from ${currentFontSize}px to ${newFontSize}px`);
            }
            
            console.log(`Applied text cropping fixes to ${element.id}`);
            
        } catch (error) {
            console.error(`Error fixing text cropping for element:`, error);
        }
    }
    
    ensureTextProperties(element) {
        try {
            // Ensure proper text properties for all elements
            const computedStyle = window.getComputedStyle(element);
            
            // Check for problematic text properties
            if (computedStyle.textOverflow === 'clip' && element.style.textOverflow !== 'ellipsis') {
                element.style.textOverflow = 'ellipsis';
            }
            
            // Ensure proper line height
            if (parseFloat(computedStyle.lineHeight) < 1.1) {
                element.style.lineHeight = '1.2';
            }
            
            // Ensure proper letter spacing for large text
            if (element.id === 'day-name' || element.id === 'time-display') {
                if (!element.style.letterSpacing) {
                    element.style.letterSpacing = '-0.02em';
                }
            }
            
        } catch (error) {
            console.error('Error ensuring text properties:', error);
        }
    }
    
    checkContainerConstraints() {
        try {
            // Check main container for size constraints
            const container = document.querySelector('.container');
            const dayDisplay = document.querySelector('.day-display');
            const content = document.querySelector('.content');
            
            if (container && dayDisplay && content) {
                // Check if container is properly sized
                const containerHeight = container.clientHeight;
                const dayDisplayHeight = dayDisplay.clientHeight;
                const contentHeight = content.clientHeight;
                
                if (dayDisplayHeight > containerHeight * 0.5) {
                    console.warn('Day display taking too much space, adjusting...');
                    dayDisplay.style.maxHeight = '50vh';
                }
                
                if (dayDisplayHeight + contentHeight > containerHeight * 0.95) {
                    console.warn('Content overflow detected, adjusting...');
                    const availableHeight = containerHeight * 0.95 - dayDisplayHeight;
                    content.style.maxHeight = `${availableHeight}px`;
                }
            }
            
        } catch (error) {
            console.error('Error checking container constraints:', error);
        }
    }
    
    stopAutoRotate() {
        if (this.autoRotateInterval) {
            console.log('Stopping theme auto-rotation');
            clearInterval(this.autoRotateInterval);
            this.autoRotateInterval = null;
            this.updateAutoRotateStatus(false);
            this.showNotification('Theme rotation stopped');
        }
    }

    // Debug function for testing auto-rotate with shorter interval
    startAutoRotateDebug() {
        console.log('Starting DEBUG theme auto-rotation (5-second intervals)');
        this.stopAutoRotate(); // Clear any existing interval
        
        // Sync currentThemeIndex with currently selected theme
        const styleDropdown = document.getElementById('style-dropdown');
        if (styleDropdown) {
            const currentTheme = styleDropdown.value;
            const currentIndex = this.themes.indexOf(currentTheme);
            if (currentIndex !== -1) {
                this.currentThemeIndex = currentIndex;
                console.log('DEBUG: Synced currentThemeIndex to:', this.currentThemeIndex, 'for theme:', currentTheme);
            }
        }
        
        this.showNotification('DEBUG: Theme rotation started (5s intervals)');
        
        this.autoRotateInterval = setInterval(() => {
            this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
            const nextTheme = this.themes[this.currentThemeIndex];
            
            const styleDropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            const autoRotateCheckbox = document.getElementById('auto-rotate');
            
            if (autoRotateCheckbox && autoRotateCheckbox.checked && styleDropdown && mainStyle) {
                this.applyStyle(nextTheme, styleDropdown, mainStyle);
                console.log('DEBUG: Auto-rotated to theme:', nextTheme, '(index:', this.currentThemeIndex, ')');
                this.showNotification(`DEBUG: ${this.getThemeName(nextTheme)}`);
            } else {
                console.log('DEBUG: Auto-rotation disabled or elements missing, stopping rotation');
                this.stopAutoRotate();
            }
        }, 5000); // Rotate every 5 seconds for debugging
        
        console.log('DEBUG: Auto-rotation started with 5-second intervals from index:', this.currentThemeIndex);
    }

    getThemeName(themePath) {
        const themeNames = {
            'style.css': 'Original',
            'styles/dark.css': 'Dark',
            'styles/ocean.css': 'Ocean',
            'styles/sunset.css': 'Sunset',
            'styles/forest.css': 'Forest',
            'styles/cyberpunk.css': 'Cyberpunk',
            'styles/galaxy.css': 'Galaxy',
            'styles/aurora.css': 'Aurora',
            'styles/vintage.css': 'Vintage',
            'styles/minimal.css': 'Minimal',
            'styles/neon.css': 'Neon',
            'styles/candy.css': 'Candy'
        };
        return themeNames[themePath] || themePath;
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

    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only process shortcuts when not typing in input fields
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            switch(e.key.toLowerCase()) {
                case 't':
                    e.preventDefault();
                    this.cycleTheme();
                    console.log('Keyboard: Cycled theme (T key)');
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    console.log('Keyboard: Toggled fullscreen (F key)');
                    break;
                case 'r':
                    e.preventDefault();
                    this.updateWeather();
                    this.showNotification('Weather refreshed');
                    console.log('Keyboard: Refreshed weather (R key)');
                    break;
            }
        });

        console.log('Keyboard shortcuts initialized: T (themes), F (fullscreen), R (refresh weather)');
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting to enable fullscreen:', err);
                this.showNotification('Could not enter fullscreen');
            });
        } else {
            document.exitFullscreen();
        }
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

    showNotification(message) {
        // Create notification element if it doesn't exist
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                font-size: 14px;
                z-index: 10000;
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.opacity = '1';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
        }, 3000);
    }

    // Add missing changeTheme method
    changeTheme(themePath) {
        const styleDropdown = document.getElementById('style-dropdown');
        const mainStyle = document.getElementById('main-style');
        
        if (styleDropdown && mainStyle) {
            this.applyStyle(themePath, styleDropdown, mainStyle);
            this.currentThemeIndex = this.themes.indexOf(themePath);
            
            // Update dropdown to match
            styleDropdown.value = themePath;
            
            // Save to localStorage
            localStorage.setItem('selectedStyle', themePath);
            
            console.log('Changed to theme:', themePath);
        }
    }

    // Add missing cycleTheme method
    cycleTheme() {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        const nextTheme = this.themes[this.currentThemeIndex];
        this.changeTheme(nextTheme);
        
        // Show notification
        this.showNotification(`Theme: ${this.getThemeName(nextTheme)}`);
        
        console.log('Cycled to theme:', nextTheme);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StatusDisplay();
});
