import { actions } from "astro:actions";
import { createRouter } from "~/lib/router.ts";
import { createComputed, createSignal, Show, untrack } from "solid-js";

function createOptimistic<T>(value: () => T) {
    const [state, setState] = createSignal(untrack(value));
    // deno-lint-ignore no-explicit-any
    createComputed(() => setState(value() as any));
    return [state, setState] as const;
}

export function Favorite(props: { id: number; favorite: boolean; url: string }) {
    const router = createRouter(props.url);
    const [favorited, setFavorited] = createOptimistic(() => props.favorite);
    const [loading, setLoading] = createSignal(false);

    async function enhance(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
        event.preventDefault();

        setFavorited((favorited) => !favorited);
        setLoading((l) => !l);

        await actions.favorite(new FormData(event.currentTarget));
        await router.navigate(router.location.pathname);

        setLoading((l) => !l);
    }

    return (
        <form method="post" action={actions.favorite} onSubmit={enhance}>
            <input type="hidden" name="id" value={props.id} />
            <button
                aria-label={favorited() ? "Remove from favorites" : "Add to favorites"}
                name="favorite"
                type="submit"
                value={favorited() ? "false" : "true"}
                disabled={loading()}
            >
                <Show when={favorited()} fallback="☆">
                    ★
                </Show>
            </button>
        </form>
    );
}
