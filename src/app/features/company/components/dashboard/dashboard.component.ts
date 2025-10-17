import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'jb-dashboard',
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="container section-padding page-container">
      <h1><mat-icon>dashboard</mat-icon> Company Dashboard</h1>
      <div class="card-grid">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Active Jobs</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>0</h2>
            <p>Coming soon</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Total Applications</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>0</h2>
            <p>Coming soon</p>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Pending Reviews</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <h2>0</h2>
            <p>Coming soon</p>
          </mat-card-content>
        </mat-card>
      </div>
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
      h2 {
        font-size: 48px;
        margin: 16px 0;
        color: #1976d2;
      }
    `,
  ],
})
export class DashboardComponent {}
