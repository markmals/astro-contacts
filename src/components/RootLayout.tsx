import type { Contact } from "~/lib/contacts.ts";
import { useRouter } from "~/lib/router.ts";
import { type ParentProps, Show } from "solid-js";

export function SearchBar(props: { query?: string; url: URL }) {
    const router = useRouter(props.url);

    const previousSearchParams = () => router.navigating.from?.search || "";
    const nextSearchParams = () => router.navigating.to?.search || "";

    const searching = () =>
        Boolean(
            previousSearchParams() !== nextSearchParams() &&
                new URLSearchParams(nextSearchParams()).has("q"),
        );

    async function enhance(event: InputEvent & { currentTarget: HTMLInputElement }) {
        // Remove empty query params when value is empty
        if (!event.currentTarget.value) {
            await router.navigate(router.page.location.pathname);
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
                value={props.query ?? ""}
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
    url: URL;
}

export function SidebarItem(props: SidebarItemProps) {
    const router = useRouter(props.url);
    const href = () => `/contacts/${props.contact.id}${props.url.search}`;
    const className = () =>
        router.isActive(href()) ? "active" : router.isPending(href()) ? "pending" : undefined;

    return (
        <li>
            <a href={href()} class={className()}>
                <Show when={props.contact.first || props.contact.last} fallback={<i>No Name</i>}>
                    {props.contact.first} {props.contact.last}
                </Show>
                <Show when={props.contact.favorite}>
                    <span>★</span>
                </Show>
            </a>
        </li>
    );
}

export function Details(props: ParentProps & { url: URL }) {
    const router = useRouter(props.url);

    return (
        <div id="detail" class={router.navigating.state === "loading" ? "loading" : ""}>
            {props.children}
        </div>
    );
}
