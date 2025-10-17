// src/app/core/services/form-change-detection.service.ts
import { Injectable, signal, Signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Configuration for tracking additional fields beyond the form
 */
export interface ChangeDetectionConfig {
  /** Additional fields to track (e.g., file uploads) */
  additionalFields?: { [key: string]: any };
}

/**
 * Service to detect changes in forms and additional tracked fields
 * Useful for enabling/disabling save buttons based on changes
 */
@Injectable({
  providedIn: 'root',
})
export class FormChangeDetectionService {
  private trackers = new Map<
    string,
    {
      initialFormValue: any;
      initialAdditionalFields: { [key: string]: any };
      currentAdditionalFields: { [key: string]: any };
      hasChanges: ReturnType<typeof signal<boolean>>;
      subscription?: Subscription;
    }
  >();

  /**
   * Start tracking changes for a form
   * @param trackerId Unique identifier for this tracker
   * @param form The FormGroup to track
   * @param config Optional configuration for additional fields
   * @returns Signal that emits true when changes are detected
   */
  startTracking(
    trackerId: string,
    form: FormGroup,
    config?: ChangeDetectionConfig
  ): Signal<boolean> {
    // Clean up existing tracker if it exists
    this.stopTracking(trackerId);

    // Create new tracker
    const hasChanges = signal(false);
    const initialAdditionalFields = config?.additionalFields
      ? JSON.parse(JSON.stringify(config.additionalFields))
      : {};

    const tracker = {
      initialFormValue: form.value,
      initialAdditionalFields,
      currentAdditionalFields: { ...initialAdditionalFields },
      hasChanges,
      subscription: form.valueChanges.subscribe(() => {
        this.checkChanges(trackerId, form);
      }),
    };

    this.trackers.set(trackerId, tracker);

    // Initial check
    this.checkChanges(trackerId, form);

    return hasChanges.asReadonly();
  }

  /**
   * Update an additional tracked field (e.g., uploaded file URL)
   * @param trackerId The tracker identifier
   * @param fieldName Name of the field to update
   * @param value New value for the field
   */
  updateField(trackerId: string, fieldName: string, value: any): void {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) {
      console.warn(`Tracker "${trackerId}" not found`);
      return;
    }

    tracker.currentAdditionalFields[fieldName] = value;
    this.checkChanges(trackerId);
  }

  /**
   * Get multiple field values
   * @param trackerId The tracker identifier
   * @returns Object containing all additional field values
   */
  getAdditionalFields(trackerId: string): { [key: string]: any } | null {
    const tracker = this.trackers.get(trackerId);
    return tracker ? { ...tracker.currentAdditionalFields } : null;
  }

  /**
   * Reset tracking to current state (useful after successful save)
   * @param trackerId The tracker identifier
   * @param form The FormGroup being tracked
   */
  resetToCurrentState(trackerId: string, form: FormGroup): void {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) {
      console.warn(`Tracker "${trackerId}" not found`);
      return;
    }

    tracker.initialFormValue = form.value;
    tracker.initialAdditionalFields = JSON.parse(JSON.stringify(tracker.currentAdditionalFields));
    this.checkChanges(trackerId, form);
  }

  /**
   * Stop tracking and cleanup
   * @param trackerId The tracker identifier
   */
  stopTracking(trackerId: string): void {
    const tracker = this.trackers.get(trackerId);
    if (tracker) {
      if (tracker.subscription) {
        tracker.subscription.unsubscribe();
      }
      this.trackers.delete(trackerId);
    }
  }

  /**
   * Check if there are any changes
   * @param trackerId The tracker identifier
   * @param form Optional FormGroup (if not provided, only additional fields are checked)
   */
  private checkChanges(trackerId: string, form?: FormGroup): void {
    const tracker = this.trackers.get(trackerId);
    if (!tracker) return;

    let hasFormChanges = false;
    let hasFieldChanges = false;

    // Check form changes
    if (form) {
      const currentFormValue = form.value;
      hasFormChanges =
        JSON.stringify(currentFormValue) !== JSON.stringify(tracker.initialFormValue);
    }

    // Check additional field changes
    hasFieldChanges =
      JSON.stringify(tracker.currentAdditionalFields) !==
      JSON.stringify(tracker.initialAdditionalFields);

    tracker.hasChanges.set(hasFormChanges || hasFieldChanges);
  }

  /**
   * Manually trigger change detection
   * @param trackerId The tracker identifier
   */
  triggerChangeDetection(trackerId: string): void {
    this.checkChanges(trackerId);
  }

  /**
   * Get the current hasChanges signal
   * @param trackerId The tracker identifier
   * @returns Signal indicating if there are changes, or null if tracker not found
   */
  getChangesSignal(trackerId: string): Signal<boolean> | null {
    const tracker = this.trackers.get(trackerId);
    return tracker ? tracker.hasChanges.asReadonly() : null;
  }

  /**
   * Check if a specific tracker exists
   * @param trackerId The tracker identifier
   * @returns true if tracker exists
   */
  hasTracker(trackerId: string): boolean {
    return this.trackers.has(trackerId);
  }

  /**
   * Cleanup all trackers (useful in app cleanup)
   */
  cleanupAll(): void {
    this.trackers.forEach((_, trackerId) => {
      this.stopTracking(trackerId);
    });
  }
}
