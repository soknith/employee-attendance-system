# GPS Prompt

You are implementing the GPS attendance engine for the SovannKiri Attendance Kit.

## Requirements

1. Use the browser Geolocation API (`navigator.geolocation`)
2. Request high accuracy positioning
3. Calculate distance from school using the Haversine formula
4. Validate the teacher is within the school geofence radius
5. Validate GPS accuracy is ≤ 50 meters
6. Prevent duplicate check-in/check-out per day
7. Automatically mark late check-ins after the grace period

## Haversine Formula

```typescript
function haversineDistance(lat1, lon1, lat2, lon2): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
    Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## Check-in Flow

1. Request GPS position (high accuracy, 10s timeout)
2. Get school settings (lat, lng, radius, grace period)
3. Calculate distance from school
4. If distance > radius → reject: "You are outside the school area."
5. If accuracy > 50m → warn but allow
6. Check for existing check-in today → reject if duplicate
7. Compare time with morning_late_after → mark "late" if after
8. Insert record with all GPS metadata

## Check-out Flow

Same GPS verification, then:
1. Check for existing check-out today → reject if duplicate
2. Insert record with check_type = "check_out"

## Error Handling

| Scenario | Response |
|----------|----------|
| GPS unsupported | "Your device doesn't support GPS" |
| Permission denied | "Location permission denied" |
| Timeout | "Unable to get your location. Try again." |
| Outside radius | "You are outside the school area." |
| Already checked in | "You have already checked in today." |
| Already checked out | "You have already checked out today." |

## Data Captured

- latitude, longitude (GPS coordinates)
- accuracy_meters (GPS accuracy)
- distance_meters (from school)
- device_info (device name)
- browser_info (user agent)
- scanned_at (timestamp)
- status (present / late)
- check_type (check_in / check_out)

## Rules

1. GPS requires HTTPS (or localhost for dev)
2. Always handle permission denial gracefully
3. Never store fake or mock coordinates
4. Log all GPS verification attempts
5. School coordinates come from school_settings table
