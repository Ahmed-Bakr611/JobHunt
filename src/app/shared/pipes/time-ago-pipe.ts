import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | undefined | null): string {
    if (!value) return 'Unknown';

    const date = value instanceof Date ? value : new Date(value);

    // Check if date is valid
    if (isNaN(date.getTime())) return 'Unknown';

    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Future dates
    if (seconds < 0) return 'Just now';

    // Less than a minute
    if (seconds < 60) return 'Just now';

    // Minutes
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
    }

    // Hours
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }

    // Days
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return days === 1 ? '1 day ago' : `${days} days ago`;
    }

    // Weeks
    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    }

    // Months
    const months = Math.floor(days / 30);
    if (months < 12) {
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }

    // Years
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}
