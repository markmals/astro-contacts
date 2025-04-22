import { Contacts, db, eq } from "astro:db";
import { matchSorter } from "match-sorter";
import sortBy from "sort-by";

export type Contact = typeof Contacts.$inferSelect;

export async function createContact() {
    await fakeNetwork();
    const [contact] = await db
        .insert(Contacts)
        .values({
            first: "",
            last: "",
            avatar: "",
            bsky: "",
            notes: "",
        })
        .returning();

    return contact;
}

export async function getContact(id?: number) {
    await fakeNetwork(`contact:${id}`);
    const [contact] = await db
        .select()
        .from(Contacts)
        .where(eq(Contacts.id, id ?? -1));

    return contact;
}

export async function getContacts(query?: string) {
    await fakeNetwork(`contacts:${query}`);
    let contacts = await db.select().from(Contacts);
    if (query) {
        contacts = matchSorter(contacts, query, { keys: ["first", "last"] });
    }
    return contacts.sort(sortBy("last", "createdAt"));
}

const ASPERAND_PATTERN = /^@+/;

export async function updateContact(id: number, updates: Partial<Contact>) {
    await fakeNetwork();

    // Trim any leading @'s off of bsky handle
    if (updates.bsky && typeof updates.bsky === "string") {
        updates.bsky = updates.bsky.replace(ASPERAND_PATTERN, "");
    }

    const [contact] = await db
        .update(Contacts)
        .set(updates)
        .where(eq(Contacts.id, id))
        .returning();

    return contact;
}

export async function deleteContact(id: number) {
    const [contact] = await db.delete(Contacts).where(eq(Contacts.id, id)).returning();
    return contact;
}

// fake a cache so we don't slow down stuff we've already seen
const cache = new Map<string, boolean>();

export async function fakeNetwork(key?: string): Promise<void> {
    if (!key || !cache.get(key)) {
        if (key) cache.set(key, true);
        // Fake network slowdown between 2-5 seconds
        return await new Promise((res) => setTimeout(res, 2_000 + Math.random() * 3_000));
    }
}
