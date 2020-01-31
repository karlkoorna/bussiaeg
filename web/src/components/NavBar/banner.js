const today = new Date();
const date = today.getDate();
const month = today.getMonth() + 1;
const year = today.getFullYear();

export default function banner() {
	switch (date.toString().padStart(2, '0') + '.' + month.toString().padStart(2, '0')) {
		case '01.01': // New Year
			return 'fireworks';
		case '14.02': // Valentine's Day
			return 'hearts';
		case '24.02': // Independence Day
			return 'flags';
		case '14.03': // Native Language Day
			return 'symbols';
		case '01.05': // Spring Day
			return 'flowers';
		case '23.06': // St. John's Day
		case '24.06':
			return 'campfires';
		case '31.10': // Halloween
			return 'ghosts';
		case '02.11': // All Souls' Day
			return 'candles';
		case '07.12': // Bussiaeg.ee's Birthday
			return 'vehicles';
		case '31.12': // New Year's Eve
			return 'rockets';
		default: {
			if (date > 22 && date < 25 && month === 12) return 'presents'; // Christmas
			if (month === 12) return 'snow'; // Winter
			
			if (month === 4) {
				const holiday = new Date();
				holiday.setMonth(4);
				holiday.setDate(1);
				holiday.setDate(holiday.getDate() + 14 - holiday.getDay());
				if (holiday.getDate() === date) return 'flowers'; // Mother's Day
			} else if (month === 11) {
				const holiday = new Date();
				holiday.setMonth(11);
				holiday.setDate(1);
				holiday.setDate(holiday.getDate() + 14 - holiday.getDay());
				if (holiday.getDate() === date) return 'bowties'; // Father's Day
			}
			
			const a = year % 19;
			const b = Math.floor(year / 100);
			const c = year % 100;
			const d = Math.floor(b / 4);
			const e = b % 4;
			const f = Math.floor((b + 8) / 25);
			const g = Math.floor((b - f + 1) / 3);
			const h = (19 * a + b - d - g + 15) % 30;
			const i = Math.floor(c / 4);
			const j = c % 4;
			const k = (32 + 2 * e + 2 * i - h - j) % 7;
			const l = Math.floor((a + 11 * h + 22 * k) / 451);
			const m = h + k + 7 * l + 114;
			const holiday = new Date(year, Math.floor(m / 31) - 1, m % 31 + 1);
			if (holiday.getDate() === date && holiday.getMonth() + 1 === month) return 'eggs'; // Easter
			
			holiday.setDate(holiday.getDate() - (holiday.getDay() || 7 - 1) % 4);
			if (holiday.getDate() === date && holiday.getMonth() + 1 === month) return 'crosses'; // Good Friday
			
			return '';
		}
	}
}
