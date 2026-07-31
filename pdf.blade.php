<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <title>{{ $data['type'] ?? 'report' }} Report</title>
    <style>
        body { font-family: 'Inter', 'Noto Sans Khmer', sans-serif; padding: 20px; }
        h1 { font-size: 20px; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f5f5f5; }
        .summary { display: flex; gap: 20px; margin: 15px 0; }
        .summary div { padding: 10px; border: 1px solid #ddd; border-radius: 5px; text-align: center; }
        .summary .value { font-size: 24px; font-weight: bold; }
        .summary .label { font-size: 11px; color: #666; }
    </style>
</head>
<body>
    <h1>{{ ucfirst($data['type'] ?? 'daily') }} Report — {{ $data['date'] ?? ($data['year'] ?? '') }}</h1>
    <div class="summary">
        <div><div class="value">{{ $data['present'] ?? 0 }}</div><div class="label">Present</div></div>
        <div><div class="value">{{ $data['late'] ?? 0 }}</div><div class="label">Late</div></div>
        <div><div class="value">{{ $data['absent'] ?? 0 }}</div><div class="label">Absent</div></div>
        <div><div class="value">{{ $data['leave'] ?? 0 }}</div><div class="label">Leave</div></div>
    </div>
    @if (isset($data['records']) && $data['records'] instanceof \Illuminate\Database\Eloquent\Collection)
    <table>
        <thead>
            <tr><th>Teacher</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th><th>Late (min)</th><th>Hours</th></tr>
        </thead>
        <tbody>
            @foreach ($data['records'] as $record)
            <tr>
                <td>{{ $record->teacher?->full_name_en ?? 'N/A' }}</td>
                <td>{{ $record->attendance_date }}</td>
                <td>{{ $record->check_in ?? '--' }}</td>
                <td>{{ $record->check_out ?? '--' }}</td>
                <td>{{ $record->status }}</td>
                <td>{{ $record->late_minutes }}</td>
                <td>{{ $record->working_hours }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif
</body>
</html>
