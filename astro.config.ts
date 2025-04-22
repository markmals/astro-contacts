import { defineConfig } from "astro/config";

import solid from "@astrojs/solid-js";
import db from "@astrojs/db";
const deno = {
    astro: () => import("@deno/astro-adapter").then((m) => m.default()),
    vite: () => import("@deno/vite-plugin").then((m) => m.default()),
};

export default defineConfig({
    output: "server",
    adapter: await deno.astro(),
    integrations: [
        solid(),
        db(),
    ],
    // vite: {
    //     plugins: [await deno.vite()]
    // }
});
