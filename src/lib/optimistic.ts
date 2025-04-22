import { createComputed, createSignal, untrack } from "solid-js";

// deno-lint-ignore ban-types
export function createOptimistic<T>(value: () => Exclude<T, Function>) {
    const [state, setState] = createSignal<T>(untrack(value));
    createComputed(() => setState(value()));
    return [state, setState] as const;
}
