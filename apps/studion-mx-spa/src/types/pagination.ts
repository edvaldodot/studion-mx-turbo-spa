export interface Pagination<T> {
    data: T,
    actualPage: number,
    nextPage: number,
    previousPage: number,
    firstPage: number,
    lastPage: number,
    total: number
}