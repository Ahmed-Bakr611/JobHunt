import { JobFilter } from '../../../shared/models/job.model';
import FilterOption from './FilterOption';

export interface FilterGroup {
  title: string;
  key: keyof JobFilter;
  options: FilterOption[];
  expanded: boolean;
}
