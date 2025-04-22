// deno-lint-ignore-file no-window
import {
    navigate as _navigate,
    type NavigationTypeString,
    type Options,
    type TransitionBeforePreparationEvent,
} from "astro:transitions/client";
import ClientRouter from "../components/ClientRouter.astro";

import { createSignal, untrack } from "solid-js";
import { createStore, reconcile } from "solid-js/store";

type JsonObject =
    & {
        [Key in string]: JsonValue;
    }
    & {
        [Key in string]?: JsonValue | undefined;
    };
type JsonArray = JsonValue[] | readonly JsonValue[];
type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

type To = string;

type SubmitTarget =
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | JsonValue
    | null;

export interface NavigationTarget {
    url: URL;
}

export interface Page extends NavigationTarget {
    params?: Record<string, string | undefined>;
}

type NavigatingStates = {
    Idle: {
        state: "idle";
        type: null;
        to: null;
        from: null;
        formData: null;
    };
    Loading: {
        state: "loading";
        type: NavigationTypeString;
        to: NavigationTarget;
        from: NavigationTarget;
        formData: null;
    };
    Submitting: {
        state: "submitting";
        type: NavigationTypeString;
        to: NavigationTarget;
        from: NavigationTarget;
        formData?: FormData;
    };
};
type Navigating = NavigatingStates[keyof NavigatingStates];

export type NavigateFunc = {
    (to: To, options?: Options): Promise<void>;
    (target: SubmitTarget, options?: Options): Promise<void>;
};

export const BROWSER = typeof document !== "undefined";

const idleNavigation: NavigatingStates["Idle"] = {
    state: "idle",
    type: null,
    to: null,
    from: null,
    formData: null,
};

const [serverLocation, setServerLocation] = createSignal<URL>();
export function unsafe_provideServerURL(url: URL) {
    setServerLocation(url);
}

const [serverParams, setServerParams] = createSignal<Record<string, string | undefined>>();
export function unsafe_provideServerParams(params: Record<string, string | undefined>) {
    setServerParams(params);
}

const [clientLocation, setClientLocation] = createSignal<URL>();
function refreshClientLocation() {
    setClientLocation(new URL(window.location.href));
}

const page = {
    get url(): URL {
        if (BROWSER) return clientLocation()!;
        return serverLocation()!;
    },
    get params() {
        return serverParams();
    },
};

const [navigating, setNavigating] = createStore<Navigating>(structuredClone(idleNavigation));

if (BROWSER) {
    if (!untrack(clientLocation)) {
        refreshClientLocation();
    }

    const beforePreparation: EventListenerObject = {
        handleEvent(event: TransitionBeforePreparationEvent) {
            setNavigating(reconcile({
                state: (event.formData ? "submitting" : "loading") as "submitting",
                formData: event.formData,
                type: event.navigationType,
                to: { url: event.to },
                from: { url: event.from },
            }));
        },
    };

    const afterSwap: EventListenerObject = {
        handleEvent() {
            refreshClientLocation();
            setNavigating(reconcile(structuredClone(idleNavigation)));
        },
    };

    document.addEventListener("astro:before-preparation", beforePreparation);
    document.addEventListener("astro:after-swap", afterSwap);
}

async function _submit(target: SubmitTarget, options?: Options): Promise<void> {
    if (!target) {
        return;
    }

    type ToString = { toString(): string };
    let entries: Iterable<[string, ToString | null]> = [];
    let search = new URLSearchParams();

    if (target instanceof HTMLFormElement) {
        entries = new FormData(target).entries();
    } else if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement) {
        if (!target.form) return;
        entries = new FormData(target.form).entries();
    } else if (target instanceof FormData) {
        entries = target.entries();
    } else if (target instanceof URLSearchParams) {
        search = target;
    } else {
        // Handle JSON value
        if (typeof target === "object" && target !== null) {
            entries = Object.entries(target);
        }
    }

    for (const [key, value] of entries) {
        if (value) search.append(key, value.toString());
    }

    await _navigate(
        `${page.url.pathname === "/" ? "" : page.url.pathname}?${search}`,
        options,
    );
}

export const navigate: NavigateFunc = async (target, options) => {
    if (
        target instanceof HTMLFormElement ||
        target instanceof HTMLButtonElement ||
        target instanceof HTMLInputElement ||
        target instanceof FormData ||
        target instanceof URLSearchParams ||
        typeof target === "boolean" ||
        (target !== null && typeof target === "object") ||
        target === null
    ) {
        return await _submit(target, options);
    }

    return await _navigate(target.toString(), options);
};

export async function revalidate(): Promise<void> {
    await _navigate(page.url.pathname);
}

export function isActive(path: string): boolean {
    return page.url.pathname === path ||
        page.url.pathname.startsWith(path) ||
        page.url.pathname.includes(path.split("?").at(0)!);
}

export function isPending(path: string): boolean {
    return (navigating.to?.url.pathname === path ||
        navigating.to?.url.pathname.startsWith(path) ||
        navigating.to?.url.pathname.includes(path.split("?").at(0)!)) ??
        false;
}

export { ClientRouter, navigating, page };
