# Notification Popup System Documentation

## Overview
The notification popup system provides real-time visual and audio alerts when new notifications arrive in the Zervos dashboard. Notifications appear as animated popups in the top-right corner of the screen with a notification sound.

## Features

### 🔔 **Popup Notifications**
- **Animated Entry**: Popups slide in from the right with spring animations
- **Auto-dismiss**: Each notification auto-dismisses after 5 seconds with a progress bar
- **Manual Dismiss**: Users can close notifications manually with the X button
- **Stacking**: Multiple notifications stack vertically (max 5 visible at once)
- **Category-based Styling**: Different colors for bookings, invoices, POS, and system notifications

### 🔊 **Sound Notifications**
- Plays audio alert when new notification arrives
- Fallback to browser-generated beep sound if audio file unavailable
- Non-intrusive volume (50%)

### 🎨 **Visual Design**
- **Bookings**: Blue theme with Calendar icon
- **Invoices**: Green theme with FileText icon
- **POS**: Purple theme with ShoppingCart icon
- **System**: Gray theme with CheckCircle icon
- Smooth Framer Motion animations
- Backdrop blur effect
- Shadow and border styling

## Components

### 1. NotificationPopup Component
**Location**: `client/src/components/NotificationPopup.tsx`

Main component that renders popup notifications:
- Monitors localStorage for new notifications
- Listens for `new-notification` custom event
- Manages popup queue and auto-dismissal
- Plays notification sounds

### 2. NotificationDropdown Component
**Location**: `client/src/components/NotificationDropdown.tsx`

Enhanced with popup integration:
- Existing dropdown functionality maintained
- New `addNotification()` export function
- Dispatches custom events when notifications are added

### 3. DashboardLayout Integration
**Location**: `client/src/components/DashboardLayout.tsx`

Popup component integrated at layout level:
```tsx
<NotificationPopup />
```
Renders on all dashboard pages.

## Usage

### Adding Notifications Programmatically

Import the helper function:
```typescript
import { addNotification } from '@/components/NotificationDropdown';
```

Create a notification:
```typescript
addNotification({
  title: 'New booking: Hair Styling',
  body: 'John Doe booked Hair Styling at 2:00 PM',
  category: 'bookings', // 'bookings' | 'invoices' | 'pos' | 'system'
  path: '/dashboard/appointments', // Optional navigation path
});
```

### Testing Notifications

A "Test Notification" button has been added to the Help & Support page:
1. Navigate to Help & Support
2. Click "Test Notification" button
3. Random notification will appear with sound

### Notification Categories

| Category | Icon | Color | Use Case |
|----------|------|-------|----------|
| `bookings` | 📅 Calendar | Blue | New appointments, booking updates |
| `invoices` | 📄 FileText | Green | Payment received, invoice updates |
| `pos` | 🛒 ShoppingCart | Purple | POS sales, inventory alerts |
| `system` | ✅ CheckCircle | Gray | System updates, announcements |

## Technical Details

### Data Structure

```typescript
type NotificationItem = {
  id: string;              // Auto-generated: n-{timestamp}-{random}
  title: string;           // Main notification text
  body?: string;           // Optional detailed message
  category: 'bookings' | 'invoices' | 'pos' | 'system';
  path?: string;           // Optional navigation path
  date: string;            // ISO timestamp
  read?: boolean;          // Read status
};
```

### Storage
- **Key**: `zervos_notifications_v1`
- **Format**: JSON array of NotificationItem objects
- **Persistence**: localStorage (browser-local)

### Events

**Custom Event: `new-notification`**
```typescript
window.dispatchEvent(new CustomEvent('new-notification', { 
  detail: notificationObject 
}));
```

**Custom Event: `notifications-updated`**
```typescript
window.dispatchEvent(new CustomEvent('notifications-updated', { 
  detail: notificationArray 
}));
```

### Sound System

1. **Primary**: Attempts to play `/notification.mp3` from public folder
2. **Fallback**: Browser Audio API generates 800Hz sine wave beep
3. **Volume**: 30-50% to avoid disruption
4. **Duration**: ~0.5 seconds

## Animations

