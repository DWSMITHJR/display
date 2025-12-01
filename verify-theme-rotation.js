// Theme Rotation Verification Script
// Run this in browser console to verify theme rotation functionality

function verifyThemeRotation() {
    console.log('🎨 Verifying Theme Rotation Functionality...\n');
    
    // Check if StatusDisplay exists
    const display = window.display || document.querySelector('.status-display');
    if (!display) {
        console.error('❌ StatusDisplay not found');
        return false;
    }
    
    console.log('✅ StatusDisplay found');
    
    // Check theme array
    if (!display.themes || display.themes.length !== 12) {
        console.error('❌ Themes array incorrect:', display.themes);
        return false;
    }
    
    console.log('✅ Themes array correct (12 themes)');
    console.log('   Available themes:', display.themes);
    
    // Check auto-rotate checkbox
    const checkbox = document.getElementById('auto-rotate');
    if (!checkbox) {
        console.error('❌ Auto-rotate checkbox not found');
        return false;
    }
    
    console.log('✅ Auto-rotate checkbox found');
    
    // Check theme dropdown
    const dropdown = document.getElementById('style-dropdown');
    if (!dropdown) {
        console.error('❌ Theme dropdown not found');
        return false;
    }
    
    console.log('✅ Theme dropdown found');
    
    // Check methods exist
    const requiredMethods = ['startAutoRotate', 'stopAutoRotate', 'getThemeName'];
    for (const method of requiredMethods) {
        if (typeof display[method] !== 'function') {
            console.error(`❌ Method ${method} not found`);
            return false;
        }
    }
    
    console.log('✅ All required methods exist');
    
    // Test getThemeName method
    const testName = display.getThemeName('styles/dark.css');
    if (testName !== 'Dark') {
        console.error('❌ getThemeName method failed:', testName);
        return false;
    }
    
    console.log('✅ getThemeName method working correctly');
    
    // Check localStorage
    const autoRotateSetting = localStorage.getItem('autoRotateThemes');
    console.log('📋 Current auto-rotate setting:', autoRotateSetting);
    
    const selectedStyle = localStorage.getItem('selectedStyle');
    console.log('📋 Current selected style:', selectedStyle);
    
    // Test notification system
    if (typeof display.showNotification !== 'function') {
        console.error('❌ Notification system not found');
        return false;
    }
    
    console.log('✅ Notification system available');
    
    console.log('\n🎉 All theme rotation components verified successfully!');
    console.log('\n📝 Manual Test Instructions:');
    console.log('1. Check the "Auto-rotate" checkbox');
    console.log('2. Wait 30 seconds for theme to change');
    console.log('3. Manually select a theme to stop auto-rotation');
    console.log('4. Re-check "Auto-rotate" to restart');
    
    return true;
}

// Quick test function
function quickTest() {
    console.log('🚀 Running Quick Theme Rotation Test...\n');
    
    // Test 1: Check auto-rotate start
    const display = window.display || document.querySelector('.status-display');
    if (!display) {
        console.error('❌ Display not found');
        return;
    }
    
    console.log('Test 1: Starting auto-rotation...');
    display.startAutoRotate();
    
    setTimeout(() => {
        console.log('✅ Auto-rotation started (check for notification)');
        
        // Test 2: Check interval
        if (display.autoRotateInterval) {
            console.log('✅ Auto-rotate interval is active');
        } else {
            console.error('❌ Auto-rotate interval not found');
        }
        
        // Test 3: Stop auto-rotation
        console.log('\nTest 3: Stopping auto-rotation...');
        display.stopAutoRotate();
        
        setTimeout(() => {
            if (!display.autoRotateInterval) {
                console.log('✅ Auto-rotation stopped successfully');
            } else {
                console.error('❌ Auto-rotation failed to stop');
            }
            
            console.log('\n🎯 Quick test completed!');
        }, 1000);
    }, 1000);
}

// Run verification
verifyThemeRotation();

// Uncomment to run quick test
// quickTest();
