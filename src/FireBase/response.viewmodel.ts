// response-vm.model.ts
export interface Pagination {
  page: number;
  limit: number;
  total?: number; // optional, since Firestore may not return it
}

export interface ResponseVM<T> {
  success: boolean;
  data: T | T[] | null;
  pagination?: Pagination;
  loading?: boolean; // request in progress
  error?: string | null; // error message if any
}
