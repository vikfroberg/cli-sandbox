// Scrolling utilities for handling large lists

export function calculateVisibleWindow(items, selectedIndex, maxVisible) {
  const totalItems = items.length;
  
  if (totalItems <= maxVisible) {
    // All items fit on screen
    return {
      startIndex: 0,
      endIndex: totalItems - 1,
      visibleItems: items,
      showScrollUp: false,
      showScrollDown: false,
    };
  }

  // Calculate scroll position to keep selected item visible
  let startIndex = Math.max(0, selectedIndex - Math.floor(maxVisible / 2));
  let endIndex = Math.min(totalItems - 1, startIndex + maxVisible - 1);
  
  // Adjust if we're near the end
  if (endIndex === totalItems - 1) {
    startIndex = Math.max(0, totalItems - maxVisible);
  }
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  
  return {
    startIndex,
    endIndex,
    visibleItems,
    showScrollUp: startIndex > 0,
    showScrollDown: endIndex < totalItems - 1,
    scrollPosition: `${selectedIndex + 1}/${totalItems}`,
  };
}

// More accurate terminal height detection
export function getTerminalHeight() {
  return process.stdout.rows || 24;
}

export function getTerminalWidth() {
  return process.stdout.columns || 80;
}

export function getMaxVisibleItems() {
  // Reserve space for:
  // - Title (1 line)
  // - Empty line (1 line) 
  // - Subtitle (1 line)
  // - Empty line (1 line)
  // - Help text (1 line)
  // - Empty line (1 line)
  // - Scroll indicators (2 lines if present)
  const reservedLines = 8;
  const terminalHeight = getTerminalHeight();
  return Math.max(3, terminalHeight - reservedLines);
}

export function getMaxVisibleExamples() {
  const terminalHeight = getTerminalHeight();
  
  // Reserve space for:
  // - Header (1 line)
  // - Empty line (1 line)
  // - Help text (1 line)
  // - Empty line (1 line) 
  // - Scroll indicators (2 lines if present)
  const reservedLines = 6;
  const availableLines = terminalHeight - reservedLines;
  
  // Each example needs approximately:
  // - Header with number and name (1 line)
  // - Description if present (1 line)
  // - Empty line (1 line)
  // - Content (variable, estimate 3-5 lines)
  // - Separator (1 line)
  // Conservative estimate: 7 lines per example
  const linesPerExample = 7;
  
  const maxExamples = Math.floor(availableLines / linesPerExample);
  
  // Debug info (can be removed later)
  // console.error(`Debug: Terminal: ${terminalHeight}h, Available: ${availableLines}, Max examples: ${maxExamples}`);
  
  return Math.max(1, maxExamples);
}