#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Atomic Clock Display
 * Tests all functionality and identifies issues
 */

const fs = require('fs');
const path = require('path');

class AtomicClockTester {
    constructor() {
        this.testResults = [];
        this.projectRoot = __dirname;
        this.errors = [];
        this.warnings = [];
        this.passed = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        console.log(logMessage);
        
        this.testResults.push({
            timestamp,
            type,
            message,
            success: type === 'pass'
        });
    }

    async runAllTests() {
        this.log('🚀 Starting Comprehensive Atomic Clock Display Tests', 'info');
        
        // Test 1: File Structure
        await this.testFileStructure();
        
        // Test 2: HTML Structure
        await this.testHTMLStructure();
        
        // Test 3: CSS Imports and Styles
        await this.testCSSStructure();
        
        // Test 4: JavaScript Functionality
        await this.testJavaScriptStructure();
        
        // Test 5: Theme System
        await this.testThemeSystem();
        
        // Test 6: Weather System
        await this.testWeatherSystem();
        
        // Test 7: Deployment Scripts
        await this.testDeploymentScripts();
        
        // Test 8: Local Deployment
        await this.testLocalDeployment();
        
        // Generate Report
        this.generateTestReport();
    }

    async testFileStructure() {
        this.log('📁 Testing File Structure...', 'info');
        
        const requiredFiles = [
            'index.html',
            'style.css',
            'script.js',
            'README.md',
            'build-all.bat',
            'deploy-web.bat',
            'deploy-mobile.bat',
            'deploy-local.bat',
            'deploy.bat'
        ];
        
        const requiredDirs = [
            'styles',
            'android',
            'ios',
            'local-deploy'
        ];
        
        // Test files
        for (const file of requiredFiles) {
            const filePath = path.join(this.projectRoot, file);
            if (fs.existsSync(filePath)) {
                this.log(`✅ Found required file: ${file}`, 'pass');
                this.passed.push(`File: ${file}`);
            } else {
                this.log(`❌ Missing required file: ${file}`, 'error');
                this.errors.push(`Missing file: ${file}`);
            }
        }
        
        // Test directories
        for (const dir of requiredDirs) {
            const dirPath = path.join(this.projectRoot, dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                this.log(`✅ Found required directory: ${dir}`, 'pass');
                this.passed.push(`Directory: ${dir}`);
            } else {
                this.log(`❌ Missing required directory: ${dir}`, 'error');
                this.errors.push(`Missing directory: ${dir}`);
            }
        }
    }

