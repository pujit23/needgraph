import * as XLSX from 'xlsx';
import type { WardPerformance, ReportMetrics } from '../types';

const FILENAME = 'NeedGraph_Report_Jan2026_Apr2026.xlsx';

/** Auto-fit column widths based on the max character length in each column. */
function autoFitColumns(data: Record<string, unknown>[]): XLSX.ColInfo[] {
  if (data.length === 0) return [];
  const keys = Object.keys(data[0]);
  return keys.map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((row) => String(row[key] ?? '').length),
    );
    return { wch: Math.min(maxLen + 4, 40) };
  });
}

/**
 * Exports report data as a two-sheet XLSX workbook.
 * Sheet 1 "Summary"         — KPI label/value pairs
 * Sheet 2 "Ward Performance" — Full ward table
 * Throws on error so the caller can surface a toast notification.
 */
export function exportReportExcel(
  metrics: ReportMetrics,
  wards: WardPerformance[],
): void {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Summary ────────────────────────────────────
  const summaryRows = [
    { Metric: 'Total Needs Recorded', Value: metrics.totalNeeds },
    { Metric: 'Crises Prevented',     Value: metrics.crisesPrevented },
    { Metric: 'Volunteers Deployed',  Value: metrics.volunteersDeployed },
    { Metric: 'People Helped',        Value: metrics.peopleHelped },
    { Metric: 'Report Period',        Value: 'Jan 2026 – Apr 2026' },
    { Metric: 'Generated At',         Value: new Date().toLocaleString() },
  ];
  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = autoFitColumns(summaryRows as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');

  // ── Sheet 2: Ward Performance ───────────────────────────
  const wardRows = wards.map((w) => ({
    Ward:                w.ward,
    'Needs Recorded':    w.recorded,
    'Needs Resolved':    w.resolved,
    'Resolution Rate %': w.recorded > 0 ? Math.round((w.resolved / w.recorded) * 100) : 0,
    'Avg Resolution':    w.avgResolutionTime,
    'Volunteers':        w.volunteersDeployed,
    'Score (0–100)':     w.outcomeScore,
  }));
  const wardSheet = XLSX.utils.json_to_sheet(wardRows);
  wardSheet['!cols'] = autoFitColumns(wardRows as Record<string, unknown>[]);
  XLSX.utils.book_append_sheet(wb, wardSheet, 'Ward Performance');

  XLSX.writeFile(wb, FILENAME);
}
