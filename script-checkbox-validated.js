// Enhanced Auto-Rotation Checkbox Validation and Hardening
// This script validates and hardens the checkbox rotation functionality

class CheckboxRotationValidator {
    constructor() {
        this.validationResults = {
            checkboxExists: false,
            eventListenersAttached: false,
            autoRotateWorking: false,
            localStorageWorking: false,
            themeSwitchingWorking: false,
            statusIndicatorWorking: false
        };
        
        this.testResults = [];
        this.isValidationRunning = false;
    }

    // Main validation function
    async validateCheckboxRotation() {
        console.log('🔍 Starting comprehensive checkbox rotation validation...');
        this.isValidationRunning = true;
        
        try {
            // Step 1: Validate checkbox element exists and is functional
            await this.validateCheckboxElement();
            
            // Step 2: Validate event listeners
            await this.validateEventListeners();
            
            // Step 3: Validate localStorage persistence
            await this.validateLocalStorage();
            
            // Step 4: Validate auto-rotation mechanism
            await this.validateAutoRotationMechanism();
            
            // Step 5: Validate theme switching
            await this.validateThemeSwitching();
            
            // Step 6: Validate status indicator
            await this.validateStatusIndicator();
            
            // Step 7: Harden the functionality
            await this.hardenCheckboxRotation();
            
            // Generate comprehensive report
            this.generateValidationReport();
            
        } catch (error) {
            console.error('❌ Checkbox rotation validation failed:', error);
            this.addTestResult('Overall Validation', false, error.message);
        } finally {
            this.isValidationRunning = false;
        }
        
        return this.validationResults;
    }

    // Validate checkbox element exists and is functional
    async validateCheckboxElement() {
        console.log('📋 Step 1: Validating checkbox element...');
        
        const checkbox = document.getElementById('auto-rotate');
        
        if (!checkbox) {
            this.addTestResult('Checkbox Element', false, 'Checkbox element not found');
            throw new Error('Auto-rotate checkbox element not found');
        }
        
        // Check checkbox properties
        const checks = [
            { prop: 'type', expected: 'checkbox', name: 'Checkbox type' },
            { prop: 'id', expected: 'auto-rotate', name: 'Checkbox ID' },
            { prop: 'disabled', expected: false, name: 'Checkbox enabled' }
        ];
        
        let allChecksPassed = true;
        checks.forEach(check => {
            if (checkbox[check.prop] !== check.expected) {
                this.addTestResult(check.name, false, `Expected ${check.expected}, got ${checkbox[check.prop]}`);
                allChecksPassed = false;
            } else {
                this.addTestResult(check.name, true);
            }
        });
        
        this.validationResults.checkboxExists = allChecksPassed;
        console.log(allChecksPassed ? '✅ Checkbox element validation passed' : '❌ Checkbox element validation failed');
    }

    // Validate event listeners are properly attached
    async validateEventListeners() {
        console.log('📋 Step 2: Validating event listeners...');
        
        const checkbox = document.getElementById('auto-rotate');
        if (!checkbox) {
            this.addTestResult('Event Listeners', false, 'Checkbox not found');
            return;
        }
        
        // Test click event
        let eventFired = false;
        const testHandler = () => { eventFired = true; };
        
        checkbox.addEventListener('change', testHandler);
        
        // Simulate click
        checkbox.click();
        await this.sleep(100);
        
        checkbox.removeEventListener('change', testHandler);
        
        if (eventFired) {
            this.addTestResult('Change Event Listener', true);
            this.validationResults.eventListenersAttached = true;
        } else {
            this.addTestResult('Change Event Listener', false, 'Change event not fired');
            this.validationResults.eventListenersAttached = false;
        }
        
        console.log(this.validationResults.eventListenersAttached ? '✅ Event listeners validation passed' : '❌ Event listeners validation failed');
    }

