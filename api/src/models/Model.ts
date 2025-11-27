export interface QueryOptions<T> {
  where?: Partial<T>
  data?: Partial<T>
}

export default abstract class Model<T> {
  abstract count(): Promise<number>
  abstract create(options: QueryOptions<T>): Promise<T>
  abstract deleteOne(options: QueryOptions<T>): Promise<T | undefined>
  abstract deleteMany(options: QueryOptions<T>): Promise<number>
  abstract find(options?: QueryOptions<T>): Promise<T[]>
  abstract findOne(options: QueryOptions<T>): Promise<T | undefined>
  abstract update(options: QueryOptions<T>): Promise<T>
  abstract updateMany(options: QueryOptions<T>): Promise<number>
}
