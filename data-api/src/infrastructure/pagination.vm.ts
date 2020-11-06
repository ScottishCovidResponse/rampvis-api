export class PaginationVm<T> {
    public data!: T[];
    public page?: number;
    public pageCount?: number;
    public totalCount!: number;
}
