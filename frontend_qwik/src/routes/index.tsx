import { component$ } from "@builder.io/qwik";
import { routeLoader$ } from "@builder.io/qwik-city";
import type { DocumentHead } from "@builder.io/qwik-city";

/**
 * Loader redirects "/" to "/recipes", preserving the `?q=` query if present.
 */
export const useRedirect = routeLoader$(({ redirect, url }) => {
  const q = url.searchParams.get("q");
  const target = q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes";
  throw redirect(302, target);
});

// PUBLIC_INTERFACE
export default component$(() => {
  // This component never renders because the routeLoader above redirects.
  return null;
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
