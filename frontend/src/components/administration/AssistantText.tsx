import type { ReactNode } from "react";

// Render links and emphasis as React elements; never insert model-provided HTML.
export default function AssistantText({ text }: { text: string }) {
  const pattern = /\[([^\]\n]+)\]\((https:\/\/[^\s)]+)\)|\*\*([^*\n]+)\*\*/g;
  const nodes: ReactNode[] = [];
  let start = 0;
  for (const match of text.matchAll(pattern)) {
    const index = match.index ?? 0;
    nodes.push(text.slice(start, index));
    if (match[1] && match[2]) {
      nodes.push(<a key={index} href={match[2]} target="_blank" rel="noopener noreferrer">{match[1]}</a>);
    } else {
      nodes.push(<strong key={index}>{match[3]}</strong>);
    }
    start = index + match[0].length;
  }
  nodes.push(text.slice(start));
  return <>{nodes}</>;
}
