import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import db from "@astrojs/db";
const deno = {
    astro: () => import("@deno/astro-adapter").then((m) => m.default()),
    vite: () => import("@deno/vite-plugin").then((m) => m.default()),
};

const ReactCompilerConfig = {};

export default defineConfig({
    output: "server",
    adapter: await deno.astro(),
    integrations: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
            },
        }),
        db(),
    ],
    // vite: {
    //     plugins: [await deno.vite()]
    // }
});
