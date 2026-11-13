import { EventEmitter } from "node:events";
import type { Logger } from "./logger";

export type Listener<T> = (value: T, previous: T | undefined) => void;

export interface StoreOptions<T> {
  readonly name: string
  initial?: T
  equals?(a: T, b: T): boolean
}

type Keys<T> = { [K in keyof T]-?: T[K] extends Function ? never : K }[keyof T];

/** A value that notifies listeners when it changes. */
export class Store<T extends object> extends EventEmitter {
  #value: T | undefined
  private readonly listeners = new Set<Listener<T>>()

  constructor(private options: StoreOptions<T>, protected log?: Logger) {
    super()
    this.#value = options.initial
  }

  get value(): T | undefined {
    return this.#value
  }

  set(next: T): void {
    const previous = this.#value
    if (previous !== undefined && this.options.equals?.(previous, next)) return
    this.#value = next
    for (const listener of this.listeners) listener(next, previous)
    this.log?.debug(`${this.options.name} changed`)
  }

  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  pick<K extends Keys<T>>(...keys: K[]): Pick<T, K> {
    const out = {} as Pick<T, K>
    for (const key of keys) out[key] = this.#value![key]
    return out
  }
}

export function isStore(x: unknown): x is Store<object> {
  return x instanceof Store
}

export const counter = new Store<{ count: number }>({ name: "counter", initial: { count: 0 } })