Powered by Framer Motion:

### Entry Animation
```typescript
initial={{ opacity: 0, x: 400, scale: 0.8 }}
animate={{ opacity: 1, x: 0, scale: 1 }}
transition={{ type: "spring", stiffness: 300, damping: 30 }}
```

### Shake Effect
```typescript
animate={{ rotate: [0, -2, 2, -2, 0] }}
transition={{ duration: 0.5, delay: 0.2 }}
```

### Progress Bar
```typescript
initial={{ scaleX: 0 }}
animate={{ scaleX: 1 }}
transition={{ duration: 5, ease: "linear" }}
onAnimationComplete={() => removePopup(popupId)}
```

### Exit Animation
```typescript
exit={{ opacity: 0, x: 400, scale: 0.8, transition: { duration: 0.2 } }}
```

## Integration Points

### Current Integrations
1. **Help & Support**: Test notification button
2. **DashboardLayout**: Renders popup component globally

### Potential Future Integrations
- Appointments page: New booking notifications
- Invoices page: Payment received notifications
- POS page: Sale completion notifications
- Calendar: Upcoming appointment reminders
- Workflows: Automation trigger notifications

## Customization

### Changing Auto-Dismiss Duration
In `NotificationPopup.tsx`, modify the progress bar:
```typescript
transition={{ duration: 5 }} // Change from 5 seconds
```

### Maximum Visible Popups
In `NotificationPopup.tsx`, modify the slice:
```typescript
{popupQueue.slice(0, 5).map(...)} // Change from 5
```

### Sound Volume
In `NotificationPopup.tsx`, modify the audio:
```typescript
audio.volume = 0.5; // Change from 0.5 (50%)
```

Or beep sound:
```typescript
gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Change from 0.3
```

### Position
In `NotificationPopup.tsx`, modify the container:
```typescript
className="fixed top-20 right-6 z-[100]..." 
// Change top-20 (5rem) or right-6 (1.5rem)
```

## Browser Support

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Modern mobile browsers

**Requirements**:
- localStorage support
- Web Audio API support (for sound)
- CSS transforms and animations

## Performance Considerations

1. **Polling Interval**: Checks for new notifications every 1 second
2. **Queue Limit**: Only 5 popups visible at once
3. **Auto-cleanup**: Notifications automatically dismissed after 5 seconds
4. **Event-driven**: Immediate popup for programmatically added notifications (no polling delay)

## Accessibility

- Semantic HTML structure
- ARIA labels for dismiss buttons
- Keyboard dismissible (via X button focus)
- Screen reader compatible
- Non-blocking UI (pointer-events-none on container)
- Sufficient color contrast for text

## Troubleshooting

### No Sound Playing
1. Check browser autoplay policy
2. Ensure `/notification.mp3` exists in public folder
3. Fallback beep should still work

### Popups Not Appearing
1. Verify `NotificationPopup` is rendered in `DashboardLayout`
2. Check browser console for errors
3. Ensure localStorage is enabled

### Popups Not Auto-Dismissing
1. Check Framer Motion installation
2. Verify `onAnimationComplete` callback
3. Check browser performance/throttling

## Example: Real-World Integration

```typescript
// In appointments.tsx - when new booking is created
import { addNotification } from '@/components/NotificationDropdown';

function handleBookingCreated(booking: Booking) {
  // Save booking...
  
  // Show notification
  addNotification({
    title: `New booking: ${booking.serviceName}`,
    body: `${booking.customerName} booked ${booking.serviceName} at ${booking.time}`,
    category: 'bookings',
    path: '/dashboard/appointments',
  });
}
```

## Future Enhancements

- [ ] Notification preferences (enable/disable sound)
- [ ] Custom notification sounds per category
- [ ] Click notification to navigate to path
- [ ] Notification history panel
- [ ] Push notifications (browser API)
- [ ] Email/SMS notification options
- [ ] Notification scheduling
- [ ] Batch notifications summary
- [ ] User-specific notification filters

## Credits

- **UI Framework**: Framer Motion for animations
- **Icons**: Lucide React
- **Sound**: Web Audio API
- **Storage**: Browser localStorage
