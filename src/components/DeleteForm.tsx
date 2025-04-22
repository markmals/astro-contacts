import { actions } from "astro:actions";
import type { ParentProps } from "solid-js";

export function DeleteForm(props: ParentProps) {
    function confirmDelete(event: SubmitEvent) {
        if (!confirm("Please confirm you want to delete this record.")) {
            event.preventDefault();
        }
    }

    return (
        <form method="post" action={actions.delete} onSubmit={confirmDelete}>
            {props.children}
        </form>
    );
}
