
import React from 'react';

interface HighlightProps {
  text: string;
  query: string;
}

export const Highlight: React.FC<HighlightProps> = ({ text, query }) => {
  if (!query) {
    return <span>{text}</span>;
  }

  const parts = text.split(new RegExp(`(${query})`, 'gi'));

  return (
    <span>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={index} className="search-highlight">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};
