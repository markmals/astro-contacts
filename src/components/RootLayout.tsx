import { type FormEvent, type PropsWithChildren, useEffect, useState } from "react";
import type { Contact } from "~/lib/contacts.ts";
import { useRouter } from "~/lib/useRouter.ts";

export function SearchBar({ query, url }: { query?: string; url: string }) {
    const router = useRouter(url);
    const [previousSearchParams, setPreviousSearchParams] = useState<string | null>(null);

    const nextSearchParams = router.to.location?.search || "";

    const searching = Boolean(
        router.to.location &&
            new URLSearchParams(nextSearchParams).has("q") &&
            previousSearchParams !== nextSearchParams,
    );

    useEffect(() => {
        if (document) {
            document.querySelector<HTMLInputElement>("#q")!.value = query ?? "";
        }
    }, [query]);

    useEffect(() => {
        if (router.from) {
            setPreviousSearchParams(router.from.search);
        }
    }, [router.from]);

    function handleInput(event: FormEvent<HTMLInputElement>) {
        // Remove empty query params when value is empty
        if (!event.currentTarget.value) {
            router.navigate(router.location.pathname);
            return;
        }

        const isFirstSearch = query === undefined;
        router.navigate(event.currentTarget.form, {
            history: !isFirstSearch ? "replace" : "push",
        });
    }

    return (
        <>
            <input
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                defaultValue={query}
                id="q"
                name="q"
                onInput={handleInput}
                placeholder="Search"
                type="search"
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
            <div aria-live="polite" className="sr-only" />
        </>
    );
}

export interface SidebarItemProps {
    contact: Contact;
    search: string;
    url: string;
}

export function SidebarItem({ contact, search, url }: SidebarItemProps) {
    const router = useRouter(url);
    const href = `/contacts/${contact.id}${search}`;
    const className = router.isActive(href)
        ? "active"
        : router.isPending(href)
        ? "pending"
        : undefined;

    return (
        <li>
            <a href={href} className={className}>
                {contact.first || contact.last
                    ? (
                        <>
                            {contact.first} {contact.last}
                        </>
                    )
                    : <i>No Name</i>}
                {contact.favorite && <span>★</span>}
            </a>
        </li>
    );
}

export function Details({ children, url }: PropsWithChildren & { url: string }) {
    const router = useRouter(url);

    return (
        <div id="detail" className={router.to.state === "loading" ? "loading" : ""}>
            {children}
        </div>
    );
}
