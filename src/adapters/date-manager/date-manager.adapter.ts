export abstract class DateManagerAdapter {
  abstract now(): Date;
  abstract addDays(date: Date, days: number): Date;
  abstract format(date: Date, format: string): string;
  abstract addHours(date: Date, hours: number): Date;
}
