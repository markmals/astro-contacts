import { Contacts, db } from "astro:db";

const contacts = [
    {
        id: 1,
        first: "Scott",
        last: "Spence",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:nlvjelw3dy3pddq7qoglleko/bafkreiaqu3qfrl26nypgrxeu4wfnqsq2ag42yqd6rn6gxqgpvvktorkq64@jpeg",
        bsky: "scottspence.dev",
    },
    {
        id: 2,
        first: "Rich",
        last: "Harris",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:anvvmj5rdxhzo26gmhkgshnn/bafkreieqfihmtopurx4we54kpagzs2sjj7hj4wqxfge577zamucv5hctyy@jpeg",
        bsky: "rich-harris.dev",
    },
    {
        id: 3,
        first: "Geoff",
        last: "Rich",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:4ug4zefdc7ll77reridekvob/bafkreic5ynvjzjnlxqma6v2vyoq3x7khglhcye4xv5yjmlylfw4ypttzpi@jpeg",
        bsky: "geoffrich.net",
    },
    {
        id: 4,
        first: "Zeu",
        last: "Capua",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:gotnvwkr56ibs33l4hwgfoet/bafkreiexsjrizpdiueowsgccs6g4gjbwbxxw4onpildffnblgwy7y37xm4@jpeg",
        bsky: "zeu.dev",
    },
    {
        id: 5,
        first: "Thomas G.",
        last: "Lopes",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:iovdj5ueqtsozoy522a6olwh/bafkreigcyy2ahawo5ytuzbogsww7lqkkxlriuvkkgr76r67bfdfg3pnq4q@jpeg",
        bsky: "thomas.rocks",
    },
    {
        id: 9,
        first: "Jacob",
        last: "Stordahl",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:6ghbu76mogjyfcvx446mep5o/bafkreicuurghr37bo6zvzyciw72ximnc7ul7nmzftvoba5qyfpeoksawhq@jpeg",
        bsky: "stordahl.dev",
    },
    {
        id: 7,
        first: "Paolo",
        last: "Ricciuti",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:ezyrzvz3yoglekd4j2szmiys/bafkreifetdim5ejuljgqfn2jdfi5wb5luobv7w6mefltxn7fcckcpmsru4@jpeg",
        bsky: "paolo.ricciuti.me",
    },
    {
        id: 8,
        first: "Jean-Yves",
        last: "Couët",
        avatar:
            "https://cdn.bsky.app/img/avatar/plain/did:plc:dacfxuonkf2qtqft22sc23tu/bafkreiazc3bhbehq5j6wtrretqjlouat672wno2tdetekhpfygh6xzsjeq@jpeg",
        bsky: "jyc.dev",
    },
];

export default async function seed() {
    await db.insert(Contacts).values(contacts);
}
