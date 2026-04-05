import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isAfter, isBefore, addDays } from "date-fns";

type TabType = "fixed" | "flexible" | "anytime";

interface DatePickerModalProps {
  onApply: (result: { label: string; duration: number; startDate?: Date; endDate?: Date }) => void;
  onClose: () => void;
}

const MONTHS_AHEAD = 12;

const DatePickerModal = ({ onApply, onClose }: DatePickerModalProps) => {
  const [tab, setTab] = useState<TabType>("fixed");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [days, setDays] = useState(7);

  // Build months list for flexible tab
  const flexMonths: Date[] = Array.from({ length: MONTHS_AHEAD }, (_, i) =>
    addMonths(startOfMonth(new Date()), i)
  );

  // Fixed tab: two-month calendar view
  const nextMonth = addMonths(currentMonth, 1);

  const getDaysInMonth = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    // Pad with nulls for day-of-week alignment
    const startDay = start.getDay();
    return { days, startDay };
  };

  const handleDayClick = (day: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else {
      if (isBefore(day, startDate)) {
        setStartDate(day);
        setEndDate(null);
      } else {
        setEndDate(day);
      }
    }
  };

  const isInRange = (day: Date) => {
    if (!startDate || !endDate) return false;
    return isAfter(day, startDate) && isBefore(day, endDate);
  };

  const handleApply = () => {
    if (tab === "fixed") {
      if (!startDate) return;
      const end = endDate || startDate;
      const duration = Math.max(1, Math.round((end.getTime() - startDate.getTime()) / 86400000) + 1);
      onApply({
        label: endDate
          ? `${format(startDate, "MMM d")} – ${format(end, "MMM d, yyyy")}`
          : format(startDate, "MMM d, yyyy"),
        duration,
        startDate,
        endDate: end,
      });
    } else if (tab === "flexible") {
      const monthLabel = selectedMonth ? format(selectedMonth, "MMMM yyyy") : "Any month";
      onApply({ label: `${monthLabel} · ${days} Days`, duration: days });
    } else {
      onApply({ label: `${days} Days (Anytime)`, duration: days });
    }
  };

  const handleClear = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedMonth(null);
    setDays(7);
  };

  const summaryLabel = () => {
    if (tab === "fixed" && startDate) {
      if (endDate) {
        const dur = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1);
        return `${format(startDate, "MMM d")} – ${format(endDate, "MMM d")} | ${dur} Days`;
      }
      return `${format(startDate, "MMM d, yyyy")} | Select end date`;
    }
    if ((tab === "flexible" || tab === "anytime") && days) return `${days} Days`;
    return "Select dates";
  };

  const renderCalendar = (month: Date) => {
    const { days: monthDays, startDay } = getDaysInMonth(month);
    const blanks = Array.from({ length: startDay });

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          {month === currentMonth ? (
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, -1))}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : <div className="w-6" />}
          <p className="text-sm font-semibold text-navy">{format(month, "MMMM yyyy")}</p>
          {month === nextMonth ? (
            <button
              onClick={() => setCurrentMonth(m => addMonths(m, 1))}
              className="p-1 rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ) : <div className="w-6" />}
        </div>
        <div className="grid grid-cols-7 mb-1">
          {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
            <div key={d} className="text-center text-xs text-muted-foreground py-1 font-medium">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {monthDays.map((day) => {
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);
            const inRange = isInRange(day);
            const isPast = isBefore(day, addDays(new Date(), -1));

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isPast && handleDayClick(day)}
                disabled={isPast}
                className={`
                  h-9 w-full text-xs font-medium relative transition-all
                  ${isPast ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-mint-light cursor-pointer"}
                  ${isStart || isEnd ? "gradient-mint text-navy rounded-full font-bold z-10" : ""}
                  ${inRange ? "bg-mint-light text-navy" : ""}
                  ${!isStart && !isEnd && !inRange ? "text-navy" : ""}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        {tab === "fixed" && !startDate && (
          <p className="text-center text-xs text-destructive mt-3">Select your start date</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-3xl shadow-elevated w-full max-w-[640px] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <h2 className="font-display text-lg font-bold text-navy">When do you want to travel?</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Summary bar */}
        <div className="px-6 py-3 border-b border-border bg-secondary/30">
          <p className="text-sm text-muted-foreground font-medium">{summaryLabel()}</p>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5 pb-2 flex gap-2">
          {(["fixed", "flexible", "anytime"] as TabType[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                tab === t
                  ? "gradient-mint text-navy shadow-mint"
                  : "bg-secondary text-muted-foreground hover:bg-mint-light hover:text-navy"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="px-6 py-4 min-h-[280px]">
          {tab === "fixed" && (
            <div className="flex gap-6">
              {renderCalendar(currentMonth)}
              <div className="w-px bg-border" />
              {renderCalendar(nextMonth)}
            </div>
          )}

          {tab === "flexible" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {flexMonths.map((month, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMonth(month)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-sm font-medium ${
                      selectedMonth && isSameMonth(selectedMonth, month)
                        ? "border-mint bg-mint-light text-navy"
                        : "border-border bg-white hover:border-mint/50 text-navy"
                    }`}
                  >
                    <span className="text-base">📅</span>
                    <span className="text-xs">{format(month, "MMM, yyyy")}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-medium text-navy">How many days?</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDays(d => Math.max(1, d - 1))}
                    className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:border-mint transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5 text-navy" />
                  </button>
                  <span className="w-10 text-center font-bold text-navy text-base">{days}</span>
                  <button
                    onClick={() => setDays(d => Math.min(30, d + 1))}
                    className="w-8 h-8 rounded-full border-2 border-border flex items-center justify-center hover:border-mint transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-navy" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "anytime" && (
            <div className="flex flex-col items-center justify-center gap-6 py-6">
              <p className="text-sm font-medium text-navy">How many days?</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setDays(d => Math.max(1, d - 1))}
                  className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-mint transition-colors"
                >
                  <Minus className="w-4 h-4 text-navy" />
                </button>
                <span className="w-14 text-center font-bold text-navy text-2xl">{days}</span>
                <button
                  onClick={() => setDays(d => Math.min(30, d + 1))}
                  className="w-10 h-10 rounded-full border-2 border-border flex items-center justify-center hover:border-mint transition-colors"
                >
                  <Plus className="w-4 h-4 text-navy" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border">
          <button
            onClick={handleClear}
            className="btn-atlas-outline h-10 px-6 text-sm"
          >
            Clear
          </button>
          <button
            onClick={handleApply}
            className="btn-atlas-primary h-10 px-6 text-sm"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
