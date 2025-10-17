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
  setDoc,
} from '@angular/fire/firestore';
import { ResponseVM } from './response.viewmodel';
import { defer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreCrudService {
  constructor(private firestore: Firestore) {}

  getAll<T>(
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

  getById<T>(collectionName: string, id: string): Observable<ResponseVM<T>> {
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

  // create<T>(collectionName: string, item: T): Observable<ResponseVM<T>> {
  //   return defer(async (): Promise<ResponseVM<T>> => {
  //     try {
  //       const collRef = collection(this.firestore, collectionName);
  //       const docRef = await addDoc(collRef, { ...item, createdAt: new Date() });

  //       return {
  //         success: true,
  //         data: { id: docRef.id, ...item } as T,
  //         loading: false,
  //         error: null,
  //       };
  //     } catch (e: any) {
  //       return { success: false, data: null, loading: false, error: e.message };
  //     }
  //   });
  // }
  create<T extends object>(collectionName: string, item: T): Observable<ResponseVM<T>> {
    return defer(async (): Promise<ResponseVM<T>> => {
      try {
        const collRef = collection(this.firestore, collectionName);
        let docRef;
        let finalId: string;

        if ('uid' in item) {
          // Use the id from item
          console.log('FINLLLLLLLLLLLLLLY');
          finalId = item.uid as string;
          docRef = doc(collRef, finalId);
          await setDoc(docRef, { ...item, createdAt: new Date().toLocaleDateString() });
        } else {
          // Let Firebase generate the id
          docRef = await addDoc(collRef, { ...item, createdAt: new Date().toLocaleDateString() });
          finalId = docRef.id;
        }

        return {
          success: true,
          data: { id: finalId, ...item } as T,
          loading: false,
          error: null,
        };
      } catch (e: any) {
        return { success: false, data: null, loading: false, error: e.message };
      }
    });
  }

  update<T>(collectionName: string, id: string, item: Partial<T>): Observable<ResponseVM<T>> {
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

  delete<T>(collectionName: string, id: string): Observable<ResponseVM<null>> {
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
