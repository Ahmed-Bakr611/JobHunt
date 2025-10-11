import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-my-applications',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container section-padding page-container">
      <h1><mat-icon>assignment</mat-icon> My Applications</h1>
      <mat-card>
        <mat-card-content>
          <p>Applications dashboard under construction. Will show:</p>
          <ul>
            <li>All submitted applications</li>
            <li>Application status (pending, reviewing, accepted, rejected)</li>
            <li>Filter by status</li>
            <li>Application timeline</li>
            <li>Withdraw option</li>
          </ul>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }
    `,
  ],
})
export class MyApplicationsComponent {}
