import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";
import type { Pagination as PaginationMeta } from "~/lib/types";

type PaginationProps = {
  pagination?: PaginationMeta;
  onPageChange$?: PropFunction<(page: number) => void>;
};

/**
 * Pagination component displaying previous/next and page info.
 */
// PUBLIC_INTERFACE
export const Pagination = component$<PaginationProps>(({ pagination, onPageChange$ }) => {
  if (!pagination) return null;

  const { page, totalPages, total } = pagination;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div
      class="card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-4)",
        padding: "var(--space-4)",
        justifyContent: "space-between",
      }}
      role="navigation"
      aria-label="Pagination"
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          class="btn btn-ghost"
          disabled={!canPrev}
          aria-disabled={!canPrev}
          onClick$={async () => canPrev && onPageChange$ && (await onPageChange$(page - 1))}
        >
          ← Previous
        </button>
        <button
          class="btn btn-ghost"
          disabled={!canNext}
          aria-disabled={!canNext}
          onClick$={async () => canNext && onPageChange$ && (await onPageChange$(page + 1))}
        >
          Next →
        </button>
      </div>
      <div style={{ fontSize: "var(--font-size-sm)", color: "rgba(17,24,39,0.7)" }}>
        {(() => {
          const cnt = typeof total === "number" ? total : 0;
          return <>Page {page} of {Math.max(totalPages, 1)} • {cnt} result{cnt === 1 ? "" : "s"}</>;
        })()}
      </div>
    </div>
  );
});

export default Pagination;
