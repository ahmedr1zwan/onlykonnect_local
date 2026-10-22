import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  // App version shown in the footer; bump it in package.json (see CHANGELOG.md)
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
});
