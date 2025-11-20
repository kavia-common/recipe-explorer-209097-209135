import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

// PUBLIC_INTERFACE
export default component$(() => {
  return (
    <section class="grid" style={{ gap: "var(--space-8)" }}>
      <div class="card">
        <h1 class="h1 m-0">Welcome to Recipe Explorer</h1>
        <p style={{ marginTop: "var(--space-4)", maxWidth: 720 }}>
          Use the search bar above to find recipes by name, ingredient, or cuisine.
          Explore all results on the Recipes page presented in a responsive grid of cards.
        </p>
        <div style={{ marginTop: "var(--space-6)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a class="btn btn-primary" href="/recipes">Browse Recipes</a>
          <a class="btn btn-ghost" href="/recipes?q=pasta">Try “pasta”</a>
        </div>
      </div>
    </section>
  );
});

export const head: DocumentHead = {
  title: "Recipe Explorer",
  meta: [
    {
      name: "description",
      content: "Browse, search, and view interactive recipe details.",
    },
  ],
};
