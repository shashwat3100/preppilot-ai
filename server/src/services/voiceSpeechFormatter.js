/**
 * PrepPilot AI — Voice Speech Formatter
 * Converts technical computer science text, LaTeX notations, and markdown
 * into natural, fluent, phonetic spoken English for Text-to-Speech synthesis.
 */

export function toNaturalSpeechText(text, fallbackTopic = 'this placement topic') {
  if (!text) {
    return `Here is a structured explanation regarding ${fallbackTopic}. Focus on core principles, trade-offs, and standard interview edge cases.`;
  }

  let clean = String(text);

  // 1. Remove code blocks
  clean = clean.replace(/```[\s\S]*?```/g, 'Code implementation omitted for spoken audio. ');

  // 2. Remove table formatting
  clean = clean.replace(/\|[^\n]+\|/g, ' ');

  // 3. Remove Markdown headings, blockquotes, bullets, links, and bold/italic markers
  clean = clean
    .replace(/^#+\s+/gm, '')
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`~]/g, '');

  // 4. Translate Big-O & Mathematical Notation for Speech
  clean = clean
    .replace(/\$O\(1\)\$/gi, 'O of one')
    .replace(/\$O\(\\log n\)\$/gi, 'O of log n')
    .replace(/\$O\(n\)\$/gi, 'O of n')
    .replace(/\$O\(n\\log n\)\$/gi, 'O of n log n')
    .replace(/\$O\(n\s*\\log\s*n\)\$/gi, 'O of n log n')
    .replace(/\$O\(n\^2\)\$/gi, 'O of n squared')
    .replace(/\$O\(n\^3\)\$/gi, 'O of n cubed')
    .replace(/\$O\(2\^n\)\$/gi, 'O of 2 to the n')
    .replace(/\$O\(V\s*\+\s*E\)\$/gi, 'O of V plus E')
    .replace(/\$O\(\(V\s*\+\s*E\)\s*\\log\s*V\)\$/gi, 'O of V plus E times log V')
    .replace(/\$O\(n\s*\+\s*k\)\$/gi, 'O of n plus k')
    .replace(/O\(1\)/g, 'O of one')
    .replace(/O\(log n\)/g, 'O of log n')
    .replace(/O\(n log n\)/g, 'O of n log n')
    .replace(/O\(n\^2\)/g, 'O of n squared')
    .replace(/O\(n\)/g, 'O of n')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\theta\b/gi, 'theta')
    .replace(/\\le\b|\\leq\b/gi, 'less than or equal to')
    .replace(/\\ge\b|\\geq\b/gi, 'greater than or equal to')
    .replace(/\\neq\b/gi, 'not equal to')
    .replace(/\\times\b/gi, ' times ')
    .replace(/\\cdot\b/gi, ' dot ')
    .replace(/\\dots\b|\\cdots\b/gi, ' and so forth ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 divided by $2')
    .replace(/\$+/g, '');

  // 5. Expand Technical Acronyms for Natural Speech Cadence
  clean = clean
    .replace(/\b1NF\b/g, 'First Normal Form')
    .replace(/\b2NF\b/g, 'Second Normal Form')
    .replace(/\b3NF\b/g, 'Third Normal Form')
    .replace(/\bBCNF\b/g, 'Boyce-Codd Normal Form')
    .replace(/\bDBMS\b/g, 'D-B-M-S')
    .replace(/\bSQL\b/g, 'S-Q-L')
    .replace(/\bAPI\b/g, 'A-P-I')
    .replace(/\bAPIs\b/g, 'A-P-Is')
    .replace(/\bTCP\/IP\b/g, 'T-C-P I-P')
    .replace(/\bTCP\b/g, 'T-C-P')
    .replace(/\bUDP\b/g, 'U-D-P')
    .replace(/\bOSI\b/g, 'O-S-I')
    .replace(/\bOS\b/g, 'Operating System')
    .replace(/\bCPU\b/g, 'C-P-U')
    .replace(/\bRAM\b/g, 'Ram')
    .replace(/\bOOP\b/g, 'Object-Oriented Programming')
    .replace(/\bOOPS\b/g, 'Object-Oriented Programming')
    .replace(/\bDSA\b/g, 'Data Structures and Algorithms')
    .replace(/\bBST\b/g, 'Binary Search Tree')
    .replace(/\bLIFO\b/g, 'Last-In First-Out')
    .replace(/\bFIFO\b/g, 'First-In First-Out')
    .replace(/\bWAL\b/g, 'Write-Ahead Logging')
    .replace(/\b2PL\b/g, 'Two-Phase Locking')
    .replace(/\bTLB\b/g, 'T-L-B')
    .replace(/\bMMU\b/g, 'M-M-U')
    .replace(/\bDSU\b/g, 'Disjoint Set Union')
    .replace(/\bALE\b/g, 'A-L-E')
    .replace(/\bSTAR\b/g, 'S-T-A-R')
    .replace(/\bTCS\b/g, 'T-C-S')
    .replace(/\bNQT\b/g, 'N-Q-T')
    .replace(/\bLPA\b/g, 'Lakhs per annum');

  // 6. Split into clean sentences and select first 2-3 high-yield sentences
  const sentences = clean
    .split(/(?<=[.!?])\s+|\n+/)
    .map(s => s.trim())
    .filter(s => {
      if (!s || s.length < 15) return false;
      const sLower = s.toLowerCase();
      if (sLower.startsWith('key placement') || sLower.startsWith('interview viva') || sLower.startsWith('curriculum context')) {
        return false;
      }
      return true;
    });

  let spoken = sentences.slice(0, 3).join(' ');
  if (!spoken || spoken.length < 25) {
    spoken = clean.replace(/\s+/g, ' ').slice(0, 240);
  }

  // Ensure clean boundary around 240-270 chars without trailing fragment
  if (spoken.length > 260) {
    const lastPeriod = spoken.lastIndexOf('.', 260);
    if (lastPeriod > 100) {
      spoken = spoken.slice(0, lastPeriod + 1);
    } else {
      spoken = spoken.slice(0, 255).trim() + '...';
    }
  }

  spoken = spoken.replace(/\s+/g, ' ').trim();
  if (spoken && !spoken.endsWith('.') && !spoken.endsWith('!') && !spoken.endsWith('?')) {
    spoken += '.';
  }

  return spoken || `Here is a summary on ${fallbackTopic}. Make sure to clearly explain the definitions, trade-offs, and time complexities.`;
}

export default toNaturalSpeechText;
