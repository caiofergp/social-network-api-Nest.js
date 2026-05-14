import { DateManagerAdapter } from './date-manager.adapter';
import { addDays, format as formatDate, addHours } from 'date-fns';

export class DateFnsAdapter implements DateManagerAdapter {
  now(): Date {
    return new Date();
  }

  addDays(date: Date, days: number): Date {
    return addDays(date, days);
  }

  format(date: Date, format: string): string {
    return formatDate(date, format);
  }

  addHours(date: Date, hours: number): Date {
    return addHours(date, hours);
  }
}
