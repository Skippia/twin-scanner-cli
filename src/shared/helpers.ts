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

export async function asyncPipe(
  input: unknown,
  // eslint-disable-next-line functional/functional-parameters
  ...fns: ReadonlyArray<AnyFunction>
): Promise<unknown> {
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

// eslint-disable-next-line functional/functional-parameters
export function asyncFlow(...fns: ReadonlyArray<AnyFunction>): AsyncFunction {
  return async input => await fns.reduce(async (acc, curFn) => curFn(await acc), Promise.resolve(input))
}
