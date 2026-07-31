# 07 — GPS Attendance Engine

## Overview

The GPS attendance engine verifies that a teacher is physically present at school before accepting a check-in or check-out.

## Components

### 1. School Geofence
- Defined by school latitude/longitude and a radius in meters
- Configured in `school_settings` table
- Default radius: 150 meters

### 2. Browser Geolocation
- Uses `navigator.geolocation.getCurrentPosition()`
- Requests high accuracy
- Timeout: 10 seconds
- Requires HTTPS (or localhost)

### 3. Distance Calculation
Haversine formula calculates the great-circle distance between two GPS points:

```
distance = haversine(schoolLat, schoolLng, userLat, userLng)
```

### 4. Validation Rules

| Check | Rule |
|-------|------|
| Inside radius | distance ≤ radius_meters |
| GPS accuracy | accuracy ≤ 50 meters |
| Device support | geolocation API available |
| Permission | User grants location access |

## Check-in Flow

1. Teacher taps "Check In" button
2. App requests GPS position (high accuracy)
3. App calculates distance from school coordinates
4. If distance > radius → reject with "outside school area"
5. If GPS accuracy > 50m → warn but allow
6. Check for existing check-in today → reject if duplicate
7. Compare check-in time with `morning_late_after` → mark as "late" if after
8. Insert attendance record with status (present/late)

## Check-out Flow

1. Teacher taps "Check Out" button
2. Same GPS verification as check-in
3. Check for existing check-out today → reject if duplicate
4. Insert attendance record with check_type = "check_out"

## Grace Period

- `morning_late_after` (default 07:15) — check-ins after this time are "late"
- `afternoon_late_after` (default 13:15) — afternoon check-ins after this are "late"

## Error Handling

| Scenario | Message |
|----------|---------|
| GPS not supported | "Your device doesn't support GPS" |
| Permission denied | "Location permission denied" |
| Timeout | "Unable to get your location. Try again." |
| Outside radius | "You are outside the school area." |
| Already checked in | "You have already checked in today." |
| Already checked out | "You have already checked out today." |

## Data Stored

Each attendance record captures:
- GPS coordinates (latitude, longitude)
- GPS accuracy in meters
- Distance from school in meters
- Device info and browser string
- Timestamp
- Status (present/late)
- Check type (check_in/check_out)
