import { actions } from "astro:actions";
import { useRouter } from "~/lib/router.ts";
import type { ParentProps } from "solid-js";

export function DeleteForm(props: ParentProps & { url: URL }) {
    const router = useRouter(props.url);

    async function enhance(event: SubmitEvent & { currentTarget: HTMLFormElement }) {
        event.preventDefault();
        if (confirm("Please confirm you want to delete this record.")) {
            await actions.destroy(new FormData(event.currentTarget));
            await router.navigate("/");
        }
    }

    return (
        <form method="post" action={actions.destroy} onSubmit={enhance}>
            {props.children}
        </form>
    );
}
