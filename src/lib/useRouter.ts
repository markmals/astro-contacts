// deno-lint-ignore-file no-explicit-any no-window
import {
    navigate,
    type Options,
    type TransitionBeforePreparationEvent,
} from "astro:transitions/client";
import { useEffect, useState } from "react";

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

export type Router = {
    location: PageLocation;

    to: Navigation;
    from: PageLocation | null;

    navigate(to: To, options?: Options): Promise<void>;
    navigate(target: SubmitTarget, options?: Options): Promise<void>;

    isActive(path: string): boolean;
    isPending(path: string): boolean;
};

function getCurrentLocation(url: string): PageLocation {
    if (typeof window !== "undefined") {
        return window.location;
    }

    return new URL(url);
}

// Default navigation state
const idleNavigation: NavigationStates["Idle"] = {
    state: "idle",
    location: undefined,
    formData: undefined,
};

export function useRouter(url: string): Router {
    const [currentLocation, setLocation] = useState<PageLocation>(
        getCurrentLocation(url),
    );
    const [to, setTo] = useState<Navigation>(idleNavigation);
    const [from, setFrom] = useState<PageLocation | null>(null);

    useEffect(() => {
        const onBefore = (event: TransitionBeforePreparationEvent) => {
            if (event.formData) {
                setTo({
                    state: "submitting",
                    location: event.to,
                    formData: event.formData,
                });
                setFrom(event.from);
            } else {
                setTo({
                    state: "loading",
                    location: event.to,
                    formData: undefined,
                });
                setFrom(event.from);
            }
        };

        const onAfter = () => {
            setLocation(getCurrentLocation(url));
            setTo(idleNavigation);
            setFrom(null);
        };

        document.addEventListener("astro:before-preparation", onBefore);
        document.addEventListener("astro:after-swap", onAfter);

        return () => {
            document.removeEventListener("astro:before-preparation", onBefore);
            document.removeEventListener("astro:after-swap", onAfter);
        };
    }, [url, setLocation, setTo, setFrom]);

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
            `${currentLocation.pathname === "/" ? "" : currentLocation.pathname}?${search}`,
            options,
        );
    }

    return {
        location: currentLocation,
        to,
        from,
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
            return currentLocation.pathname === path ||
                currentLocation.pathname.startsWith(path) ||
                currentLocation.pathname.includes(path.split("?").at(0)!);
        },
        isPending(path) {
            return (to.location?.pathname === path || to.location?.pathname.startsWith(path) ||
                to.location?.pathname.includes(path.split("?").at(0)!)) ??
                false;
        },
    };
}
