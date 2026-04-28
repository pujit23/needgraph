import { Copy, CheckCheck, Clock } from 'lucide-react';
import { useDedupStats } from '../lib/dataService';
import { formatTimeAgo } from '../utils/helpers';

/**
 * DeduplicationBadge — shows live deduplication stats on the dashboard.
 * Indicates how many duplicate field reports were merged / need review.
 */
export default function DeduplicationBadge() {
  const stats = useDedupStats();

  return (
    <div className="bg-[#111118] border border-[#1E1E2E] rounded-[8px] p-[16px_20px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[6px] bg-[#1A1A2E] flex items-center justify-center">
            <Copy className="w-3.5 h-3.5 text-[#6C63FF]" />
          </div>
          <span className="text-[11px] text-[#55556A] uppercase tracking-[0.06em] font-medium">
            Deduplication
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#55556A]">
          <Clock className="w-3 h-3" />
          {formatTimeAgo(stats.lastRunAt)}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-[20px] font-semibold text-[#F0F0F5]">
            {stats.totalDuplicatesFound}
          </div>
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Found</div>
        </div>
        <div className="text-center">
          <div className="text-[20px] font-semibold text-[#4AAF85]">
            {stats.mergedToday}
          </div>
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Merged</div>
        </div>
        <div className="text-center">
          <div className="text-[20px] font-semibold text-[#C9A84C]">
            {stats.pendingReview}
          </div>
          <div className="text-[10px] text-[#55556A] uppercase tracking-wider">Pending</div>
        </div>
      </div>

      {stats.pendingReview > 0 && (
        <button className="w-full mt-3 py-1.5 rounded-[4px] border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] font-medium hover:bg-[#C9A84C]/10 transition-colors flex items-center justify-center gap-1.5">
          <CheckCheck className="w-3.5 h-3.5" />
          Review {stats.pendingReview} duplicates
        </button>
      )}
    </div>
  );
}
