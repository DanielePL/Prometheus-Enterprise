import { AccessLog, AccessMethod, AccessStatus, Member } from '@/types/database';

function getMethodLabel(method: AccessMethod): string {
  switch (method) {
    case 'face_recognition': return 'Face Recognition';
    case 'bluetooth': return 'Device';
    case 'manual': return 'Manual';
    case 'qr_code': return 'QR Code';
    default: return method;
  }
}

function getStatusLabel(status: AccessStatus): string {
  switch (status) {
    case 'granted': return 'Granted';
    case 'denied': return 'Denied';
    case 'pending': return 'Pending';
    default: return status;
  }
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportCSV(
  logs: AccessLog[],
  memberMap: Map<string, Member>
): void {
  const header = 'Zeitpunkt,Mitglied,Methode,Status,Konfidenz,Details';
  const rows = logs.map((log) => {
    const memberName = log.member_id ? (memberMap.get(log.member_id)?.name || 'Unknown') : 'Unknown';
    const confidence = log.confidence_score
      ? `${(log.confidence_score * 100).toFixed(1)}%`
      : '';
    const details = log.denial_reason || log.terminal_name || '';

    return [
      formatDateTime(log.attempted_at),
      escapeCsvField(memberName),
      getMethodLabel(log.access_method),
      getStatusLabel(log.access_status),
      confidence,
      escapeCsvField(details),
    ].join(',');
  });

  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `access-logs-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printLogs(): void {
  window.print();
}
