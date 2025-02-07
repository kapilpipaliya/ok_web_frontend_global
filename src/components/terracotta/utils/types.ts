export type OmitAndMerge<A, B> = A & Omit<B, keyof A>;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export interface Ref<T> {
  value: T;
}