    // Validate localStorage persistence
    async validateLocalStorage() {
        console.log('📋 Step 3: Validating localStorage persistence...');
        
        try {
            const testKey = 'autoRotateThemes_test';
            const testValue = 'true';
            
            // Test writing
            localStorage.setItem(testKey, testValue);
            
            // Test reading
            const readValue = localStorage.getItem(testKey);
            
            // Test removing
            localStorage.removeItem(testKey);
            
            if (readValue === testValue) {
                this.addTestResult('LocalStorage Write/Read', true);
                
                // Test actual auto-rotate setting persistence
                const checkbox = document.getElementById('auto-rotate');
                if (checkbox) {
                    const originalState = checkbox.checked;
                    
                    // Toggle and save
                    checkbox.checked = !originalState;
                    checkbox.dispatchEvent(new Event('change'));
                    await this.sleep(100);
                    
                    // Check if saved
                    const savedState = localStorage.getItem('autoRotateThemes') === 'true';
                    
                    if (savedState === checkbox.checked) {
                        this.addTestResult('Auto-Rotate Persistence', true);
                        this.validationResults.localStorageWorking = true;
                    } else {
                        this.addTestResult('Auto-Rotate Persistence', false, 'Saved state doesn\'t match checkbox state');
                        this.validationResults.localStorageWorking = false;
                    }
                    
                    // Restore original state
                    checkbox.checked = originalState;
                    checkbox.dispatchEvent(new Event('change'));
                }
            } else {
                this.addTestResult('LocalStorage Write/Read', false, 'Read value doesn\'t match written value');
                this.validationResults.localStorageWorking = false;
            }
        } catch (error) {
            this.addTestResult('LocalStorage', false, error.message);
            this.validationResults.localStorageWorking = false;
        }
        
        console.log(this.validationResults.localStorageWorking ? '✅ LocalStorage validation passed' : '❌ LocalStorage validation failed');
    }

    // Validate auto-rotation mechanism
    async validateAutoRotationMechanism() {
        console.log('📋 Step 4: Validating auto-rotation mechanism...');
        
        try {
            // Check if global auto-rotate functions exist
            const hasStartFunction = typeof window.startAutoRotate === 'function' || 
                                    typeof window.themeManager?.startAutoRotate === 'function';
            const hasStopFunction = typeof window.stopAutoRotate === 'function' || 
                                   typeof window.themeManager?.stopAutoRotate === 'function';
            
            this.addTestResult('StartAutoRotate Function', hasStartFunction);
            this.addTestResult('StopAutoRotate Function', hasStopFunction);
            
            if (hasStartFunction && hasStopFunction) {
                // Test actual auto-rotation
                const checkbox = document.getElementById('auto-rotate');
                const originalState = checkbox.checked;
                
                // Enable auto-rotate
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
                await this.sleep(200);
                
                // Check if auto-rotate interval is set
                const hasInterval = window.themeManager?.autoRotateInterval || 
                                   window.autoRotateInterval;
                
                if (hasInterval) {
                    this.addTestResult('Auto-Rotate Interval Started', true);
                    
                    // Test stopping
                    checkbox.checked = false;
                    checkbox.dispatchEvent(new Event('change'));
                    await this.sleep(200);
                    
                    // Check if interval is cleared
                    const intervalCleared = !window.themeManager?.autoRotateInterval && 
                                          !window.autoRotateInterval;
                    
                    if (intervalCleared) {
                        this.addTestResult('Auto-Rotate Interval Stopped', true);
                        this.validationResults.autoRotateWorking = true;
                    } else {
                        this.addTestResult('Auto-Rotate Interval Stopped', false, 'Interval not cleared');
                        this.validationResults.autoRotateWorking = false;
                    }
                } else {
                    this.addTestResult('Auto-Rotate Interval Started', false, 'No interval found');
                    this.validationResults.autoRotateWorking = false;
                }
                
                // Restore original state
                checkbox.checked = originalState;
                checkbox.dispatchEvent(new Event('change'));
            } else {
                this.validationResults.autoRotateWorking = false;
            }
        } catch (error) {
            this.addTestResult('Auto-Rotation Mechanism', false, error.message);
            this.validationResults.autoRotateWorking = false;
        }
        
        console.log(this.validationResults.autoRotateWorking ? '✅ Auto-rotation mechanism validation passed' : '❌ Auto-rotation mechanism validation failed');
    }

