import { Observable } from "rxjs";

export type MetadataChangeHandler<T> = (config$: Observable<T>) => Observable<void>;
