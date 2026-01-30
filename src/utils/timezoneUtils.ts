import { TickMarkType } from 'lightweight-charts';

export const TIMEZONES = [
  { value: 'Local', label: 'Local' },
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'New York' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Australia/Sydney', label: 'Sydney' },
];

export const createTimezoneFormatters = (timezone: string) => {
  // Helper to format date in specific timezone (or local if 'Local')
  const format = (time: number, options: Intl.DateTimeFormatOptions) => {
    const opts = { ...options };
    if (timezone !== 'Local') {
        opts.timeZone = timezone;
    }
    return new Date(time * 1000).toLocaleString('en-US', opts);
  };

  const timeFormatter = (time: number) => {
    return format(time, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const tickMarkFormatter = (time: number, tickMarkType: TickMarkType) => {
    // TickMarkType: Year=0, Month=1, DayOfMonth=2, Time=3, TimeWithSeconds=4
    switch (tickMarkType) {
      case TickMarkType.Year:
        return format(time, { year: 'numeric' });
      case TickMarkType.Month:
        return format(time, { month: 'short', year: 'numeric' }); // e.g. "Jan 2023"
      case TickMarkType.DayOfMonth:
        return format(time, { day: 'numeric', month: 'short' }); // e.g. "Jun 1"
      case TickMarkType.Time:
        return format(time, { hour: '2-digit', minute: '2-digit', hour12: false });
      case TickMarkType.TimeWithSeconds:
        return format(time, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      default:
        return '';
    }
  };

  return {
    localization: {
      timeFormatter,
    },
    timeScale: {
      tickMarkFormatter,
    },
  };
};
