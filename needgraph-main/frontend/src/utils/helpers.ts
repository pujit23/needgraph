import type { NeedType, UrgencyLevel } from '../types';

export function getUrgencyFromSeverity(severity: number): UrgencyLevel {
  if (severity >= 80) return 'Critical';
  if (severity >= 60) return 'High';
  if (severity >= 40) return 'Medium';
  return 'Low';
}

export function getSeverityColor(severity: number): string {
  if (severity >= 80) return '#E05555';
  if (severity >= 60) return '#D4874A';
  if (severity >= 40) return '#C9A84C';
  return '#4AAF85';
}

export function getUrgencyColor(urgency: UrgencyLevel): string {
  const colors: Record<UrgencyLevel, string> = {
    Critical: '#E05555',
    High: '#D4874A',
    Medium: '#C9A84C',
    Low: '#4AAF85',
  };
  return colors[urgency];
}

export function getUrgencyBg(urgency: UrgencyLevel): string {
  // Return the main color for borders (no opacity allowed in this plain style)
  return getUrgencyColor(urgency);
}

export function getUrgencyEmoji(urgency: UrgencyLevel): string {
  const emojis: Record<UrgencyLevel, string> = {
    Critical: '🔴',
    High: '🟠',
    Medium: '🟡',
    Low: '🟢',
  };
  return emojis[urgency];
}

export function getNeedTypeIcon(needType: NeedType): string {
  const icons: Record<NeedType, string> = {
    'Food Insecurity': '🍚',
    'School Dropout': '📚',
    'Mental Health': '🧠',
    'Healthcare': '🏥',
    'Domestic Violence': '🛡️',
    'Unemployment': '💼',
    'Water Scarcity': '💧',
    'Child Malnutrition': '👶',
  };
  return icons[needType];
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function getMarkerRadius(affectedCount: number): number {
  if (affectedCount >= 300) return 14;
  if (affectedCount >= 200) return 12;
  if (affectedCount >= 100) return 10;
  if (affectedCount >= 50) return 8;
  return 6;
}
