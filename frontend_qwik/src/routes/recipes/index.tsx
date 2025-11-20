import { $, component$, Resource, useResource$ } from "@builder.io/qwik";
import { type DocumentHead, useLocation, useNavigate } from "@builder.io/qwik-city";
import { fetchRecipes } from "~/lib/api";
import type { RecipeListResponse, RecipeQuery } from "~/lib/types";
import RecipeCard from "~/components/ui/RecipeCard";
import RecipeCardSkeleton from "~/components/ui/RecipeCardSkeleton";
import Pagination from "~/components/ui/Pagination";
import TagPills from "~/components/ui/TagPills";

/**
 * Build a RecipeQuery from current URL params.
 */
function parseQuery(loc: URL): RecipeQuery {
  const p = loc.searchParams;
  const page = Number(p.get("page") ?? "1");
  const pageSize = Number(p.get("pageSize") ?? "24");
  const q = p.get("q") ?? undefined;
  const cuisine = p.get("cuisine") ?? undefined;
  const sort = (p.get("sort") as RecipeQuery["sort"]) ?? undefined;
  const tags = p.getAll("tags").filter(Boolean);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 24,
    q,
    cuisine,
    sort,
    tags: tags.length ? tags : undefined,
  };
}

/**
 * Update the current URL with provided changes while preserving other params.
 */
function buildUrlWithParams(current: URL, changes: Partial<RecipeQuery>): string {
  const url = new URL(current.href);
  const params = url.searchParams;

  if ("q" in changes) {
    const v = (changes.q ?? "").trim();
    v ? params.set("q", v) : params.delete("q");
  }
  if ("page" in changes) {
    const v = changes.page;
    typeof v === "number" && v > 0 ? params.set("page", String(v)) : params.delete("page");
  }
  if ("pageSize" in changes) {
    const v = changes.pageSize;
    typeof v === "number" && v > 0 ? params.set("pageSize", String(v)) : params.delete("pageSize");
  }
  if ("cuisine" in changes) {
    const v = (changes.cuisine ?? "").trim();
    v ? params.set("cuisine", v) : params.delete("cuisine");
  }
  if ("sort" in changes) {
    const v = changes.sort;
    v ? params.set("sort", v) : params.delete("sort");
  }
  if ("tags" in changes) {
    params.delete("tags");
    const tags = changes.tags ?? [];
    for (const t of tags) {
      if (t) params.append("tags", t);
    }
  }

  url.search = params.toString();
  return `${url.pathname}${url.search}`;
}

/**
 * Recipes list page.
 * - Uses Resource+useResource$ to SSR load recipes based on URL params.
 * - Displays skeletons while loading, empty/error states, and a responsive grid of cards.
 * - Includes TagPills (from API response if provided) and Pagination controls.
 */
// PUBLIC_INTERFACE
export default component$(() => {
  const locState = useLocation();
  const navigate = useNavigate();

  const recipesResource = useResource$<RecipeListResponse>(async ({ track, cleanup }) => {
    // Re-run when the URL changes
    track(() => locState.url.href);

    const controller = new AbortController();
    cleanup(() => controller.abort("route-change"));

    const query = parseQuery(locState.url);
    // Allow error to propagate and be handled by Resource.onRejected
    return await fetchRecipes(query, { signal: controller.signal });
  });

  const onPageChange = $(async (page: number) => {
    const next = buildUrlWithParams(locState.url, { page });
    await navigate(next, { replaceState: false, scroll: true });
  });

  const onTagToggle = $(async (tag: string) => {
    const current = parseQuery(locState.url);
    const list = new Set(current.tags ?? []);
    if (list.has(tag)) list.delete(tag);
    else list.add(tag);
    const next = buildUrlWithParams(locState.url, { tags: Array.from(list), page: 1 });
    await navigate(next, { replaceState: false, scroll: true });
  });

  const onTagClickCard = $(async (tag: string) => {
    const current = parseQuery(locState.url);
    const tags = Array.from(new Set([...(current.tags ?? []), tag]));
    const next = buildUrlWithParams(locState.url, { tags, page: 1 });
    await navigate(next, { replaceState: false, scroll: true });
  });

  return (
    <section class="grid" style={{ gap: "var(--space-6)" }}>
      {/* Heading */}
      <header class="surface-gradient card" style={{ padding: "var(--space-6)" }}>
        <h1 class="h1 m-0">Recipes</h1>
        <p style={{ marginTop: "var(--space-3)", color: "rgba(17,24,39,0.75)", maxWidth: 840 }}>
          Browse, search, and filter recipes. Use the search bar in the header to refine results,
          select tags below, and paginate through the catalog.
        </p>
      </header>

      <Resource
        value={recipesResource}
        onPending={() => (
          <>
            {/* Loading state: show tag bar placeholder and skeleton grid */}
            <div class="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <span
                    key={i}
                    class="badge"
                    style={{
                      background: "#f3f4f6",
                      borderColor: "rgba(17,24,39,0.06)",
                      width: "72px",
                      height: "28px",
                    }}
                  />
                ))}
              </div>
            </div>

            <div class="grid grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <RecipeCardSkeleton key={i} />
              ))}
            </div>
          </>
        )}
        onRejected={(err) => (
          <div
            class="card"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            tabIndex={-1}
            style={{ borderColor: "rgba(239,68,68,0.3)", borderWidth: "1px" }}
          >
            <h2 class="h2 m-0" style={{ color: "var(--error)" }}>
              Failed to load recipes
            </h2>
            <p style={{ marginTop: "0.5rem" }}>
              {err instanceof Error ? err.message : "An unexpected error occurred while fetching recipes."}
            </p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <a class="btn btn-primary" href={locState.url.pathname + locState.url.search}>
                Retry
              </a>
            </div>
          </div>
        )}
        onResolved={(data) => {
          const items = data.data ?? [];
          const pagination = data.pagination;
          // Prefer tags from API response for TagPills, else fallback to tags from items
          const apiTags = Array.isArray(data.tags) ? data.tags : [];
          const derivedTags = Array.from(
            new Set(items.flatMap((r) => (Array.isArray(r.tags) ? r.tags : [])))
          );
          const allTags = apiTags.length ? apiTags : derivedTags;

          const selected = parseQuery(locState.url).tags ?? [];

          return (
            <>
              {/* Tag filters */}
              <TagPills tags={allTags} selected={selected} onToggle$={onTagToggle} />

              {/* Empty state */}
              {items.length === 0 ? (
                <div
                  class="card"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  tabIndex={-1}
                >
                  <h2 class="h2 m-0">No recipes found</h2>
                  <p style={{ marginTop: "0.5rem" }}>
                    Try adjusting your search or removing some filters.
                  </p>
                  <div style={{ marginTop: "var(--space-3)", display: "flex", gap: "0.5rem" }}>
                    <a class="btn btn-ghost" href="/recipes">Clear all</a>
                    <a class="btn btn-primary" href="/?q=pasta">Try “pasta”</a>
                  </div>
                </div>
              ) : (
                <>
                  {/* Grid of recipe cards */}
                  <div class="grid grid-cols-3">
                    {items.map((r) => (
                      <RecipeCard key={r.id} recipe={r} onTagClick$={onTagClickCard} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination pagination={pagination} onPageChange$={onPageChange} />
                </>
              )}
            </>
          );
        }}
      />
    </section>
  );
});

export const head: DocumentHead = {
  title: "Recipes • Recipe Explorer",
  meta: [
    {
      name: "description",
      content: "Browse, search, and filter recipes with a modern, responsive UI.",
    },
  ],
};
