import { actions } from "astro:actions";
import { createSignal, Show } from "solid-js";
import { revalidate } from "../lib/router.ts";
import { createOptimistic } from "~/lib/optimistic.ts";

export function Favorite(props: { id: number; favorite: boolean }) {
    const [favorite, setFavorite] = createOptimistic(() => props.favorite);
    const [loading, setLoading] = createSignal(false);

    function optimisticallyToggleFavorite() {
        setFavorite((favorited) => !favorited);
    }

    function toggleLoading() {
        setLoading((isLoading) => !isLoading);
    }

    async function toggleFavorite(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
        event.preventDefault();

        optimisticallyToggleFavorite();
        toggleLoading();

        await actions.favorite(new FormData(event.currentTarget));
        await revalidate();

        toggleLoading();
    }

    return (
        <form method="post" action={actions.favorite} onSubmit={toggleFavorite}>
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
