// deno-lint-ignore-file no-explicit-any no-window
import {
    navigate,
    type Options,
    type TransitionBeforePreparationEvent,
} from "astro:transitions/client";

import { onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";

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

type NavigationStates = {
    Idle: {
        state: "idle";
        location: undefined;
        formData: undefined;
    };
    Loading: {
        state: "loading";
        location: PageLocation;
        formData: undefined;
    };
    Submitting: {
        state: "submitting";
        location: PageLocation;
        formData?: FormData;
    };
};
type Navigation = NavigationStates[keyof NavigationStates];

interface Path {
    /**
     * A URL pathname, beginning with a /.
     */
    pathname: string;
    /**
     * A URL search string, beginning with a ?.
     */
    search: string;
    /**
     * A URL fragment identifier, beginning with a #.
     */
    hash: string;
}

type To = string; // | Partial<Path>;

type SubmitTarget =
    | HTMLFormElement
    | HTMLButtonElement
    | HTMLInputElement
    | FormData
    | URLSearchParams
    | JsonValue
    | null;

type PageLocation = {
    readonly hash: string;
    readonly host: string;
    readonly hostname: string;
    readonly href: string;
    readonly origin: string;
    readonly pathname: string;
    readonly port: string;
    readonly protocol: string;
    readonly search: string;
    toString(): string;
};

type NavigatingStates = {
    Idle: {
        state: "idle";
        to: null;
        from: null;
        formData: null;
    };
    Loading: {
        state: "loading";
        to: PageLocation;
        from: PageLocation;
        formData: null;
    };
    Submitting: {
        state: "submitting";
        to: PageLocation;
        from: PageLocation;
        formData?: FormData;
    };
};
type Navigating = NavigatingStates[keyof NavigatingStates];

export type Router = {
    page: {
        location: PageLocation;
    };
    navigating: Navigating;

    navigate(to: To, options?: Options): Promise<void>;
    navigate(target: SubmitTarget, options?: Options): Promise<void>;

    isActive(path: string): boolean;
    isPending(path: string): boolean;
};

function getCurrentLocation(url: URL): PageLocation {
    if (typeof window !== "undefined") {
        return window.location;
    }

    return url;
}

// Default navigation state
const idleNavigation: NavigatingStates["Idle"] = {
    state: "idle",
    to: null,
    from: null,
    formData: null,
};

type RouterState = {
    location: PageLocation;
    navigating: Navigating;
};

export function useRouter(url: URL): Router {
    const [state, setState] = createStore<RouterState>({
        location: getCurrentLocation(url),
        navigating: structuredClone(idleNavigation),
    });

    if (typeof document !== "undefined") {
        const onBefore = (event: TransitionBeforePreparationEvent) => {
            setState({
                navigating: {
                    state: "submitting",
                    to: event.to,
                    from: event.from,
                    formData: event.formData,
                },
            });
        };

        const onAfter = () => {
            setState({
                location: getCurrentLocation(url),
                navigating: structuredClone(idleNavigation),
            });
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
            `${state.location.pathname === "/" ? "" : state.location.pathname}?${search}`,
            options,
        );
    }

    return {
        page: {
            get location() {
                return state.location;
            },
        },
        get navigating() {
            return state.navigating;
        },
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
        isActive(path) {
            return state.location.pathname === path ||
                state.location.pathname.startsWith(path) ||
                state.location.pathname.includes(path.split("?").at(0)!);
        },
        isPending(path) {
            return (state.navigating.to?.pathname === path ||
                state.navigating.to?.pathname.startsWith(path) ||
                state.navigating.to?.pathname.includes(path.split("?").at(0)!)) ??
                false;
        },
    };
}
