import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";
import type { Recipe } from "~/lib/types";

/**
 * RecipeCard displays a single recipe in a compact card.
 * Shows thumbnail, title, description, tags, and quick meta (time/servings).
 */
type RecipeCardProps = {
  recipe: Recipe;
  onTagClick$?: PropFunction<(tag: string) => void>;
};

// PUBLIC_INTERFACE
export const RecipeCard = component$<RecipeCardProps>(({ recipe, onTagClick$ }) => {
  const image = recipe.thumbnailUrl || recipe.imageUrl;
  const time =
    recipe.totalTimeMinutes ??
    (typeof recipe.prepTimeMinutes === "number" && typeof recipe.cookTimeMinutes === "number"
      ? recipe.prepTimeMinutes + recipe.cookTimeMinutes
      : undefined);

  return (
    <article class="card" style={{ padding: "var(--space-4)" }}>
      {/* Image */}
      <a href={`/recipes/${encodeURIComponent(recipe.id)}`} aria-label={`Open ${recipe.title}`}>
        <div
          class="rounded-md shadow-sm"
          style={{
            aspectRatio: "16 / 9",
            background: "#f3f4f6",
            overflow: "hidden",
            marginBottom: "var(--space-3)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {image ? (
            <img
              src={image}
              alt={recipe.title}
              loading="lazy"
              width={640}
              height={360}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ color: "rgba(17,24,39,0.5)" }}>No Image</span>
          )}
        </div>
      </a>

      {/* Title */}
      <h3 class="m-0" style={{ fontWeight: 700, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
        <a class="transition" href={`/recipes/${encodeURIComponent(recipe.id)}`} style={{ color: "inherit" }}>
          {recipe.title}
        </a>
      </h3>

      {/* Description */}
      {recipe.description && (
        <p style={{ marginTop: "0.375rem", color: "rgba(17,24,39,0.8)" }}>
          {recipe.description.length > 120 ? recipe.description.slice(0, 117) + "..." : recipe.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "var(--space-3)", alignItems: "center" }}>
        {time !== undefined && (
          <span class="badge" title="Total time">
            ⏱️ {time}m
          </span>
        )}
        {typeof recipe.servings === "number" && (
          <span class="badge" title="Servings">
            🍽️ {recipe.servings}
          </span>
        )}
        {recipe.cuisine && <span class="badge">{recipe.cuisine}</span>}
      </div>

      {/* Tags */}
      {Array.isArray(recipe.tags) && recipe.tags.length > 0 && (
        <div style={{ marginTop: "var(--space-3)", display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
          {recipe.tags.slice(0, 6).map((t) => (
            <button
              key={t}
              type="button"
              class="badge badge-primary transition"
              aria-label={`Filter by ${t}`}
              onClick$={async () => onTagClick$ && (await onTagClick$(t))}
            >
              #{t}
            </button>
          ))}
        </div>
      )}
    </article>
  );
});

export default RecipeCard;
