import { defineConfig } from "vite";
import { splitVendorChunkPlugin } from "vite";
import mkcert from "vite-plugin-mkcert";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    https: true,
  },
  plugins: [react(), splitVendorChunkPlugin(), mkcert()],
});
