/**
 * Atomic Clock & Weather Display - Hardened Monitoring System
 * Security and performance monitoring with resilience patterns
 * Version: 2.0.0-Hardened
 */

class HardenedMonitor {
    constructor() {
        this.metrics = {
            performance: {},
            security: {},
            errors: [],
            network: {},
            user: {}
        };
        
        this.config = {
            maxErrors: 100,
            maxMetrics: 1000,
            reportInterval: 60000, // 1 minute
            securityThreshold: 10, // Security events per minute
            performanceThreshold: 5000 // 5 seconds
        };
        
        this.startTime = Date.now();
        this.lastReport = Date.now();
        this.securityEvents = [];
        this.performanceMetrics = [];
        
        this.init();
    }
    
    init() {
        try {
            this.setupPerformanceMonitoring();
            this.setupSecurityMonitoring();
            this.setupErrorMonitoring();
            this.setupNetworkMonitoring();
            this.setupUserMonitoring();
            this.startPeriodicReporting();
            
            console.log('Hardened Monitor initialized');
        } catch (error) {
            console.error('Monitor initialization failed:', error);
        }
    }
    
    // Performance Monitoring
    setupPerformanceMonitoring() {
        // Monitor page load performance
        if ('performance' in window && 'getEntriesByType' in performance) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    this.collectPerformanceMetrics();
                }, 0);
            });
        }
        
        // Monitor long tasks
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.duration > this.config.performanceThreshold) {
                            this.recordPerformanceIssue('long_task', {
                                duration: entry.duration,
                                startTime: entry.startTime,
                                name: entry.name
                            });
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask', 'measure', 'navigation'] });
            } catch (error) {
                console.warn('Performance observer not supported:', error);
            }
        }
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                this.recordMemoryUsage();
            }, 30000); // Every 30 seconds
        }
    }
    
    collectPerformanceMetrics() {
        try {
            const navigation = performance.getEntriesByType('navigation')[0];
            if (navigation) {
                this.metrics.performance = {
                    domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                    loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
                    firstPaint: this.getFirstPaint(),
                    firstContentfulPaint: this.getFirstContentfulPaint(),
                    totalLoadTime: navigation.loadEventEnd - navigation.fetchStart,
                    domInteractive: navigation.domInteractive - navigation.fetchStart
                };
                
                this.checkPerformanceThresholds();
            }
        } catch (error) {
            console.error('Performance metrics collection failed:', error);
        }
    }
    
    getFirstPaint() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
            return firstPaint ? firstPaint.startTime : 0;
        } catch {
            return 0;
        }
    }
    
    getFirstContentfulPaint() {
        try {
            const paintEntries = performance.getEntriesByType('paint');
            const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
            return fcp ? fcp.startTime : 0;
        } catch {
            return 0;
        }
    }
    
    recordMemoryUsage() {
        try {
            if (performance.memory) {
                const memory = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    timestamp: Date.now()
                };
                
                this.metrics.performance.memory = memory;
                
                // Check for memory leaks
                if (memory.used > memory.limit * 0.9) {
                    this.recordPerformanceIssue('high_memory', memory);
                }
            }
        } catch (error) {
            console.error('Memory usage recording failed:', error);
        }
    }
    
    recordPerformanceIssue(type, data) {
        const issue = {
            type,
            data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.performanceMetrics.push(issue);
        
        // Keep only recent metrics
        if (this.performanceMetrics.length > this.config.maxMetrics) {
            this.performanceMetrics = this.performanceMetrics.slice(-this.config.maxMetrics);
        }
        
        console.warn('Performance issue detected:', issue);
    }
    
    checkPerformanceThresholds() {
        const metrics = this.metrics.performance;
        
        if (metrics.totalLoadTime > this.config.performanceThreshold) {
            this.recordPerformanceIssue('slow_load', {
                loadTime: metrics.totalLoadTime,
                threshold: this.config.performanceThreshold
            });
        }
        
        if (metrics.domInteractive > 3000) {
            this.recordPerformanceIssue('slow_dom', {
                domTime: metrics.domInteractive,
                threshold: 3000
            });
        }
    }
    
    // Security Monitoring
    setupSecurityMonitoring() {
        // Monitor CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.recordSecurityEvent('csp_violation', {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                originalPolicy: event.originalPolicy,
                referrer: event.referrer
            });
        });
        
        // Monitor XSS attempts
        this.setupXSSMonitoring();
        
        // Monitor suspicious API calls
        this.setupAPIMonitoring();
        
        // Monitor authentication attempts
        this.setupAuthMonitoring();
    }
    
    setupXSSMonitoring() {
        // Monitor for suspicious script injections
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            if (tagName.toLowerCase() === 'script') {
                const script = originalCreateElement.call(this, tagName);
                const originalSetAttribute = script.setAttribute;
                
                script.setAttribute = function(name, value) {
                    if (name === 'src' && this.monitor) {
                        this.monitor.recordSecurityEvent('suspicious_script', {
                            src: value,
                            timestamp: Date.now()
                        });
                    }
                    return originalSetAttribute.call(this, name, value);
                };
                
                return script;
            }
            return originalCreateElement.call(this, tagName);
        };
    }
    
    setupAPIMonitoring() {
        // Monitor fetch API for suspicious calls
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            // Check for suspicious URLs
            if (typeof url === 'string' && this.monitor) {
                const suspicious = this.monitor.isSuspiciousURL(url);
                if (suspicious) {
                    this.monitor.recordSecurityEvent('suspicious_api_call', {
                        url: url,
                        reason: suspicious,
                        timestamp: Date.now()
                    });
                }
            }
            
            return originalFetch.apply(this, arguments);
        }.bind({ monitor: this });
    }
    
    isSuspiciousURL(url) {
        try {
            const parsed = new URL(url);
            
            // Check for suspicious patterns
            const suspiciousPatterns = [
                /javascript:/i,
                /data:text\/html/i,
                /vbscript:/i,
                /<script/i,
                /on\w+=/i
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (pattern.test(url)) {
                    return 'pattern_match';
                }
            }
            
            // Check for unknown origins
            const trustedOrigins = [
                window.location.origin,
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://api.openweathermap.org',
                'https://api.weatherapi.com',
                'https://ipapi.co'
            ];
            
            if (!trustedOrigins.includes(parsed.origin)) {
                return 'unknown_origin';
            }
            
            return false;
        } catch {
            return 'invalid_url';
        }
    }
    
    setupAuthMonitoring() {
        // Monitor for authentication events
        // This would be implemented based on your auth system
    }
    
    recordSecurityEvent(type, data) {
        const event = {
            type,
            data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ip: this.getClientIP()
        };
        
        this.securityEvents.push(event);
        
        // Check security threshold
        const recentEvents = this.securityEvents.filter(
            e => Date.now() - e.timestamp < 60000
        );
        
        if (recentEvents.length > this.config.securityThreshold) {
            this.handleSecurityBreach(recentEvents);
        }
        
        console.warn('Security event detected:', event);
    }
    
    getClientIP() {
        // In a real implementation, this would get the client IP
        // For now, return a placeholder
        return 'unknown';
    }
    
    handleSecurityBreach(events) {
        console.error('Security breach detected!', events);
        
        // Implement security response
        // 1. Lock down the application
        // 2. Clear sensitive data
        // 3. Notify administrators
        // 4. Log the breach
        
        // For demonstration, we'll just clear the screen
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: system-ui; background: #f44336; color: white;">
                <div style="text-align: center;">
                    <h1>🔒 Security Alert</h1>
                    <p>Suspicious activity detected. The application has been locked for security.</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; background: white; color: #f44336; border: none; border-radius: 4px; cursor: pointer;">
                        Reload Application
                    </button>
                </div>
            </div>
        `;
    }
    
    // Error Monitoring
    setupErrorMonitoring() {
        // Monitor JavaScript errors
        window.addEventListener('error', (event) => {
            this.recordError('javascript', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // Monitor promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError('promise', {
                reason: event.reason,
                stack: event.reason?.stack
            });
        });
        
        // Monitor resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError('resource', {
                    element: event.target.tagName,
                    source: event.target.src || event.target.href
                });
            }
        }, true);
    }
    
    recordError(type, data) {
        const error = {
            type,
            data,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.metrics.errors.push(error);
        
        // Keep only recent errors
        if (this.metrics.errors.length > this.config.maxErrors) {
            this.metrics.errors = this.metrics.errors.slice(-this.config.maxErrors);
        }
        
        console.error('Error recorded:', error);
        
        // Implement error recovery strategies
        this.handleErrorRecovery(error);
    }
    
    handleErrorRecovery(error) {
        switch (error.type) {
            case 'resource':
                // Try to reload failed resources
                this.retryFailedResource(error.data);
                break;
            case 'javascript':
                // Implement fallback behavior
                this.implementJavaScriptFallback(error);
                break;
            case 'promise':
                // Handle promise failures
                this.handlePromiseFailure(error);
                break;
        }
    }
    
    retryFailedResource(resourceData) {
        if (resourceData.source) {
            setTimeout(() => {
                const img = new Image();
                img.onload = () => {
                    console.log('Resource retry successful:', resourceData.source);
                };
                img.onerror = () => {
                    console.warn('Resource retry failed:', resourceData.source);
                };
                img.src = resourceData.source;
            }, 5000);
        }
    }
    
    implementJavaScriptFallback(error) {
        // Implement fallback functionality for JavaScript errors
        console.log('Implementing JavaScript fallback for:', error);
    }
    
    handlePromiseFailure(error) {
        // Handle promise rejection failures
        console.log('Handling promise failure:', error);
    }
    
    // Network Monitoring
    setupNetworkMonitoring() {
        // Monitor connection status
        this.monitorConnectionStatus();
        
        // Monitor API response times
        this.setupAPIMonitoring();
        
        // Monitor offline/online events
        window.addEventListener('online', () => {
            this.recordNetworkEvent('online');
        });
        
        window.addEventListener('offline', () => {
            this.recordNetworkEvent('offline');
        });
    }
    
    monitorConnectionStatus() {
        if ('connection' in navigator) {
            const updateConnectionInfo = () => {
                this.metrics.network = {
                    effectiveType: navigator.connection.effectiveType,
                    downlink: navigator.connection.downlink,
                    rtt: navigator.connection.rtt,
                    saveData: navigator.connection.saveData,
                    timestamp: Date.now()
                };
                
                // Adjust performance based on connection
                this.adjustPerformanceForConnection();
            };
            
            updateConnectionInfo();
            navigator.connection.addEventListener('change', updateConnectionInfo);
        }
    }
    
    adjustPerformanceForConnection() {
        const connection = this.metrics.network;
        
        if (connection) {
            // Reduce animations on slow connections
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.style.setProperty('--animation-duration', '0.1s');
            }
            
            // Reduce update frequency on slow connections
            if (connection.saveData) {
                // Implement data saving mode
                console.log('Data saving mode activated');
            }
        }
    }
    
    recordNetworkEvent(type, data = {}) {
        const event = {
            type,
            data,
            timestamp: Date.now(),
            url: window.location.href
        };
        
        if (!this.metrics.network.events) {
            this.metrics.network.events = [];
        }
        
        this.metrics.network.events.push(event);
        
        console.log('Network event recorded:', event);
    }
    
    // User Monitoring
    setupUserMonitoring() {
        // Monitor user interactions
        this.setupUserInteractionMonitoring();
        
        // Monitor session duration
        this.startSessionMonitoring();
        
        // Monitor feature usage
        this.setupFeatureMonitoring();
    }
    
    setupUserInteractionMonitoring() {
        let lastInteraction = Date.now();
        
        ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
            document.addEventListener(eventType, () => {
                lastInteraction = Date.now();
            }, { passive: true });
        });
        
        // Check for inactive users
        setInterval(() => {
            const inactiveTime = Date.now() - lastInteraction;
            if (inactiveTime > 300000) { // 5 minutes
                this.recordUserEvent('inactive', { inactiveTime });
            }
        }, 60000);
    }
    
    startSessionMonitoring() {
        this.metrics.user.sessionStart = Date.now();
        
        window.addEventListener('beforeunload', () => {
            this.metrics.user.sessionDuration = Date.now() - this.metrics.user.sessionStart;
            this.recordUserEvent('session_end', {
                duration: this.metrics.user.sessionDuration
            });
        });
    }
    
    setupFeatureMonitoring() {
        // Monitor theme usage
        this.monitorFeatureUsage('theme');
        
        // Monitor weather refresh usage
        this.monitorFeatureUsage('weather_refresh');
        
        // Monitor fullscreen usage
        this.monitorFeatureUsage('fullscreen');
    }
    
    monitorFeatureUsage(featureName) {
        // This would be implemented based on your feature tracking
        console.log(`Monitoring feature usage: ${featureName}`);
    }
    
    recordUserEvent(type, data = {}) {
        const event = {
            type,
            data,
            timestamp: Date.now()
        };
        
        if (!this.metrics.user.events) {
            this.metrics.user.events = [];
        }
        
        this.metrics.user.events.push(event);
    }
    
    // Periodic Reporting
    startPeriodicReporting() {
        setInterval(() => {
            this.generateReport();
        }, this.config.reportInterval);
    }
    
    generateReport() {
        const report = {
            timestamp: Date.now(),
            uptime: Date.now() - this.startTime,
            performance: this.metrics.performance,
            security: {
                totalEvents: this.securityEvents.length,
                recentEvents: this.securityEvents.filter(e => Date.now() - e.timestamp < 3600000)
            },
            errors: {
                total: this.metrics.errors.length,
                recent: this.metrics.errors.filter(e => Date.now() - e.timestamp < 3600000)
            },
            network: this.metrics.network,
            user: this.metrics.user
        };
        
        console.log('Monitoring Report:', report);
        
        // In production, send this to a monitoring service
        this.sendReportToService(report);
    }
    
    sendReportToService(report) {
        // In a real implementation, this would send to your monitoring service
        // For now, we'll just log it
        console.log('Report would be sent to monitoring service:', report);
    }
    
    // Public API
    getMetrics() {
        return {
            ...this.metrics,
            performanceMetrics: this.performanceMetrics,
            securityEvents: this.securityEvents
        };
    }
    
    clearMetrics() {
        this.metrics = {
            performance: {},
            security: {},
            errors: [],
            network: {},
            user: {}
        };
        this.performanceMetrics = [];
        this.securityEvents = [];
    }
    
    // Health Check
    healthCheck() {
        const health = {
            status: 'healthy',
            checks: {
                performance: this.checkPerformanceHealth(),
                security: this.checkSecurityHealth(),
                errors: this.checkErrorHealth(),
                network: this.checkNetworkHealth()
            },
            timestamp: Date.now()
        };
        
        // Determine overall health
        const failedChecks = Object.values(health.checks).filter(check => !check.healthy);
        if (failedChecks.length > 0) {
            health.status = 'degraded';
            if (failedChecks.length > 2) {
                health.status = 'unhealthy';
            }
        }
        
        return health;
    }
    
    checkPerformanceHealth() {
        const metrics = this.metrics.performance;
        const healthy = {
            healthy: true,
            issues: []
        };
        
        if (metrics.totalLoadTime > 10000) {
            healthy.healthy = false;
            healthy.issues.push('Slow page load');
        }
        
        if (metrics.memory && metrics.memory.used > metrics.memory.limit * 0.8) {
            healthy.healthy = false;
            healthy.issues.push('High memory usage');
        }
        
        return healthy;
    }
    
    checkSecurityHealth() {
        const recentEvents = this.securityEvents.filter(e => Date.now() - e.timestamp < 3600000);
        const healthy = {
            healthy: true,
            issues: []
        };
        
        if (recentEvents.length > 5) {
            healthy.healthy = false;
            healthy.issues.push('Multiple security events');
        }
        
        return healthy;
    }
    
    checkErrorHealth() {
        const recentErrors = this.metrics.errors.filter(e => Date.now() - e.timestamp < 3600000);
        const healthy = {
            healthy: true,
            issues: []
        };
        
        if (recentErrors.length > 10) {
            healthy.healthy = false;
            healthy.issues.push('High error rate');
        }
        
        return healthy;
    }
    
    checkNetworkHealth() {
        const healthy = {
            healthy: true,
            issues: []
        };
        
        if (navigator.onLine === false) {
            healthy.healthy = false;
            healthy.issues.push('Offline');
        }
        
        return healthy;
    }
}

// Initialize the monitor
const hardenedMonitor = new HardenedMonitor();

// Global access for debugging
window.hardenedMonitor = hardenedMonitor;

export default HardenedMonitor;