    // Validate theme switching during rotation
    async validateThemeSwitching() {
        console.log('📋 Step 5: Validating theme switching...');
        
        try {
            const dropdown = document.getElementById('style-dropdown');
            const mainStyle = document.getElementById('main-style');
            
            if (!dropdown || !mainStyle) {
                this.addTestResult('Theme Elements', false, 'Dropdown or main style element not found');
                this.validationResults.themeSwitchingWorking = false;
                return;
            }
            
            // Get current theme
            const originalTheme = dropdown.value;
            const originalIndex = dropdown.selectedIndex;
            
            // Test theme switching
            if (dropdown.options.length > 1) {
                const nextIndex = (originalIndex + 1) % dropdown.options.length;
                const nextTheme = dropdown.options[nextIndex].value;
                
                // Simulate theme change
                dropdown.value = nextTheme;
                dropdown.dispatchEvent(new Event('change'));
                await this.sleep(200);
                
                // Check if theme was applied
                const themeApplied = mainStyle.href.includes(nextTheme) || 
                                   mainStyle.href.endsWith(nextTheme);
                
                if (themeApplied) {
                    this.addTestResult('Theme Switching', true);
                    this.validationResults.themeSwitchingWorking = true;
                } else {
                    this.addTestResult('Theme Switching', false, 'Theme not applied correctly');
                    this.validationResults.themeSwitchingWorking = false;
                }
                
                // Restore original theme
                dropdown.value = originalTheme;
                dropdown.dispatchEvent(new Event('change'));
                await this.sleep(200);
            } else {
                this.addTestResult('Theme Switching', false, 'Not enough themes to test switching');
                this.validationResults.themeSwitchingWorking = false;
            }
        } catch (error) {
            this.addTestResult('Theme Switching', false, error.message);
            this.validationResults.themeSwitchingWorking = false;
        }
        
        console.log(this.validationResults.themeSwitchingWorking ? '✅ Theme switching validation passed' : '❌ Theme switching validation failed');
    }

    // Validate status indicator
    async validateStatusIndicator() {
        console.log('📋 Step 6: Validating status indicator...');
        
        try {
            const statusElement = document.getElementById('auto-rotate-status');
            
            if (!statusElement) {
                this.addTestResult('Status Indicator Element', false, 'Status element not found');
                this.validationResults.statusIndicatorWorking = false;
                return;
            }
            
            const checkbox = document.getElementById('auto-rotate');
            const originalState = checkbox.checked;
            
            // Test status update when enabled
            checkbox.checked = true;
            checkbox.dispatchEvent(new Event('change'));
            await this.sleep(100);
            
            const enabledStatus = statusElement.textContent || statusElement.innerText;
            
            // Test status update when disabled
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
            await this.sleep(100);
            
            const disabledStatus = statusElement.textContent || statusElement.innerText;
            
            // Check if status changes
            if (enabledStatus !== disabledStatus) {
                this.addTestResult('Status Indicator Updates', true);
                this.validationResults.statusIndicatorWorking = true;
            } else {
                this.addTestResult('Status Indicator Updates', false, 'Status doesn\'t change with checkbox state');
                this.validationResults.statusIndicatorWorking = false;
            }
            
            // Restore original state
            checkbox.checked = originalState;
            checkbox.dispatchEvent(new Event('change'));
        } catch (error) {
            this.addTestResult('Status Indicator', false, error.message);
            this.validationResults.statusIndicatorWorking = false;
        }
        
        console.log(this.validationResults.statusIndicatorWorking ? '✅ Status indicator validation passed' : '❌ Status indicator validation failed');
    }

    // Harden the checkbox rotation functionality
    async hardenCheckboxRotation() {
        console.log('🛡️ Step 7: Hardening checkbox rotation functionality...');
        
        try {
            const checkbox = document.getElementById('auto-rotate');
            if (!checkbox) return;
            
            // Add enhanced event listeners with error handling
            const hardenedChangeHandler = (e) => {
                try {
                    const isChecked = e.target.checked;
                    
                    // Validate state before proceeding
                    if (typeof isChecked !== 'boolean') {
                        console.warn('Invalid checkbox state detected');
                        return;
                    }
                    
                    // Save to localStorage with error handling
                    try {
                        localStorage.setItem('autoRotateThemes', isChecked.toString());
                    } catch (storageError) {
                        console.error('Failed to save auto-rotate state:', storageError);
                    }
                    
                    // Update status with error handling
                    try {
                        this.updateAutoRotateStatus(isChecked);
                    } catch (statusError) {
                        console.error('Failed to update status:', statusError);
                    }
                    
                    // Control auto-rotation with error handling
                    try {
                        if (isChecked) {
                            if (typeof window.startAutoRotate === 'function') {
                                window.startAutoRotate();
                            } else if (typeof window.themeManager?.startAutoRotate === 'function') {
                                window.themeManager.startAutoRotate();
                            }
                        } else {
                            if (typeof window.stopAutoRotate === 'function') {
                                window.stopAutoRotate();
                            } else if (typeof window.themeManager?.stopAutoRotate === 'function') {
                                window.themeManager.stopAutoRotate();
                            }
                        }
                    } catch (rotateError) {
                        console.error('Failed to control auto-rotation:', rotateError);
                    }
                    
                    console.log(`Auto-rotation ${isChecked ? 'enabled' : 'disabled'} successfully`);
                    
                } catch (error) {
                    console.error('Error in hardened checkbox handler:', error);
                }
            };
            
            // Remove existing listeners and add hardened one
            checkbox.removeEventListener('change', window.originalCheckboxHandler);
            checkbox.addEventListener('change', hardenedChangeHandler);
            window.hardenedCheckboxHandler = hardenedChangeHandler;
            
            // Add validation on page load
            const validateOnLoad = () => {
                try {
                    const savedState = localStorage.getItem('autoRotateThemes') === 'true';
                    if (checkbox.checked !== savedState) {
                        console.log('Correcting checkbox state mismatch');
                        checkbox.checked = savedState;
                        checkbox.dispatchEvent(new Event('change'));
                    }
                } catch (error) {
                    console.error('Error validating on load:', error);
                }
            };
            
            // Run validation immediately and on page visibility change
            validateOnLoad();
            document.addEventListener('visibilitychange', validateOnLoad);
            
            // Add periodic validation
            setInterval(validateOnLoad, 30000); // Every 30 seconds
            
            this.addTestResult('Hardening Applied', true);
            console.log('✅ Checkbox rotation hardening applied successfully');
            
        } catch (error) {
            this.addTestResult('Hardening Applied', false, error.message);
            console.error('❌ Failed to harden checkbox rotation:', error);
        }
    }

