# Auto-Logout Implementation Documentation

## Overview

This implementation provides a comprehensive auto-logout feature that automatically logs out users after 15 minutes of inactivity. It includes warning notifications, user-friendly interfaces, and follows security best practices.

## 🏗️ Architecture

### Core Components

1. **`useAutoLogout` Hook** (`src/app/hooks/useAutoLogout.ts`)
   - Main logic for tracking user activity
   - Manages timers and notifications
   - Handles logout process

2. **`AutoLogoutWrapper` Component** (`src/app/components/AutoLogoutWrapper.tsx`)
   - Wraps the entire application
   - Initializes auto-logout functionality
   - Provides debugging information in development

3. **`SessionStatus` Component** (`src/app/components/SessionStatus.tsx`)
   - Visual session timer for users
   - Manual session extension controls
   - Real-time countdown display

## 🔧 Implementation Details

### Step 1: Activity Monitoring

```typescript
// Events monitored for user activity
const activityEvents = [
  'mousedown',    // Mouse clicks
  'mousemove',    // Mouse movement
  'keypress',     // Keyboard input
  'scroll',       // Page scrolling
  'touchstart',   // Touch interactions
  'click',        // Click events
  'focus'         // Form focus
]
```

**Why these events?**
- **Comprehensive coverage**: Captures all common user interactions
- **Performance optimized**: Uses `passive: true` for better performance
- **Cross-platform**: Works on desktop and mobile devices

### Step 2: Timer Management

```typescript
const DEFAULT_CONFIG = {
  timeoutMinutes: 15,    // 15 minutes total
  warningMinutes: 2,     // Warning 2 minutes before logout
  checkIntervalMs: 1000  // Check every second
}
```

**Timer Logic:**
1. **Activity Detection**: Reset timer on any user interaction
2. **Warning Phase**: Show notification 2 minutes before logout
3. **Logout Phase**: Automatically logout after 15 minutes

### Step 3: User Notifications

#### Warning Notification
- **Appears**: 2 minutes before logout
- **Style**: Orange gradient with pulsing indicator
- **Actions**: "Stay Logged In" button
- **Auto-remove**: After warning period expires

#### Logout Notification
- **Appears**: When logout occurs
- **Style**: Red gradient with status message
- **Auto-remove**: After 5 seconds

### Step 4: Integration Points

#### Main Application (`src/app/page.tsx`)
```typescript
export default function HomePage() {
  return (
    <AppErrorBoundary>
      <UserProvider>
        <AuthProvider>
          <AutoLogoutWrapper>  {/* ← Auto-logout wrapper */}
            <ProtectedContent />
          </AutoLogoutWrapper>
        </AuthProvider>
      </UserProvider>
    </AppErrorBoundary>
  )
}
```

#### App Content (`src/app/components/AppContent.tsx`)
```typescript
return (
  <div className="min-h-screen bg-slate-50">
    <TopNavigation />
    <main>{renderContent()}</main>
    <BottomNavigation />
    <SessionStatus />  {/* ← Session timer component */}
  </div>
)
```

## 🎯 Features

### 1. **Smart Activity Detection**
- Monitors multiple user interaction types
- Resets timer on any activity
- Performance-optimized event listeners

### 2. **Progressive Warnings**
- **13 minutes**: Normal operation
- **13-15 minutes**: Warning notification appears
- **15 minutes**: Automatic logout

### 3. **User Control**
- Manual session extension
- Immediate logout option
- Visual countdown timer

### 4. **Visual Feedback**
- Session timer in bottom-right corner
- Color-coded warnings (blue → orange → red)
- Smooth animations and transitions

### 5. **Security Features**
- Automatic cleanup on unmount
- Prevents multiple logout attempts
- Graceful error handling

## 🔄 User Experience Flow

```
User logs in
    ↓
Timer starts (15 minutes)
    ↓
User interacts with app
    ↓
Timer resets
    ↓
[After 13 minutes of inactivity]
    ↓
Warning notification appears
    ↓
User can: "Stay Logged In" or ignore
    ↓
[After 15 minutes of inactivity]
    ↓
Automatic logout + notification
    ↓
Redirect to login page
```

## 🛠️ Configuration Options

### Custom Timeouts
```typescript
const { timeRemaining } = useAutoLogout({
  timeoutMinutes: 30,    // 30 minutes instead of 15
  warningMinutes: 5,     // 5 minutes warning instead of 2
  checkIntervalMs: 500   // Check every 0.5 seconds
})
```

### Development Features
- Session timer visible in development mode
- Console logging for debugging
- Manual logout testing

## 🔒 Security Considerations

### 1. **Session Management**
- Integrates with existing auth system
- Proper cleanup on logout
- Prevents session hijacking

### 2. **Memory Management**
- Clears all timers on unmount
- Removes event listeners
- Prevents memory leaks

### 3. **Error Handling**
- Graceful fallbacks
- Console error logging
- User-friendly error messages

## 📱 Mobile Considerations

### Touch Events
- Monitors `touchstart` events
- Works on mobile browsers
- Responsive notification design

### Performance
- Passive event listeners
- Efficient timer management
- Minimal battery impact

## 🧪 Testing

### Manual Testing
1. **Start session**: Log in to the app
2. **Wait 13 minutes**: No interaction
3. **Warning appears**: Orange notification
4. **Wait 2 more minutes**: Automatic logout
5. **Test extension**: Click "Stay Logged In"

### Development Testing
```typescript
// Temporarily reduce timeouts for testing
const { timeRemaining } = useAutoLogout({
  timeoutMinutes: 1,     // 1 minute for testing
  warningMinutes: 0.5    // 30 seconds warning
})
```

## 🚀 Best Practices Implemented

### 1. **Hook-based Architecture**
- Reusable across components
- Clean separation of concerns
- Easy to test and maintain

### 2. **Performance Optimization**
- Passive event listeners
- Efficient timer management
- Minimal re-renders

### 3. **User Experience**
- Clear visual feedback
- Multiple interaction options
- Smooth animations

### 4. **Security**
- Proper cleanup
- Error handling
- Session validation

### 5. **Accessibility**
- Keyboard navigation support
- Screen reader friendly
- High contrast notifications

## 🔧 Troubleshooting

### Common Issues

1. **Timer not resetting**
   - Check if user is authenticated
   - Verify event listeners are attached
   - Check console for errors

2. **Warning not appearing**
   - Verify warning configuration
   - Check DOM manipulation
   - Ensure z-index is correct

3. **Logout not working**
   - Verify auth context integration
   - Check logout function
   - Ensure proper cleanup

### Debug Mode
```typescript
// Enable detailed logging
console.log('🔒 Auto-logout monitoring active')
console.log('🔄 User activity detected')
console.log('⚠️ Warning notification shown')
console.log('🚪 Auto-logout triggered')
```

## 📈 Future Enhancements

### Potential Improvements
1. **Server-side session validation**
2. **Customizable notification styles**
3. **Activity heatmap tracking**
4. **Session recovery options**
5. **Multi-tab synchronization**

### Configuration Options
1. **Per-user timeout settings**
2. **Role-based timeouts**
3. **Activity-based extensions**
4. **Custom warning messages**

This implementation provides a robust, user-friendly auto-logout system that enhances security while maintaining excellent user experience. 