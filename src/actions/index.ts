import { defineAction } from "astro:actions";
import { z } from "astro:schema";

import { createContact, deleteContact, getContact, updateContact } from "~/lib/contacts.ts";
import { getContactId } from "./get-contact-id.ts";

// import { delay } from "@std/async";

export const server = {
    newContact: defineAction({
        accept: "form",
        async handler() {
            const contact = await createContact();
            console.log(`Contact (${contact.id}) created`);
        },
    }),
    favorite: defineAction({
        accept: "form",
        input: z.object({ id: z.number().int(), favorite: z.boolean() }),
        async handler({ id }) {
            // await delay(3000);
            const { favorite } = await getContact(id);
            const contact = await updateContact(id, { favorite: !favorite });
            console.log(
                `Contact (${contact.id}) favorite toggled: isFavorited ${contact.favorite}`,
            );
        },
    }),
    destroy: defineAction({
        accept: "form",
        input: z.object({ id: z.number() }),
        async handler({ id }) {
            const contact = await deleteContact(id);
            console.log(`Contact (${contact.id}) deleted`);
            // throw Response.redirect("/");
        },
    }),
    edit: defineAction({
        accept: "form",
        async handler(formData, context) {
            const id = getContactId(context);
            const updates = Object.fromEntries(formData);
            const contact = await updateContact(id, updates);
            console.log(`Contact (${contact.id}) updated`);
        },
    }),
};
