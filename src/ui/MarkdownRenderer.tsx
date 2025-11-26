import React from 'react';
import { Box, Text } from 'ink';
import { highlight } from 'cli-highlight';

interface MarkdownRendererProps {
  children: string;
}

/**
 * Simple markdown renderer for terminal UI.
 * Supports: bold, inline code, code blocks with syntax highlighting, lists, and basic formatting.
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ children }) => {
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];

  lines.forEach((line, idx) => {
    // Handle code block fences
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        // Starting code block
        codeBlockLang = line.trim().slice(3);
        inCodeBlock = true;
        codeBlockLines = [];
      } else {
        // Ending code block - render accumulated code with syntax highlighting
        inCodeBlock = false;
        const codeContent = codeBlockLines.join('\n');
        
        try {
          // Highlight code with detected language
          const highlighted = highlight(codeContent, { 
            language: codeBlockLang || 'javascript',
            ignoreIllegals: true 
          });
          
          // Split highlighted output by lines and render
          highlighted.split('\n').forEach((highlightedLine, hIdx) => {
            elements.push(
              <Text key={`cb-${idx}-${hIdx}`}>
                {highlightedLine}
              </Text>
            );
          });
        } catch (err) {
          // Fallback to plain cyan if highlighting fails
          codeBlockLines.forEach((codeLine, cIdx) => {
            elements.push(
              <Text key={`cb-${idx}-${cIdx}`} color="cyan">
                {codeLine}
              </Text>
            );
          });
        }
        
        codeBlockLang = '';
        codeBlockLines = [];
      }
      return;
    }

    // Inside code block - accumulate lines
    if (inCodeBlock) {
      codeBlockLines.push(line);
      return;
    }

    // Empty line
    if (line.trim() === '') {
      elements.push(<Text key={idx}> </Text>);
      return;
    }

    // Check for headings (# to ######)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      elements.push(renderHeading(text, level, idx));
      return;
    }

    // Render line with inline markdown
    elements.push(renderInlineMarkdown(line, idx));
  });

  return (
    <Box flexDirection="column">
      {elements}
    </Box>
  );
};

/**
 * Renders a heading with appropriate styling based on level
 */
function renderHeading(text: string, level: number, key: number): React.ReactNode {
  // Apply styling based on heading level
  switch (level) {
    case 1:
      return (
        <Text key={key} bold color="magenta" underline>
          {text}
        </Text>
      );
    case 2:
      return (
        <Text key={key} bold color="cyan">
          {text}
        </Text>
      );
    case 3:
      return (
        <Text key={key} bold color="yellow">
          {text}
        </Text>
      );
    case 4:
      return (
        <Text key={key} bold color="green">
          {text}
        </Text>
      );
    case 5:
      return (
        <Text key={key} bold>
          {text}
        </Text>
      );
    case 6:
      return (
        <Text key={key} dimColor bold>
          {text}
        </Text>
      );
    default:
      return (
        <Text key={key} bold>
          {text}
        </Text>
      );
  }
}

/**
 * Renders a line with inline markdown (bold, code, etc.)
 */
function renderInlineMarkdown(line: string, key: number): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = line;
  let partKey = 0;

  while (remaining.length > 0) {
    // Try to match bold (**text**)
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)/);
    if (boldMatch) {
      if (boldMatch[1]) {
        parts.push(boldMatch[1]);
      }
      parts.push(
        <Text key={`${key}-b-${partKey++}`} bold>
          {boldMatch[2]}
        </Text>
      );
      remaining = boldMatch[3];
      continue;
    }

    // Try to match inline code (`text`)
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)/);
    if (codeMatch) {
      if (codeMatch[1]) {
        parts.push(codeMatch[1]);
      }
      parts.push(
        <Text key={`${key}-c-${partKey++}`} color="cyan">
          {codeMatch[2]}
        </Text>
      );
      remaining = codeMatch[3];
      continue;
    }

    // Try to match italic (*text* or _text_)
    const italicMatch = remaining.match(/^(.*?)[\*_](.+?)[\*_](.*)/);
    if (italicMatch) {
      if (italicMatch[1]) {
        parts.push(italicMatch[1]);
      }
      parts.push(
        <Text key={`${key}-i-${partKey++}`} italic>
          {italicMatch[2]}
        </Text>
      );
      remaining = italicMatch[3];
      continue;
    }

    // No more markdown, add remaining
    parts.push(remaining);
    break;
  }

  return (
    <Text key={key}>
      {parts.length > 0 ? parts : line}
    </Text>
  );
}
