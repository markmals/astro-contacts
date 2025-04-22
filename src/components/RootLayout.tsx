import type { Contact } from "~/lib/contacts.ts";
import { type ParentProps, Show } from "solid-js";
import { navigate, navigating, page } from "~/lib/router.tsx";
import { NavLink } from "~/components/NavLink.tsx";

export function SearchBar(props: { query?: string }) {
    const previousSearchParams = () => navigating.from?.url.search || "";
    const nextSearchParams = () => navigating.to?.url.search || "";

    const searching = () =>
        Boolean(
            previousSearchParams() !== nextSearchParams() &&
                new URLSearchParams(nextSearchParams()).has("q"),
        );

    async function search(event: InputEvent & { currentTarget: HTMLInputElement }) {
        // Remove empty query params when value is empty
        if (!event.currentTarget.value) {
            await navigate(page.url.pathname);
            return;
        }

        const isFirstSearch = props.query === undefined;
        await navigate(event.currentTarget.form, {
            history: !isFirstSearch ? "replace" : "push",
        });
    }

    return (
        <>
            <input
                aria-label="Search contacts"
                class={searching() ? "loading" : undefined}
                value={props.query ?? ""}
                id="q"
                name="q"
                onInput={search}
                placeholder="Search"
                type="search"
            />
            <div bool:aria-hidden={!searching()} hidden={!searching()} id="search-spinner" />
            <div aria-live="polite" class="sr-only" />
        </>
    );
}

export function SidebarItem(props: { contact: Contact }) {
    const href = () => `/contacts/${props.contact.id}${page.url.search}`;

    return (
        <li>
            <NavLink
                href={href()}
                class={(state) =>
                    state.isActive ? "active" : state.isPending ? "pending" : undefined}
            >
                <Show when={props.contact.first || props.contact.last} fallback={<i>No Name</i>}>
                    {props.contact.first} {props.contact.last}
                </Show>
                <Show when={props.contact.favorite}>
                    <span>★</span>
                </Show>
            </NavLink>
        </li>
    );
}

export function Details(props: ParentProps) {
    return (
        <div
            id="detail"
            class={navigating.state === "loading" || navigating.state === "submitting"
                ? "loading"
                : ""}
        >
            {props.children}
        </div>
    );
}
