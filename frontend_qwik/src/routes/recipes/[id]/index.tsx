import { component$, Fragment, useStyles$, Resource } from "@builder.io/qwik";
import { routeLoader$, useLocation, type DocumentHead } from "@builder.io/qwik-city";
import { fetchRecipeById } from "~/lib/api";
import type { Recipe, RecipeDetailResponse } from "~/lib/types";
import styles from "./styles.css?inline";

// PUBLIC_INTERFACE
export const useRecipe = routeLoader$<RecipeDetailResponse>(async ({ params, error, cacheControl, signal }) => {
  /**
   * Load a recipe by :id on SSR and CSR navigations.
   * Caches briefly and returns proper error codes on failures.
   */
  cacheControl({ maxAge: 5, staleWhileRevalidate: 60 });
  const id = params.id;
  if (!id) {
    throw error(400, "Recipe id is required");
  }
  try {
    const data = await fetchRecipeById(id, { signal });
    if (!data?.data) {
      throw error(404, `Recipe ${id} not found`);
    }
    return data;
  } catch (e: any) {
    // If upstream threw a typed error, rethrow with appropriate status if present
    const status = typeof e?.status === "number" ? e.status : 500;
    throw error(status, e?.message || "Failed to load recipe");
  }
});

function timeBadge(title: string, value?: number) {
  if (typeof value !== "number") return null;
  return (
    <span class="badge" title={title}>
      ⏱️ {value}m
    </span>
  );
}

function renderIngredient(item: string | Recipe["ingredients"][number]) {
  if (typeof item === "string") {
    return <li>{item}</li>;
  }
  const parts: string[] = [];
  if (item.quantity) parts.push(item.quantity);
  if (item.unit) parts.push(item.unit);
  const qty = parts.join(" ");
  const label = [item.name, item.notes ? `(${item.notes})` : ""].filter(Boolean).join(" ");
  return (
    <li>
      {qty && <strong>{qty}</strong>} {label} {item.optional ? <em class="dim">(optional)</em> : null}
    </li>
  );
}

