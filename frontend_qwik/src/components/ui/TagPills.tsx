import { component$ } from "@builder.io/qwik";
import type { PropFunction } from "@builder.io/qwik";

/**
 * TagPills renders a horizontal list of filterable tags as pill buttons.
 */
type TagPillsProps = {
  tags: string[];
  selected?: string[];
  onToggle$?: PropFunction<(tag: string) => void>;
  maxVisible?: number;
};

// PUBLIC_INTERFACE
export const TagPills = component$<TagPillsProps>(({ tags, selected = [], onToggle$, maxVisible = 12 }) => {
  if (!tags?.length) return null;

  const visible = tags.slice(0, maxVisible);

  const isSelected = (t: string) => selected.includes(t);

  return (
    <div
      class="card"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0.5rem",
        padding: "var(--space-4)",
        alignItems: "center",
      }}
      role="group"
      aria-label="Filter by tags"
    >
      {visible.map((t) => (
        <button
          key={t}
          type="button"
          class={`badge transition ${isSelected(t) ? "badge-primary" : ""}`}
          aria-pressed={isSelected(t)}
          onClick$={async () => {
            if (onToggle$) {
              await onToggle$(t);
            }
          }}
        >
          #{t}
        </button>
      ))}
      {tags.length > visible.length && (
        <span class="badge" title={`+${tags.length - visible.length} more`}>
          +{tags.length - visible.length} more
        </span>
      )}
    </div>
  );
});

export default TagPills;
