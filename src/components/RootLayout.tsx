import type { Contact } from "~/lib/contacts.ts";
import { createRouter } from "~/lib/router.ts";
import { createEffect } from "solid-js";
import type { ParentProps } from "solid-js";

export function SearchBar(props: { query?: string; url: string }) {
    const router = createRouter(props.url);

    const previousSearchParams = () => router.from?.search || "";
    const nextSearchParams = () => router.to.location?.search || "";

    const searching = () =>
        Boolean(
            router.to.location &&
                new URLSearchParams(nextSearchParams()).has("q") &&
                previousSearchParams() !== nextSearchParams(),
        );

    createEffect(() => {
        if (typeof document !== "undefined") {
            document.querySelector<HTMLInputElement>("#q")!.value = props.query ?? "";
        }
    });

    async function enhance(event: InputEvent & { currentTarget: HTMLInputElement }) {
        // Remove empty query params when value is empty
        if (!event.currentTarget.value) {
            await router.navigate(router.location.pathname);
            return;
        }

        const isFirstSearch = props.query === undefined;
        await router.navigate(event.currentTarget.form, {
            history: !isFirstSearch ? "replace" : "push",
        });
    }

    return (
        <>
            <input
                aria-label="Search contacts"
                class={searching() ? "loading" : ""}
                value={props.query}
                id="q"
                name="q"
                onInput={enhance}
                placeholder="Search"
                type="search"
            />
            <div aria-hidden hidden={!searching()} id="search-spinner" />
            <div aria-live="polite" class="sr-only" />
        </>
    );
}

export interface SidebarItemProps {
    contact: Contact;
    search: string;
    url: string;
}

export function SidebarItem(props: SidebarItemProps) {
    const router = createRouter(props.url);
    const href = () => `/contacts/${props.contact.id}${props.search}`;
    const className = () =>
        router.isActive(href()) ? "active" : router.isPending(href()) ? "pending" : undefined;

    return (
        <li>
            <a href={href()} class={className()}>
                {props.contact.first || props.contact.last
                    ? (
                        <>
                            {props.contact.first} {props.contact.last}
                        </>
                    )
                    : <i>No Name</i>}
                {props.contact.favorite && <span>★</span>}
            </a>
        </li>
    );
}

export function Details(props: ParentProps & { url: string }) {
    const router = createRouter(props.url);

    return (
        <div id="detail" class={router.to.state === "loading" ? "loading" : ""}>
            {props.children}
        </div>
    );
}
