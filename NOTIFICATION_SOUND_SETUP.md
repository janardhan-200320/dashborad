# Adding Custom Notification Sound

## Quick Setup

To use a custom notification sound instead of the browser-generated beep:

1. **Find or create** a notification sound file (MP3 format recommended)
2. **Rename** it to `notification.mp3`
3. **Place** it in the `client/public/` folder
4. **Restart** the development server

## Sound File Requirements

- **Format**: MP3 (recommended), WAV, or OGG
- **Duration**: 0.5 - 2 seconds (short sounds work best)
- **File Size**: < 100KB recommended
- **Sample Rate**: 44.1kHz standard

## Finding Free Notification Sounds

### Recommended Resources:
- **Freesound.org**: https://freesound.org/search/?q=notification
- **Zapsplat**: https://www.zapsplat.com/sound-effect-category/notifications/
- **Mixkit**: https://mixkit.co/free-sound-effects/notification/

### Popular Sound Types:
- Soft bell chime
- Glass ping
- Bubble pop
- Digital beep
- Gentle gong

## Creating Your Own Sound

### Using Audacity (Free):
1. Download Audacity: https://www.audacityteam.org/
2. Generate → Tone → Sine wave → 800Hz → 0.5 seconds
3. Effect → Fade Out → Last 0.2 seconds
4. File → Export → Export as MP3
5. Name as `notification.mp3`

### Using Online Generators:
- **Bfxr**: https://www.bfxr.net/
- **ChipTone**: https://sfbgames.itch.io/chiptone
- **AudioMass**: https://audiomass.co/

## Testing Your Sound

After adding the sound file:

1. Navigate to **Help & Support** page
2. Click **"Test Notification"** button
3. Listen for your custom sound
4. Adjust volume if needed in `NotificationPopup.tsx`

## Troubleshooting

**Sound not playing?**
- Check file is named exactly `notification.mp3`
- Verify file is in `client/public/` folder
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser console for errors

**Sound too loud/quiet?**
Edit `NotificationPopup.tsx`, line ~16:
```typescript
audio.volume = 0.5; // Change value (0.0 to 1.0)
```

**Browser blocks autoplay?**
Some browsers block audio autoplay. The system automatically falls back to the generated beep sound.

## Alternative: Using Multiple Sounds

To use different sounds for different notification categories:

1. Add multiple sound files:
   - `notification-booking.mp3`
   - `notification-invoice.mp3`
   - `notification-pos.mp3`
   - `notification-system.mp3`

2. Modify `playNotificationSound()` in `NotificationPopup.tsx`:
```typescript
function playNotificationSound(category: string) {
  try {
    const audio = new Audio(\`/notification-\${category}.mp3\`);
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Fallback...
    });
  } catch (e) {
    console.error('Failed to play notification sound', e);
  }
}
```

3. Pass category when calling:
```typescript
playNotificationSound(notification.category);
```
