import type { APIContext } from "astro";

export function getContactId(context: { params: APIContext["params"] }) {
    return Number.parseInt(context.params.contactId!);
}
