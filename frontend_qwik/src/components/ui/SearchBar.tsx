import { $, component$, useSignal, useTask$ } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";

type SearchBarProps = {
  placeholder?: string;
  /** Optional: autofocus the input on mount */
  autoFocus?: boolean;
  /** Optional: aria-label override */
  ariaLabel?: string;
};

/**
 * SearchBar component wired to the `?q=` query parameter.
 * - Reads initial value from the current location.
 * - On submit, navigates to the same path with updated `?q=` value.
 * - Provides a clear button that removes the `q` parameter.
 */
// PUBLIC_INTERFACE
export const SearchBar = component$<SearchBarProps>((props) => {
  const loc = useLocation();
  const nav = useNavigate();

  const q = useSignal("");
  const isSubmitting = useSignal(false);

  // Initialize from URL on mount and whenever the url changes (e.g. back/forward)
  useTask$(({ track }) => {
    track(() => loc.url.search);
    const current = new URLSearchParams(loc.url.search).get("q") ?? "";
    q.value = current;
  });

  const onSubmit = $(async (ev: Event) => {
    ev.preventDefault();
    isSubmitting.value = true;
    try {
      const url = new URL(loc.url);
      const params = url.searchParams;
      const trimmed = q.value.trim();
      if (trimmed) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }
      // Navigate to updated URL on same route (preserves SSR/CSR behavior)
      await nav(`${url.pathname}?${params.toString()}`, { replaceState: false, scroll: true });
    } finally {
      isSubmitting.value = false;
    }
  });

  const onClear = $(async () => {
    q.value = "";
    const url = new URL(loc.url);
    const params = url.searchParams;
    params.delete("q");
    await nav(`${url.pathname}?${params.toString()}`, { replaceState: false, scroll: true });
  });

  return (
    <form preventdefault:submit onSubmit$={onSubmit} role="search" aria-label={props.ariaLabel ?? "Recipe search"}>
      <div
        class="transition rounded-md shadow-sm"
        style={{
          position: "relative",
          background: "var(--surface)",
          border: "var(--border)",
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "0.375rem 0.5rem",
        }}
      >
        <span
          aria-hidden="true"
          class="text-primary"
          style={{ display: "inline-flex", paddingLeft: "0.25rem" }}
        >
          🔎
        </span>
        <input
          class="input"
          name="q"
          type="search"
          value={q.value}
          onInput$={(_, el) => (q.value = el.value)}
          placeholder={props.placeholder ?? "Search recipes by name, ingredient, or cuisine..."}
          aria-label={props.ariaLabel ?? "Search recipes"}
          style={{
            border: "none",
            background: "transparent",
            padding: "0.5rem",
          }}
          autoFocus={props.autoFocus}
        />
        {q.value && (
          <button
            type="button"
            aria-label="Clear search"
            class="btn btn-ghost"
            onClick$={onClear}
            style={{ padding: "0.375rem 0.5rem" }}
          >
            ✕
          </button>
        )}
        <button
          type="submit"
          class="btn btn-primary"
          disabled={isSubmitting.value}
          aria-label="Submit search"
        >
          {isSubmitting.value ? "Searching..." : "Search"}
        </button>
      </div>
    </form>
  );
});

export default SearchBar;
