/* eslint-disable no-redeclare */

export function asyncPipe<A>(a: A): Promise<A>
export function asyncPipe<A, B>(a: A, ab: AnyFunction<A, B>): Promise<B>
export function asyncPipe<A, B, C>(a: A, ab: AnyFunction<A, B>, bc: AnyFunction<B, C>): Promise<C>
export function asyncPipe<A, B, C, D>(
  a: A,
  ab: AnyFunction<A, B>,
  bc: AnyFunction<B, C>,
  cd: AnyFunction<C, D>,
): Promise<D>
export function asyncPipe<A, B, C, D, E>(
  a: A,
  ab: AnyFunction<A, B>,
  bc: AnyFunction<B, C>,
  cd: AnyFunction<C, D>,
  de: AnyFunction<D, E>,
): Promise<E>

// eslint-disable-next-line ts/no-explicit-any
export async function asyncPipe(input: any, ...fns: AnyFunction<any, any>[]): Promise<any> {
  return await fns.reduce(async (acc, curFn) => curFn(await acc), Promise.resolve(input))
}

export function asyncFlow<A, B>(ab: AnyFunction<A, B>): AsyncFunction<A, B>
export function asyncFlow<A, B, C>(ab: AnyFunction<A, B>, bc: AnyFunction<B, C>): AsyncFunction<A, C>
export function asyncFlow<A, B, C, D>(
  ab: AnyFunction<A, B>,
  bc: AnyFunction<B, C>,
  cd: AnyFunction<C, D>,
): AsyncFunction<A, D>
export function asyncFlow<A, B, C, D, E>(
  ab: AnyFunction<A, B>,
  bc: AnyFunction<B, C>,
  cd: AnyFunction<C, D>,
  de: AnyFunction<D, E>,
): AsyncFunction<A, E>

// eslint-disable-next-line ts/no-explicit-any
export function asyncFlow(...fns: AnyFunction<any, any>[]): AsyncFunction<any, any> {
  return async input => await fns.reduce(async (acc, curFn) => curFn(await acc), Promise.resolve(input))
}

export function getCombinations(arr: string[]): string[][] {
  const result: string[][] = []

  const backtrack = (startIndex: number, currentCombination: string[]) => {
    if (currentCombination.length >= 2) {
      result.push([...currentCombination])
    }

    for (let i = startIndex; i < arr.length; i++) {
      currentCombination.push(arr[i]!)
      backtrack(i + 1, currentCombination)
      currentCombination.pop()
    }
  }

  backtrack(0, [])
  return result.sort((a, b) => a.length > b.length ? -1 : 1)
}

export const getUniqueNames = (sourceArr: string[]) => [...new Set(sourceArr)]
export const isOnlyDigits = (str?: string): boolean => (str ? /^\d+$/.test(str) : false)

export const filterRecordByKeys = <T extends Record<string, unknown>>(record: T, keys: string[]): T => {
  const filteredAsssociativeArray = Object.entries(record).filter(([key]) => keys.includes(key))
  return Object.fromEntries(filteredAsssociativeArray) as T
}