// PUBLIC_INTERFACE
export default component$(() => {
  useStyles$(styles);
  const loc = useLocation();
  const recipeR = useRecipe();

  const backHref = () => {
    const url = new URL(loc.url);
    const q = url.searchParams.get("q");
    // Preserve ?q back to recipes list if present
    return q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes";
  };

  const sectionTitle = (text: string) => (
    <h2 class="h2 m-0" style={{ marginBottom: "var(--space-3)" }}>
      {text}
    </h2>
  );

  return (
    <section class="grid recipe-detail" style={{ gap: "var(--space-6)" }}>
      <Resource
        value={recipeR}
        onPending={() => (
          <>
            <header class="card hero">
              <div class="media skeleton" />
              <div class="hero-content">
                <div class="title skeleton inline" style={{ width: "60%" }} />
                <div class="row" style={{ gap: "0.5rem", marginTop: "var(--space-3)" }}>
                  {Array.from({ length: 4 }).map((_v, i) => (
                    <span key={i} class="badge skeleton" style={{ width: "64px", height: "28px" }} />
                  ))}
                </div>
                <div class="row meta" style={{ gap: "0.5rem", marginTop: "var(--space-3)" }}>
                  {Array.from({ length: 3 }).map((_v, i) => (
                    <span key={i} class="badge skeleton" style={{ width: "80px", height: "28px" }} />
                  ))}
                </div>
              </div>
            </header>

            <div class="grid grid-cols-3">
              <article class="card" style={{ gridColumn: "span 2" }}>
                <div class="skeleton line" style={{ width: "40%", marginBottom: "0.75rem" }} />
                {Array.from({ length: 6 }).map((_v, i) => (
                  <div key={i} class="skeleton line" style={{ width: `${80 - i * 8}%`, marginBottom: "0.5rem" }} />
                ))}
              </article>
              <aside class="card">
                <div class="skeleton line" style={{ width: "50%", marginBottom: "0.75rem" }} />
                {Array.from({ length: 4 }).map((_v, i) => (
                  <div key={i} class="skeleton line" style={{ width: `${70 - i * 10}%`, marginBottom: "0.5rem" }} />
                ))}
              </aside>
            </div>
          </>
        )}
        onRejected={(err: unknown) => (
          <div class="card" role="alert" style={{ borderColor: "rgba(239,68,68,0.3)", borderWidth: "1px" }}>
            <h2 class="h2 m-0" style={{ color: "var(--error)" }}>
              Failed to load recipe
            </h2>
            <p style={{ marginTop: "0.5rem" }}>{err instanceof Error ? err.message : "Unexpected error."}</p>
            <div style={{ marginTop: "var(--space-3)" }}>
              <a class="btn btn-primary" href="/recipes">
                Back to recipes
              </a>
            </div>
          </div>
        )}
        onResolved={(data: RecipeDetailResponse) => {
          const r = data?.data as Recipe;
          if (!r) {
            return (
              <div class="card" role="status">
                <h2 class="h2 m-0">Recipe not found</h2>
                <p style={{ marginTop: "0.5rem" }}>The recipe you are looking for does not exist or was removed.</p>
                <div style={{ marginTop: "var(--space-3)" }}>
                  <a class="btn btn-primary" href="/recipes">
                    Back to recipes
                  </a>
                </div>
              </div>
            );
          }

          const image = r.imageUrl || r.thumbnailUrl;
          const totalTime =
            typeof r.totalTimeMinutes === "number"
              ? r.totalTimeMinutes
              : (r.prepTimeMinutes ?? 0) + (r.cookTimeMinutes ?? 0);

          return (
            <>
              {/* Back link */}
              <div>
                <a class="btn btn-ghost" href={backHref()}>
                  ← Back to results
                </a>
              </div>

              {/* Hero */}
              <header class="card hero">
                <div class="media">
                  {image ? (
                    <img
                      src={image}
                      alt={r.title}
                      width={960}
                      height={540}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="eager"
                    />
                  ) : (
                    <div class="no-image">No Image</div>
                  )}
                </div>

                <div class="hero-content">
                  <h1 class="h1 m-0">{r.title}</h1>
                  {r.description && (
                    <p class="dim" style={{ marginTop: "var(--space-3)" }}>
                      {r.description}
                    </p>
                  )}

                  {/* Tags */}
                  {Array.isArray(r.tags) && r.tags.length > 0 && (
                    <div class="row" style={{ marginTop: "var(--space-3)" }}>
                      {r.tags.slice(0, 10).map((t) => (
                        <span key={t} class="badge badge-primary">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Meta badges */}
                  <div class="row meta" style={{ marginTop: "var(--space-3)" }}>
                    {timeBadge("Total time", totalTime)}
                    {timeBadge("Prep time", r.prepTimeMinutes)}
                    {timeBadge("Cook time", r.cookTimeMinutes)}
                    {typeof r.servings === "number" && (
                      <span class="badge" title="Servings">
                        🍽️ {r.servings}
                      </span>
                    )}
                    {r.cuisine && <span class="badge">{r.cuisine}</span>}
                    {typeof r.calories === "number" && (
                      <span class="badge" title="Calories">
                        🔥 {r.calories} kcal
                      </span>
                    )}
                  </div>

                  {/* External/source */}
                  <div class="row" style={{ marginTop: "var(--space-3)" }}>
                    {r.author && <span class="badge">👨‍🍳 {r.author}</span>}
                    {r.sourceUrl && (
                      <a class="btn btn-ghost" href={r.sourceUrl} target="_blank" rel="noopener noreferrer">
                        View Source ↗
                      </a>
                    )}
                  </div>
                </div>
              </header>

              {/* Content grid: Ingredients + Steps, and Nutrition/Meta */}
              <div class="grid grid-cols-3">
                <article class="card" style={{ gridColumn: "span 2" }}>
                  {sectionTitle("Ingredients")}
                  {Array.isArray(r.ingredients) && r.ingredients.length > 0 ? (
                    <ul class="ingredients">
                      {(() => {
                        const items: Array<string | NonNullable<Recipe["ingredients"]>[number]> = Array.isArray(r.ingredients)
                          ? (r.ingredients as Array<string | NonNullable<Recipe["ingredients"]>[number]>)
                          : [];
                        return items.map((it, idx) => (
                          <Fragment key={idx}>{renderIngredient(it)}</Fragment>
                        ));
                      })()}
                    </ul>
                  ) : (
                    <p class="dim">No ingredients listed.</p>
                  )}

                  {sectionTitle("Steps")}
                  {Array.isArray(r.instructions) && r.instructions.length > 0 ? (
                    <ol class="steps">
                      {r.instructions
                        .slice()
                        .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
                        .map((s) => (
                          <li key={s.step ?? s.text}>
                            <div class="step-row">
                              <span class="step-num">{s.step ?? "•"}</span>
                              <div class="step-content">
                                <p>{s.text}</p>
                                <div class="row" style={{ marginTop: "0.375rem", gap: "0.5rem" }}>
                                  {typeof s.durationMinutes === "number" && (
                                    <span class="badge">⏱️ {s.durationMinutes}m</span>
                                  )}
                                  {s.waitUntil && <span class="badge">⏳ {s.waitUntil}</span>}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p class="dim">No steps provided.</p>
                  )}
                </article>

                <aside class="card">
                  {sectionTitle("Nutrition")}
                  <ul class="nutrition">
                    {typeof r.calories === "number" ? (
                      <li>
                        <strong>Calories:</strong> {r.calories} kcal
                      </li>
                    ) : (
                      <li class="dim">Calories not available.</li>
                    )}
                    {typeof r.servings === "number" ? (
                      <li>
                        <strong>Servings:</strong> {r.servings}
                      </li>
                    ) : null}
                  </ul>

                  {sectionTitle("Details")}
                  <ul class="nutrition">
                    {r.cuisine && (
                      <li>
                        <strong>Cuisine:</strong> {r.cuisine}
                      </li>
                    )}
                    {r.createdAt && (
                      <li>
                        <strong>Created:</strong> {new Date(r.createdAt).toLocaleDateString()}
                      </li>
                    )}
                    {r.updatedAt && (
                      <li>
                        <strong>Updated:</strong> {new Date(r.updatedAt).toLocaleDateString()}
                      </li>
                    )}
                  </ul>
                </aside>
              </div>
            </>
          );
        }}
      />
    </section>
  );
});

export const head: DocumentHead = {
  title: "Recipe • Recipe Explorer",
  meta: [
    {
      name: "description",
      content: "View detailed recipe information including ingredients, steps, and nutrition.",
    },
  ],
};
