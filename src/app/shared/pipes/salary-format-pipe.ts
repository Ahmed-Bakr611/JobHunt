import { Pipe, PipeTransform } from '@angular/core';
import { Salary } from '../models/job.model';

@Pipe({
  name: 'salaryFormat',
})
export class SalaryFormatPipe implements PipeTransform {
  transform(salary: Salary | undefined | null): string {
    if (!salary) return 'Not specified';

    const { min, max, currency = 'USD', period = 'yearly' } = salary;

    // Validate salary values
    if (min === undefined && max === undefined) return 'Not specified';

    // Format currency symbol
    const currencySymbol = this.getCurrencySymbol(currency);

    // Format numbers with commas
    const formattedMin = min !== undefined ? this.formatNumber(min) : null;
    const formattedMax = max !== undefined ? this.formatNumber(max) : null;

    // Build salary string
    let salaryString = '';

    if (formattedMin && formattedMax) {
      salaryString = `${currencySymbol}${formattedMin} - ${currencySymbol}${formattedMax}`;
    } else if (formattedMin) {
      salaryString = `From ${currencySymbol}${formattedMin}`;
    } else if (formattedMax) {
      salaryString = `Up to ${currencySymbol}${formattedMax}`;
    }

    // Add period
    const periodText = this.getPeriodText(period);
    return `${salaryString}${periodText}`;
  }

  private formatNumber(num: number): string {
    // Format number with commas (e.g., 50000 -> 50,000)
    return num.toLocaleString('en-US');
  }

  private getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      EGP: 'E£',
      JPY: '¥',
      CAD: 'C$',
      AUD: 'A$',
      INR: '₹',
      AED: 'AED ',
      SAR: 'SAR ',
    };
    return symbols[currency.toUpperCase()] || `${currency} `;
  }

  private getPeriodText(period: string): string {
    const periods: Record<string, string> = {
      hourly: '/hr',
      monthly: '/mo',
      yearly: '/yr',
      annual: '/yr',
    };
    return periods[period.toLowerCase()] || '';
  }
}
