import { component$, Slot, useStyles$ } from "@builder.io/qwik";
import type { RequestHandler } from "@builder.io/qwik-city";
import styles from "./styles.css?inline";
import Header from "~/components/ui/Header";
import SearchBar from "~/components/ui/SearchBar";

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    staleWhileRevalidate: 60 * 60 * 24 * 7,
    maxAge: 5,
  });
};

// PUBLIC_INTERFACE
export default component$(() => {
  // Keep route-level styles from the template
  useStyles$(styles);

  return (
    <div class="app-shell">
      <Header>
        <SearchBar />
      </Header>

      <main class="main">
        <div class="container">
          <Slot />
        </div>
      </main>

      <footer class="footer">
        <div
          class="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "var(--space-4)",
          }}
        >
          <span style={{ fontSize: "var(--font-size-sm)" }}>
            © {new Date().getFullYear()} Recipe Explorer
          </span>
          <span class="badge badge-primary">Ocean Professional</span>
        </div>
      </footer>
    </div>
  );
});
