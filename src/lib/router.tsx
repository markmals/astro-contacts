// deno-lint-ignore-file no-explicit-any no-window
import {
    navigate,
    type NavigationTypeString,
    type Options,
    type TransitionBeforePreparationEvent,
} from "astro:transitions/client";

import { createSignal, onCleanup, onMount, untrack } from "solid-js";
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

export interface Page {
    url: URL;
    params: Record<string, string | undefined>;
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

export type Router = {
    page: Page;
    navigating: Navigating;

    navigate(to: To, options?: Options): Promise<void>;
    navigate(target: SubmitTarget, options?: Options): Promise<void>;

    revalidate(): Promise<void>;

    isActive(path: string): boolean;
    isPending(path: string): boolean;
};

export function useRouter(): Router {
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
            return serverParams() ?? {};
        },
    };

    const [navigating, setNavigating] = createStore<Navigating>(structuredClone(idleNavigation));

    if (BROWSER) {
        if (!untrack(clientLocation)) {
            refreshClientLocation();
        }

        const onBefore = (event: TransitionBeforePreparationEvent) => {
            setNavigating(reconcile({
                state: (event.formData ? "submitting" : "loading") as "submitting",
                formData: event.formData,
                type: event.navigationType,
                to: { url: event.to },
                from: { url: event.from },
            }));
        };

        const onAfter = () => {
            refreshClientLocation();
            setNavigating(reconcile(structuredClone(idleNavigation)));
        };

        onMount(() => {
            document.addEventListener("astro:before-preparation", onBefore);
            document.addEventListener("astro:after-swap", onAfter);
        });

        onCleanup(() => {
            document.removeEventListener("astro:before-preparation", onBefore);
            document.removeEventListener("astro:after-swap", onAfter);
        });
    }

    async function submit(target: SubmitTarget, options?: Options): Promise<void> {
        if (!target) {
            return;
        }

        let entries: Iterable<[string, string]> = [];
        let search = new URLSearchParams();

        if (target instanceof HTMLFormElement) {
            entries = new FormData(target).entries() as any;
        } else if (target instanceof HTMLButtonElement || target instanceof HTMLInputElement) {
            const form = target.form;
            if (!form) return;
            const formData = new FormData(form);
            // Add the button/input value if it has a name
            if (target.name) {
                formData.append(target.name, target.value);
            }
            entries = formData.entries() as any;
        } else if (target instanceof FormData) {
            entries = target.entries() as any;
        } else if (target instanceof URLSearchParams) {
            search = target;
        } else {
            // Handle JSON value
            if (typeof target === "object" && target !== null) {
                entries = Object.entries(target) as any;
            }
        }

        for (const [key, value] of entries) {
            search.append(key, value.toString());
        }

        await navigate(
            `${page.url.pathname === "/" ? "" : page.url.pathname}?${search}`,
            options,
        );
    }

    return {
        page,
        navigating,
        async navigate(target, options) {
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
                return await submit(target, options);
            }

            return await navigate(target.toString(), options);
        },
        async revalidate() {
            await navigate(page.url.pathname);
        },
        isActive(path) {
            return page.url.pathname === path ||
                page.url.pathname.startsWith(path) ||
                page.url.pathname.includes(path.split("?").at(0)!);
        },
        isPending(path) {
            return (navigating.to?.url.pathname === path ||
                navigating.to?.url.pathname.startsWith(path) ||
                navigating.to?.url.pathname.includes(path.split("?").at(0)!)) ??
                false;
        },
    };
}

import ClientRouter from "../components/ClientRouter.astro";
export { ClientRouter };
