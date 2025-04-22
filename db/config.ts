import { column, defineDb, defineTable, NOW } from "astro:db";

export const Contacts = defineTable({
    columns: {
        id: column.number({ primaryKey: true }),
        createdAt: column.text({
            name: "created_at",
            default: NOW,
        }),
        first: column.text(),
        last: column.text(),
        avatar: column.text(),
        bsky: column.text(),
        notes: column.text({ optional: true, default: "" }),
        favorite: column.boolean({ default: false }),
    },
});

export default defineDb({
    tables: { Contacts },
});
