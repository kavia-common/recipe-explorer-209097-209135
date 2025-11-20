import { component$, Slot } from "@builder.io/qwik";

/**
 * Header component for the app shell.
 * Renders a sticky header with brand/title and provides a slot for actions (e.g., SearchBar).
 */
// PUBLIC_INTERFACE
export const Header = component$(() => {
  return (
    <header class="header surface-gradient">
      <div class="container" style={{ paddingTop: "var(--space-4)", paddingBottom: "var(--space-4)" }}>
        <div
          class="transition"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-6)",
            justifyContent: "space-between",
          }}
        >
          <a href="/" aria-label="Recipe Explorer home" class="transition" style={{ display: "inline-flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div
              class="rounded-full shadow-sm"
              style={{
                width: "36px",
                height: "36px",
                background: "var(--primary)",
                display: "grid",
                placeItems: "center",
                color: "white",
                fontWeight: 700,
                letterSpacing: "-0.02em",
              }}
            >
              R
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span class="text-primary" style={{ fontWeight: 800 }}>Recipe Explorer</span>
              <span style={{ fontSize: "var(--font-size-sm)", opacity: 0.8 }}>Discover. Cook. Enjoy.</span>
            </div>
          </a>

          <div style={{ flex: 1, maxWidth: "720px", marginLeft: "auto" }}>
            <Slot />
          </div>

          <nav aria-label="Primary" style={{ marginLeft: "var(--space-4)" }}>
            <a href="/" class="btn btn-ghost" style={{ padding: "0.5rem 0.75rem" }}>
              Home
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
});

export default Header;
