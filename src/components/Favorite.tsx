import { actions } from "astro:actions";
import { useRouter } from "~/lib/router.ts";
import { createComputed, createSignal, Show, untrack } from "solid-js";

function createOptimistic<T>(value: () => T) {
    const [state, setState] = createSignal(untrack(value));
    // deno-lint-ignore no-explicit-any
    createComputed(() => setState(value() as any));
    return [state, setState] as const;
}

export function Favorite(props: { id: number; favorite: boolean; url: URL }) {
    const router = useRouter(props.url);
    const [favorite, setFavorite] = createOptimistic(() => props.favorite);
    const [loading, setLoading] = createSignal(false);

    async function enhance(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
        event.preventDefault();

        setFavorite((favorited) => !favorited);
        setLoading((toggle) => !toggle);

        await actions.favorite(new FormData(event.currentTarget));
        await router.navigate(router.page.location.pathname);

        setLoading((toggle) => !toggle);
    }

    return (
        <form method="post" action={actions.favorite} onSubmit={enhance}>
            <input type="hidden" name="id" value={props.id} />
            <button
                aria-label={favorite() ? "Remove from favorites" : "Add to favorites"}
                name="favorite"
                type="submit"
                value={favorite() ? "false" : "true"}
                disabled={loading()}
            >
                <Show when={favorite()} fallback="☆">
                    ★
                </Show>
            </button>
        </form>
    );
}
