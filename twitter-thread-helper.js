/**
 * Twitter Thread Helper
 * Intelligently splits long content into thread-ready chunks
 */

/**
 * Split content into Twitter-friendly chunks for threading
 * @param {string} content - The full content to split
 * @param {number} maxLength - Maximum characters per tweet (default 270 to leave room for indicators)
 * @returns {string[]} Array of tweet-sized chunks
 */
export function splitIntoThreads(content, maxLength = 270) {
  // If content fits in one tweet, return as-is
  if (content.length <= maxLength) {
    return [content];
  }
  
  const chunks = [];
  let remainingContent = content;
  
  while (remainingContent.length > 0) {
    if (remainingContent.length <= maxLength) {
      // Last chunk
      chunks.push(remainingContent.trim());
      break;
    }
    
    // Try to find natural breakpoints in order of preference
    let splitPoint = -1;
    
    // 1. Try splitting at double newline (paragraph break)
    const paragraphBreak = remainingContent.lastIndexOf('\n\n', maxLength);
    if (paragraphBreak > maxLength * 0.5) { // At least halfway through
      splitPoint = paragraphBreak;
    }
    
    // 2. Try splitting at single newline (line break)
    if (splitPoint === -1) {
      const lineBreak = remainingContent.lastIndexOf('\n', maxLength);
      if (lineBreak > maxLength * 0.5) {
        splitPoint = lineBreak;
      }
    }
    
    // 3. Try splitting at numbered step (1️⃣, 2️⃣, etc. or "1.", "2.", etc.)
    if (splitPoint === -1) {
      const stepPattern = /[1-9]️⃣|^[1-9]\./gm;
      const matches = [...remainingContent.slice(0, maxLength).matchAll(stepPattern)];
      if (matches.length > 1) {
        // Split before the last step found
        const lastStep = matches[matches.length - 1];
        splitPoint = lastStep.index;
      }
    }
    
    // 4. Try splitting at sentence end (. ! ?)
    if (splitPoint === -1) {
      const sentenceEnd = remainingContent.slice(0, maxLength).lastIndexOf('. ');
      if (sentenceEnd > maxLength * 0.6) {
        splitPoint = sentenceEnd + 1; // Include the period
      }
    }
    
    // 5. Try splitting at emoji boundary (common in crypto tweets)
    if (splitPoint === -1) {
      const emojiPattern = /[\u{1F300}-\u{1F9FF}]/gu;
      const emojiMatches = [...remainingContent.slice(0, maxLength).matchAll(emojiPattern)];
      if (emojiMatches.length > 0) {
        const lastEmoji = emojiMatches[emojiMatches.length - 1];
        if (lastEmoji.index > maxLength * 0.7) {
          splitPoint = lastEmoji.index;
        }
      }
    }
    
    // 6. Last resort: split at last space
    if (splitPoint === -1) {
      splitPoint = remainingContent.lastIndexOf(' ', maxLength);
      if (splitPoint === -1) {
        // Really last resort: hard cut (shouldn't happen with reasonable content)
        splitPoint = maxLength;
      }
    }
    
    // Extract chunk and update remaining content
    const chunk = remainingContent.slice(0, splitPoint).trim();
    chunks.push(chunk);
    remainingContent = remainingContent.slice(splitPoint).trim();
  }
  
  return chunks;
}

/**
 * Add thread indicators to chunks
 * @param {string[]} chunks - Array of content chunks
 * @param {string} style - Style of indicator: 'numbers', 'arrows', or 'none'
 * @returns {string[]} Chunks with indicators added
 */
export function addThreadIndicators(chunks, style = 'numbers') {
  if (chunks.length === 1) {
    return chunks; // No indicators needed for single tweet
  }
  
  return chunks.map((chunk, index) => {
    const isFirst = index === 0;
    const isLast = index === chunks.length - 1;
    const position = index + 1;
    const total = chunks.length;
    
    switch (style) {
      case 'numbers':
        // Add [1/3], [2/3], [3/3] at the end
        if (isFirst) {
          return `${chunk}\n\n🧵 [${position}/${total}]`;
        } else {
          return `🧵 [${position}/${total}]\n\n${chunk}`;
        }
      
      case 'arrows':
        // Add → for continuation
        if (isLast) {
          return `↪️ ${chunk}`;
        } else {
          return `${chunk} →`;
        }
      
      case 'none':
      default:
        return chunk;
    }
  });
}

/**
 * Detect if content needs threading
 * @param {string} content - Content to check
 * @param {number} threshold - Character threshold (default 280)
 * @returns {boolean} True if content should be threaded
 */
export function needsThreading(content, threshold = 280) {
  return content.length > threshold;
}

/**
 * Prepare content for threading (all-in-one helper)
 * @param {string} content - Original content
 * @param {object} options - Options
 * @returns {string[]} Ready-to-post tweet chunks
 */
export function prepareThread(content, options = {}) {
  const {
    maxLength = 270,
    indicatorStyle = 'numbers',
    forceThread = false
  } = options;
  
  // Check if threading is needed
  if (!forceThread && !needsThreading(content, maxLength + 10)) {
    return [content]; // Return as single tweet
  }
  
  // Split into chunks
  const chunks = splitIntoThreads(content, maxLength);
  
  // Add indicators if multiple chunks
  if (chunks.length > 1) {
    return addThreadIndicators(chunks, indicatorStyle);
  }
  
  return chunks;
}

/**
 * Validate thread chunks
 * @param {string[]} chunks - Chunks to validate
 * @param {number} maxLength - Max length per chunk
 * @returns {object} Validation result
 */
export function validateThreadChunks(chunks, maxLength = 280) {
  const errors = [];
  const warnings = [];
  
  chunks.forEach((chunk, index) => {
    if (chunk.length > maxLength) {
      errors.push(`Chunk ${index + 1} exceeds ${maxLength} characters (${chunk.length})`);
    }
    if (chunk.length < 10) {
      warnings.push(`Chunk ${index + 1} is very short (${chunk.length} chars)`);
    }
    if (!chunk.trim()) {
      errors.push(`Chunk ${index + 1} is empty`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    totalChunks: chunks.length,
    totalLength: chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  };
}