    async testHTMLStructure() {
        this.log('📄 Testing HTML Structure...', 'info');
        
        try {
            const htmlContent = fs.readFileSync(path.join(this.projectRoot, 'index.html'), 'utf8');
            
            // Check for required elements
            const requiredElements = [
                { tag: 'div', id: 'theme-panel', class: 'style-selector' },
                { tag: 'select', id: 'style-dropdown' },
                { tag: 'input', id: 'auto-rotate', type: 'checkbox' },
                { tag: 'button', id: 'fullscreen-toggle' },
                { tag: 'div', class: 'container' },
                { tag: 'header', class: 'day-display' },
                { tag: 'section', class: 'time-section' },
                { tag: 'section', class: 'weather-section' }
            ];
            
            for (const element of requiredElements) {
                let selector = element.tag;
                if (element.id) selector += `#${element.id}`;
                if (element.class) selector += `.${element.class}`;
                
                if (element.id && htmlContent.includes(`id="${element.id}"`)) {
                    this.log(`✅ Found element: ${selector}`, 'pass');
                    this.passed.push(`HTML Element: ${selector}`);
                } else if (element.class && htmlContent.includes(`class="${element.class}"`)) {
                    this.log(`✅ Found element: ${selector}`, 'pass');
                    this.passed.push(`HTML Element: ${selector}`);
                } else {
                    this.log(`❌ Missing element: ${selector}`, 'error');
                    this.errors.push(`Missing HTML element: ${selector}`);
                }
            }
            
            // Check for theme options
            const themeOptions = htmlContent.match(/<option[^>]*value="([^"]*)"[^>]*>([^<]*)<\/option>/g);
            if (themeOptions && themeOptions.length >= 12) {
                this.log(`✅ Found ${themeOptions.length} theme options`, 'pass');
                this.passed.push(`Theme Options: ${themeOptions.length}`);
            } else {
                this.log(`❌ Insufficient theme options: ${themeOptions ? themeOptions.length : 0}`, 'error');
                this.errors.push('Insufficient theme options');
            }
            
        } catch (error) {
            this.log(`❌ Error reading HTML: ${error.message}`, 'error');
            this.errors.push(`HTML read error: ${error.message}`);
        }
    }

    async testCSSStructure() {
        this.log('🎨 Testing CSS Structure...', 'info');
        
        try {
            const cssContent = fs.readFileSync(path.join(this.projectRoot, 'style.css'), 'utf8');
            
            // Check for required imports
            const requiredImports = [
                'styles/theme-panel-consolidated.css',
                'styles/weather-layout.css',
                'styles/kiosk-optimized.css'
            ];
            
            for (const importFile of requiredImports) {
                if (cssContent.includes(importFile)) {
                    this.log(`✅ Found CSS import: ${importFile}`, 'pass');
                    this.passed.push(`CSS Import: ${importFile}`);
                } else {
                    this.log(`❌ Missing CSS import: ${importFile}`, 'error');
                    this.errors.push(`Missing CSS import: ${importFile}`);
                }
            }
            
            // Check theme panel CSS
            const themePanelCSS = fs.readFileSync(path.join(this.projectRoot, 'styles/theme-panel-consolidated.css'), 'utf8');
            if (themePanelCSS.includes('flex-direction: column')) {
                this.log(`✅ Theme panel uses original column layout`, 'pass');
                this.passed.push('Original column layout');
            } else {
                this.log(`❌ Theme panel not using original column layout`, 'error');
                this.errors.push('Theme panel layout issue');
            }
            
            // Check for theme files
            const stylesDir = path.join(this.projectRoot, 'styles');
            const themeFiles = fs.readdirSync(stylesDir).filter(file => file.endsWith('.css'));
            
            if (themeFiles.length >= 12) {
                this.log(`✅ Found ${themeFiles.length} theme files`, 'pass');
                this.passed.push(`Theme files: ${themeFiles.length}`);
            } else {
                this.log(`❌ Insufficient theme files: ${themeFiles.length}`, 'error');
                this.errors.push('Insufficient theme files');
            }
            
        } catch (error) {
            this.log(`❌ Error reading CSS: ${error.message}`, 'error');
            this.errors.push(`CSS read error: ${error.message}`);
        }
    }

    async testJavaScriptStructure() {
        this.log('⚡ Testing JavaScript Structure...', 'info');
        
        try {
            const jsContent = fs.readFileSync(path.join(this.projectRoot, 'script.js'), 'utf8');
            
            // Check for required class and methods
            const requiredComponents = [
                'class StatusDisplay',
                'constructor()',
                'init()',
                'startClock()',
                'updateWeather()',
                'initStyleSelector()',
                'initFullscreen()'
            ];
            
            for (const component of requiredComponents) {
                if (jsContent.includes(component)) {
                    this.log(`✅ Found JavaScript component: ${component}`, 'pass');
                    this.passed.push(`JS Component: ${component}`);
                } else {
                    this.log(`❌ Missing JavaScript component: ${component}`, 'error');
                    this.errors.push(`Missing JS component: ${component}`);
                }
            }
            
            // Check for theme array
            if (jsContent.includes('this.themes = [') && jsContent.includes('styles/candy.css')) {
                this.log(`✅ Theme array properly configured`, 'pass');
                this.passed.push('Theme array');
            } else {
                this.log(`❌ Theme array not properly configured`, 'error');
                this.errors.push('Theme array issue');
            }
            
        } catch (error) {
            this.log(`❌ Error reading JavaScript: ${error.message}`, 'error');
            this.errors.push(`JavaScript read error: ${error.message}`);
        }
    }

    async testThemeSystem() {
        this.log('🎨 Testing Theme System...', 'info');
        
        try {
            // Test theme switching functionality
            const jsContent = fs.readFileSync(path.join(this.projectRoot, 'script.js'), 'utf8');
            
            const themeMethods = [
                'changeTheme(',
                'startAutoRotate()',
                'stopAutoRotate()',
                'cycleTheme()'
            ];
            
            for (const method of themeMethods) {
                if (jsContent.includes(method)) {
                    this.log(`✅ Found theme method: ${method}`, 'pass');
                    this.passed.push(`Theme method: ${method}`);
                } else {
                    this.log(`❌ Missing theme method: ${method}`, 'error');
                    this.errors.push(`Missing theme method: ${method}`);
                }
            }
            
            // Test keyboard shortcuts
            const shortcuts = ['keydown', 'case \'t\'', 'case \'f\'', 'case \'r\''];
            let foundShortcuts = 0;
            
            for (const shortcut of shortcuts) {
                if (jsContent.includes(shortcut)) {
                    foundShortcuts++;
                }
            }
            
            if (foundShortcuts >= 4) {
                this.log(`✅ Keyboard shortcuts implemented`, 'pass');
                this.passed.push('Keyboard shortcuts');
            } else {
                this.log(`⚠️ Limited keyboard shortcuts: ${foundShortcuts}/4`, 'warning');
                this.warnings.push('Limited keyboard shortcuts');
            }
            
        } catch (error) {
            this.log(`❌ Error testing theme system: ${error.message}`, 'error');
            this.errors.push(`Theme system error: ${error.message}`);
        }
    }

    async testWeatherSystem() {
        this.log('🌤️ Testing Weather System...', 'info');
        
        try {
            const jsContent = fs.readFileSync(path.join(this.projectRoot, 'script.js'), 'utf8');
            
            const weatherComponents = [
                'updateWeather()',
                'weatherData',
                'fetch(',
                'OpenWeatherMap',
                'WeatherAPI'
            ];
            
            let foundComponents = 0;
            for (const component of weatherComponents) {
                if (jsContent.includes(component)) {
                    foundComponents++;
                    this.log(`✅ Found weather component: ${component}`, 'pass');
                    this.passed.push(`Weather component: ${component}`);
                }
            }
            
            if (foundComponents >= 4) {
                this.log(`✅ Weather system well implemented`, 'pass');
                this.passed.push('Weather system');
            } else {
                this.log(`⚠️ Weather system partially implemented: ${foundComponents}/4`, 'warning');
                this.warnings.push('Partial weather system');
            }
            
        } catch (error) {
            this.log(`❌ Error testing weather system: ${error.message}`, 'error');
            this.errors.push(`Weather system error: ${error.message}`);
        }
    }

    async testDeploymentScripts() {
        this.log('🚀 Testing Deployment Scripts...', 'info');
        
        const deploymentScripts = [
            'build-all.bat',
            'deploy-web.bat',
            'deploy-mobile.bat',
            'deploy-local.bat',
            'deploy.bat'
        ];
        
        for (const script of deploymentScripts) {
            try {
                const scriptContent = fs.readFileSync(path.join(this.projectRoot, script), 'utf8');
                
                if (scriptContent.length > 100) {
                    this.log(`✅ Deployment script valid: ${script}`, 'pass');
                    this.passed.push(`Deployment script: ${script}`);
                } else {
                    this.log(`❌ Deployment script too small: ${script}`, 'error');
                    this.errors.push(`Invalid deployment script: ${script}`);
                }
                
            } catch (error) {
                this.log(`❌ Error reading deployment script ${script}: ${error.message}`, 'error');
                this.errors.push(`Deployment script error: ${script}`);
            }
        }
    }

    async testLocalDeployment() {
        this.log('🌐 Testing Local Deployment...', 'info');
        
        try {
            const localDeployDir = path.join(this.projectRoot, 'local-deploy');
            
            if (!fs.existsSync(localDeployDir)) {
                this.log(`❌ Local deployment directory missing`, 'error');
                this.errors.push('Missing local-deploy directory');
                return;
            }
            
            const requiredLocalFiles = [
                'index.html',
                'style.css',
                'script.js',
                'server.py',
                'server.js'
            ];
            
            for (const file of requiredLocalFiles) {
                const filePath = path.join(localDeployDir, file);
                if (fs.existsSync(filePath)) {
                    this.log(`✅ Local deployment file: ${file}`, 'pass');
                    this.passed.push(`Local file: ${file}`);
                } else {
                    this.log(`❌ Missing local deployment file: ${file}`, 'error');
                    this.errors.push(`Missing local file: ${file}`);
                }
            }
            
            // Check styles directory in local-deploy
            const localStylesDir = path.join(localDeployDir, 'styles');
            if (fs.existsSync(localStylesDir)) {
                const localThemeFiles = fs.readdirSync(localStylesDir).filter(file => file.endsWith('.css'));
                if (localThemeFiles.length >= 12) {
                    this.log(`✅ Local deployment has ${localThemeFiles.length} theme files`, 'pass');
                    this.passed.push(`Local themes: ${localThemeFiles.length}`);
                } else {
                    this.log(`❌ Local deployment missing theme files: ${localThemeFiles.length}`, 'error');
                    this.errors.push('Missing local theme files');
                }
            } else {
                this.log(`❌ Local deployment missing styles directory`, 'error');
                this.errors.push('Missing local styles directory');
            }
            
        } catch (error) {
            this.log(`❌ Error testing local deployment: ${error.message}`, 'error');
            this.errors.push(`Local deployment error: ${error.message}`);
        }
    }

    generateTestReport() {
        this.log('📊 Generating Test Report...', 'info');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: this.passed.length,
                errors: this.errors.length,
                warnings: this.warnings.length
            },
            details: {
                passed: this.passed,
                errors: this.errors,
                warnings: this.warnings
            },
            status: this.errors.length === 0 ? 'PASS' : 'FAIL'
        };
        
        // Save report to file
        const reportPath = path.join(this.projectRoot, 'TEST_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // Generate markdown report
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.projectRoot, 'TEST_REPORT.md');
        fs.writeFileSync(markdownPath, markdownReport);
        
        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('🎯 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Passed: ${report.summary.passed}`);
        console.log(`❌ Errors: ${report.summary.errors}`);
        console.log(`⚠️  Warnings: ${report.summary.warnings}`);
        console.log(`📊 Total Tests: ${report.summary.total}`);
        console.log(`🏆 Status: ${report.status}`);
        console.log('='.repeat(60));
        
        if (report.status === 'PASS') {
            console.log('🎉 All tests passed! The Atomic Clock Display is ready for production.');
        } else {
            console.log('⚠️ Some tests failed. Please review the errors and fix them.');
        }
        
        return report;
    }

    generateMarkdownReport(report) {
        return `# Atomic Clock Display - Test Report

**Generated:** ${new Date().toLocaleString()}

## 📊 Test Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | ${report.summary.passed} |
| ❌ Errors | ${report.summary.errors} |
| ⚠️ Warnings | ${report.summary.warnings} |
| 📊 Total | ${report.summary.total} |
| 🏆 Status | ${report.status} |

## ✅ Passed Tests

${report.details.passed.map(item => `- ${item}`).join('\n')}

## ❌ Errors

${report.details.errors.length > 0 ? report.details.errors.map(item => `- ${item}`).join('\n') : 'No errors found!'}

## ⚠️ Warnings

${report.details.warnings.length > 0 ? report.details.warnings.map(item => `- ${item}`).join('\n') : 'No warnings!'}

## 🎯 Recommendations

${report.status === 'PASS' ? 
    '🎉 **Excellent!** All tests passed. The Atomic Clock Display is ready for production deployment.' :
    '⚠️ **Action Required:** Please address the errors listed above before deploying to production.'
}

---
*Report generated by Atomic Clock Display Test Suite*
`;
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const tester = new AtomicClockTester();
    tester.runAllTests().catch(console.error);
}

module.exports = AtomicClockTester;
