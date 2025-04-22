import { actions } from "astro:actions";
import type { PropsWithChildren } from "react";
import { useRouter } from "~/lib/useRouter.ts";

export function DeleteForm({ children, url }: PropsWithChildren & { url: string }) {
    const router = useRouter(url);

    async function destroy(formData: FormData) {
        if (confirm("Please confirm you want to delete this record.")) {
            await actions.destroy(formData);
            router.navigate("/");
        }
    }

    return (
        <form data-destroy action={destroy}>
            {children}
        </form>
    );
}
