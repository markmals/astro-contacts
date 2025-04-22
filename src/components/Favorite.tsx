import { actions } from "astro:actions";
import { useEffect, useState } from "react";
import { useRouter } from "~/lib/useRouter.ts";

// Real `useOptimistic` doesn't work because it depends on the React Server Actions lifecycle
// which Astro does not implement as part of Astro Actions
function useOptimistic<T>(value: T) {
    const [state, setState] = useState(value);
    useEffect(() => setState(value), [value]);
    return [state, setState] as const;
}

export function Favorite(props: { id: number; favorite: boolean; url: string }) {
    const router = useRouter(props.url);
    const [favorited, setFavorited] = useOptimistic(props.favorite);
    const [loading, setLoading] = useState(false);

    function favorite(formData: FormData) {
        setFavorited(!favorited);
        setLoading(true);

        actions.favorite(formData)
            .then(() => router.navigate(router.location.pathname))
            .then(() => setLoading(false));
    }

    return (
        <form action={favorite}>
            <input type="hidden" name="id" value={props.id} />
            <button
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
                name="favorite"
                type="submit"
                value={favorited ? "false" : "true"}
                disabled={loading}
            >
                {favorited ? "★" : "☆"}
            </button>
        </form>
    );
}
