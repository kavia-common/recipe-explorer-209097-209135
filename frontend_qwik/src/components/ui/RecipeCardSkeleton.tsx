import { component$ } from "@builder.io/qwik";

/**
 * RecipeCardSkeleton renders a visual placeholder while loading recipe data.
 */
// PUBLIC_INTERFACE
export const RecipeCardSkeleton = component$(() => {
  return (
    <article class="card" style={{ padding: "var(--space-4)" }} aria-busy="true" aria-live="polite">
      <div
        class="rounded-md"
        style={{
          aspectRatio: "16 / 9",
          background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 37%, #f3f4f6 63%)",
          backgroundSize: "400% 100%",
          animation: "shimmer 1.4s ease infinite",
          marginBottom: "var(--space-3)",
        }}
      />
      <div
        class="rounded-sm"
        style={{
          height: "1.1rem",
          width: "70%",
          background: "#e5e7eb",
          marginBottom: "0.5rem",
        }}
      />
      <div class="rounded-sm" style={{ height: "0.9rem", width: "95%", background: "#f1f5f9" }} />
      <style>
        {`@keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }`}
      </style>
    </article>
  );
});

export default RecipeCardSkeleton;
