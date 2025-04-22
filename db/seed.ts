import { Contacts, db } from "astro:db";

const contacts = [
    {
        id: 1,
        first: "Matt",
        last: "Kane",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:uwbl4k3tza7eyjv3morkrld2/bafkreic4mwsbm2tmuonamj4jq4kcjofk35bwics2f4oorp57f3cdfusjwu@jpeg",
        bsky: "mk.gg",
    },
    {
        id: 2,
        first: "Sarah",
        last: "Rainsberger",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:iwhvwluesbbqtslwwdzgiize/bafkreid5ropmhzl6an6lpeanulki3szk6wmsrgtbal6t2s7pyai7oxtamu@jpeg",
        bsky: "sarah11918.rainsberger.ca",
    },
    {
        id: 3,
        first: "Matthew",
        last: "Phillips",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:eu6cezqsf5yocjsyc7mgkued/bafkreihjrnlfs5fnnuiaoy3yvs46kj6u7ct66jahywrjdmyygzsnuwq57i@jpeg",
        bsky: "fancypenguin.party",
    },
    {
        id: 4,
        first: "Nate",
        last: "Moore",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:i2r4fkz7ge35u5tbcj2ntasf/bafkreie4tt3cg6buvj3ynctxibsbboa6zb7k4azctzmgcr67uqdspgxvly@jpeg",
        bsky: "natemoo.re",
    },
    {
        id: 5,
        first: "Fred K.",
        last: "Schott",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:beykws7vcyhkoykt54xp2d7y/bafkreif3ik7bkuua7a3qwi2iie5242npoadnh6tiryuuebc3o3d5z5tzta@jpeg",
        bsky: "fks.bsky.social",
    },
    {
        id: 9,
        first: "Ben",
        last: "Holmes",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:koeuzndo64sdkjw5bylojck6/bafkreicawmpmrxcgnrf5b5bhsge5w2wznbksx45gm6gsb6ktcmquj7zka4@jpeg",
        bsky: "bholmes.dev",
    },
];

export default async function seed() {
    await db.insert(Contacts).values(contacts);
}
