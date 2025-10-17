// job.service.ts
import { Injectable } from '@angular/core';
import { ResponseVM } from './../../../../FireBase/response.viewmodel';
import { Job } from '../../../shared/models/job.model';
import { FirestoreCrudService } from '../../../../FireBase/firestorecrud.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private collectionName = 'jobs';

  constructor(private firestoreService: FirestoreCrudService) {}

  getAll(page = 1, limit = 10, lastDoc?: any): Observable<ResponseVM<Job>> {
    return this.firestoreService.getAll(this.collectionName, page, limit, lastDoc);
  }

  getById(id: string): Observable<ResponseVM<Job>> {
    return this.firestoreService.getById(this.collectionName, id);
  }

  create(job: Job): Observable<ResponseVM<Job>> {
    return this.firestoreService.create(this.collectionName, job);
  }

  update(id: string, job: Partial<Job>): Observable<ResponseVM<Job>> {
    return this.firestoreService.update(this.collectionName, id, job);
  }

  delete(id: string): Observable<ResponseVM<null>> {
    return this.firestoreService.delete(this.collectionName, id);
  }
}
