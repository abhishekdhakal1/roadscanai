// Central place that defines how severity levels map to color and copy.
// Keep this in sync with whatever the FastAPI backend eventually sends
// in the `severity` field of a pothole record.

export const SEVERITY = {
  low: {
    label: 'Low',
    hex: '#22C55E',
    tailwindBg: 'bg-severity-low',
    tailwindText: 'text-severity-low',
    description: 'Minor surface wear, no immediate action required'
  },
  medium: {
    label: 'Medium',
    hex: '#F59E0B',
    tailwindBg: 'bg-severity-medium',
    tailwindText: 'text-severity-medium',
    description: 'Noticeable depth, schedule for repair'
  },
  high: {
    label: 'High',
    hex: '#EF4444',
    tailwindBg: 'bg-severity-high',
    tailwindText: 'text-severity-high',
    description: 'Deep or wide pothole, hazardous to vehicles'
  }
}

export function getSeverity(level) {
  return SEVERITY[level] ?? SEVERITY.low
}
