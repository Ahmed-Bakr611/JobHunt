import { FirestoreCrudService } from '../FireBase/firestorecrud.service';
import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogData,
} from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { JobCardComponent } from './features/jobs/components/job-card/job-card.component';
import { Job } from './shared/models/job.model';
import { JobListComponent } from './features/jobs/components/job-list/job-list.component';
import { MOCK_JOBS } from './core/mocks/jobs.mock';
import { ResponseVM } from '../FireBase/response.viewmodel';
import { JsonPipe } from '@angular/common';
import { TestUploadComponent } from './shared/components/test/test';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    MatIconModule,
    HeaderComponent,
    FooterComponent,
    JsonPipe,
    TestUploadComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('Jobly');
  // arr: ResponseVM<Job>[] = [];
  // constructor(private FService: FirestoreCrudService<Job>) {}
  // async addJobs() {
  //   const promises = MOCK_JOBS.map((job) => this.FService.create('jobs', job));
  //   const results = await Promise.all(promises);
  //   this.arr.push(...results);
  // }
}
