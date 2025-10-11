import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  startAfter,
  getCountFromServer,
} from '@angular/fire/firestore';
import { ResponseVM } from './response.viewmodel';
import { defer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreCrudService<T> {
  constructor(private firestore: Firestore) {}

  getAll(
    collectionName: string,
    page = 1,
    limitSize = 10,
    lastDoc?: any
  ): Observable<ResponseVM<T>> {
    return defer(async (): Promise<ResponseVM<T>> => {
      try {
        const collRef = collection(this.firestore, collectionName);

        let q = query(collRef, orderBy('createdAt'), limit(limitSize));
        if (lastDoc) {
          q = query(collRef, orderBy('createdAt'), startAfter(lastDoc), limit(limitSize));
        }

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];

        const totalSnap = await getCountFromServer(collRef);
        const total = totalSnap.data().count;

        return {
          success: true,
          data,
          pagination: { page, limit: limitSize, total },
          loading: false,
          error: null,
        };
      } catch (e: any) {
        return {
          success: false,
          data: [],
          pagination: { page, limit: limitSize },
          loading: false,
          error: e.message || 'Failed to fetch documents',
        };
      }
    });
  }

  getById(collectionName: string, id: string): Observable<ResponseVM<T>> {
    return defer(async (): Promise<ResponseVM<T>> => {
      try {
        const docRef = doc(this.firestore, collectionName, id);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          return {
            success: true,
            data: { id: snapshot.id, ...snapshot.data() } as T,
            loading: false,
            error: null,
          };
        }
        return { success: false, data: null, loading: false, error: 'Not found' };
      } catch (e: any) {
        return { success: false, data: null, loading: false, error: e.message };
      }
    });
  }

  create(collectionName: string, item: T): Observable<ResponseVM<T>> {
    return defer(async (): Promise<ResponseVM<T>> => {
      try {
        const collRef = collection(this.firestore, collectionName);
        const docRef = await addDoc(collRef, { ...item, createdAt: new Date() });

        return {
          success: true,
          data: { id: docRef.id, ...item } as T,
          loading: false,
          error: null,
        };
      } catch (e: any) {
        return { success: false, data: null, loading: false, error: e.message };
      }
    });
  }

  update(collectionName: string, id: string, item: Partial<T>): Observable<ResponseVM<T>> {
    return defer(async (): Promise<ResponseVM<T>> => {
      try {
        const docRef = doc(this.firestore, collectionName, id);
        await updateDoc(docRef, item);

        return {
          success: true,
          data: { id, ...item } as T,
          loading: false,
          error: null,
        };
      } catch (e: any) {
        return { success: false, data: null, loading: false, error: e.message };
      }
    });
  }

  delete(collectionName: string, id: string): Observable<ResponseVM<null>> {
    return defer(async (): Promise<ResponseVM<null>> => {
      try {
        const docRef = doc(this.firestore, collectionName, id);
        await deleteDoc(docRef);

        return { success: true, data: null, loading: false, error: null };
      } catch (e: any) {
        return { success: false, data: null, loading: false, error: e.message };
      }
    });
  }
}
