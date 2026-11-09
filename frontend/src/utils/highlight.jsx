export const highlightText = (text, query) => {
  if (!query) return text;

  const parts = text.split(new RegExp(`(${query})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <span key={i} className="bg-warning-soft text-warning text-black px-1 rounded">
        {part}
      </span>
    ) : (
      part
    )
  );
};