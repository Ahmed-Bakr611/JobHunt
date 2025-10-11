// src/app/shared/components/loader/loader.component.ts
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
@Component({
  selector: 'jb-loader',
  imports: [CommonModule, MatProgressBarModule],
  templateUrl: `./loader.component.html`,
  styleUrls: ['./loader.component.css'],
})
export class LoaderComponent {
  fullscreen = input(false);
  diameter = input<number>(50);
  color = input<'primary' | 'accent' | 'warn'>('primary');
  message = input<null | string>(null);

  /** Prevent Angular Material spinner from breaking with invalid diameters */
  get safeDiameter(): number {
    const val = this.diameter();
    return val && val > 0 ? val : 50; // fallback to default
  }
}