    // Update auto-rotate status (enhanced version)
    updateAutoRotateStatus(isEnabled) {
        try {
            const statusElement = document.getElementById('auto-rotate-status');
            if (!statusElement) return;
            
            const statusText = isEnabled ? '🔄' : '⏸️';
            const statusTitle = isEnabled ? 'Auto-rotation is active' : 'Auto-rotation is paused';
            
            statusElement.textContent = statusText;
            statusElement.title = statusTitle;
            statusElement.setAttribute('aria-label', statusTitle);
            
            // Add visual feedback
            if (isEnabled) {
                statusElement.style.color = 'rgba(76, 175, 80, 0.9)';
                statusElement.style.animation = 'pulse 2s infinite';
            } else {
                statusElement.style.color = 'rgba(255, 255, 255, 0.6)';
                statusElement.style.animation = 'none';
            }
        } catch (error) {
            console.error('Error updating auto-rotate status:', error);
        }
    }

    // Add test result
    addTestResult(testName, passed, details = '') {
        this.testResults.push({
            test: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        });
        
        const status = passed ? '✅' : '❌';
        const detailText = details ? ` (${details})` : '';
        console.log(`${status} ${testName}${detailText}`);
    }

    // Generate comprehensive validation report
    generateValidationReport() {
        console.log('\n📊 COMPREHENSIVE VALIDATION REPORT');
        console.log('=' .repeat(50));
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(test => test.passed).length;
        const failedTests = totalTests - passedTests;
        
        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
        
        console.log('\n📋 Detailed Results:');
        this.testResults.forEach(test => {
            const status = test.passed ? '✅' : '❌';
            const detailText = test.details ? ` - ${test.details}` : '';
            console.log(`  ${status} ${test.test}${detailText}`);
        });
        
        console.log('\n🎯 Overall Status:');
        const allCriticalPassed = this.validationResults.checkboxExists && 
                                 this.validationResults.eventListenersAttached && 
                                 this.validationResults.autoRotateWorking && 
                                 this.validationResults.themeSwitchingWorking;
        
        if (allCriticalPassed) {
            console.log('✅ All critical functionality is working correctly!');
        } else {
            console.log('❌ Some critical functionality needs attention.');
        }
        
        // Save report to localStorage for debugging
        try {
            localStorage.setItem('checkboxValidationReport', JSON.stringify({
                timestamp: new Date().toISOString(),
                results: this.validationResults,
                tests: this.testResults,
                summary: {
                    total: totalTests,
                    passed: passedTests,
                    failed: failedTests,
                    successRate: Math.round((passedTests / totalTests) * 100)
                }
            }));
        } catch (error) {
            console.warn('Failed to save validation report:', error);
        }
    }

    // Utility sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get validation results
    getResults() {
        return {
            validationResults: this.validationResults,
            testResults: this.testResults,
            isRunning: this.isValidationRunning
        };
    }
}

// Auto-rotation status animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
    }
    
    .auto-rotate-status {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Export for use
window.CheckboxRotationValidator = CheckboxRotationValidator;

// Auto-run validation if on main page
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    console.log('🚀 Auto-running checkbox rotation validation...');
    
    // Wait for page to load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                const validator = new CheckboxRotationValidator();
                validator.validateCheckboxRotation();
            }, 1000);
        });
    } else {
        setTimeout(() => {
            const validator = new CheckboxRotationValidator();
            validator.validateCheckboxRotation();
        }, 1000);
    }
}
