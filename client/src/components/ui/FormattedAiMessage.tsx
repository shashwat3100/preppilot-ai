import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  Terminal,
  BookOpen,
  Sparkles,
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface FormattedAiMessageProps {
  text: string;
  sources?: string[];
  speechText?: string;
  isSpeaking?: boolean;
  onSpeak?: (text: string) => void;
  onStopSpeak?: () => void;
  onPromptClick?: (prompt: string) => void;
  showSuggestions?: boolean;
}

export const FormattedAiMessage: React.FC<FormattedAiMessageProps> = ({
  text,
  sources,
  speechText,
  isSpeaking,
  onSpeak,
  onStopSpeak,
  onPromptClick,
  showSuggestions = true
}) => {
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Strip all decorative emojis to maintain a polished, professional engineering appearance
  const sanitizedText = (text || '')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    .trim();

  const handleCopyText = (content: string, idx?: number) => {
    navigator.clipboard.writeText(content);
    if (typeof idx === 'number') {
      setCopiedCodeIndex(idx);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    } else {
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  // Format inline bold (**text**), italics (*text*), and code (`code`)
  const formatInline = (content: string): React.ReactNode => {
    // Regex splits by code, bold, and italics
    const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code key={idx} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-900 border border-slate-700/80 font-mono text-[11px] text-cyan-300">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={idx} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={idx} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  // Render structured markdown elements
  const renderFormattedContent = () => {
    const rawLines = sanitizedText.split(/\r?\n/);
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer: string[] = [];
    let codeBlockIdx = 0;

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];

      // Code block start / end
      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          inCodeBlock = true;
          codeLanguage = line.trim().slice(3).trim() || 'code';
          codeBuffer = [];
        } else {
          const currentIdx = codeBlockIdx++;
          const codeString = codeBuffer.join('\n');
          elements.push(
            <div key={`code-${currentIdx}-${i}`} className="my-3 rounded-xl overflow-hidden border border-slate-750 bg-slate-950 shadow-md">
              <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-medium text-cyan-300 uppercase">
                  <Terminal size={12} /> {codeLanguage}
                </span>
                <button
                  onClick={() => handleCopyText(codeString, currentIdx)}
                  className="flex items-center gap-1 text-[11px] hover:text-white transition-colors px-2 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
                >
                  {copiedCodeIndex === currentIdx ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed">
                <code>{codeString}</code>
              </pre>
            </div>
          );
          inCodeBlock = false;
        }
        continue;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        continue;
      }

      const trimmed = line.trim();

      // Empty line spacer
      if (!trimmed) {
        elements.push(<div key={`space-${i}`} className="h-1.5" />);
        continue;
      }

      // Headings (H1/H2/H3/H4)
      if (trimmed.startsWith('### ')) {
        const title = trimmed.replace(/^###\s+/, '');
        elements.push(
          <h3 key={`h3-${i}`} className="text-sm sm:text-base font-bold text-white mt-3.5 mb-1.5 flex items-center gap-2 border-l-2 border-indigo-400 pl-2.5">
            {formatInline(title)}
          </h3>
        );
        continue;
      }

      if (trimmed.startsWith('#### ')) {
        const title = trimmed.replace(/^####\s+/, '');
        elements.push(
          <h4 key={`h4-${i}`} className="text-xs sm:text-sm font-semibold text-indigo-300 mt-2.5 mb-1 pl-1">
            {formatInline(title)}
          </h4>
        );
        continue;
      }

      if (trimmed.startsWith('# ') || trimmed.startsWith('## ')) {
        const title = trimmed.replace(/^#{1,2}\s+/, '');
        elements.push(
          <h2 key={`h2-${i}`} className="text-base sm:text-lg font-bold text-white mt-4 mb-2 border-b border-slate-800 pb-1">
            {formatInline(title)}
          </h2>
        );
        continue;
      }

      // Callout / Blockquote / Highlights
      if (trimmed.startsWith('>')) {
        const quote = trimmed.replace(/^>\s*/, '');
        const isNote = quote.toLowerCase().startsWith('[!note]') || quote.toLowerCase().startsWith('note:');
        const isTip = quote.toLowerCase().startsWith('[!tip]') || quote.toLowerCase().startsWith('tip:') || quote.toLowerCase().startsWith('interview tip:');
        const cleanQuote = quote.replace(/^\[!(note|tip|important|warning)\]\s*/i, '');

        elements.push(
          <div
            key={`quote-${i}`}
            className={`my-3 p-3.5 rounded-xl border text-xs sm:text-sm shadow-sm leading-relaxed ${
              isTip
                ? 'bg-amber-950/20 border-amber-500/40 text-amber-200'
                : isNote
                ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                : 'bg-slate-900/90 border-l-2 border-indigo-400 text-slate-200'
            }`}
          >
            <div className="flex items-start gap-2">
              {isTip ? (
                <Lightbulb size={15} className="text-amber-400 mt-0.5 shrink-0" />
              ) : isNote ? (
                <Sparkles size={15} className="text-indigo-400 mt-0.5 shrink-0" />
              ) : null}
              <div className="flex-1">{formatInline(cleanQuote)}</div>
            </div>
          </div>
        );
        continue;
      }

      // Markdown Tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|', 1)) {
        const tableLines = [trimmed];
        while (i + 1 < rawLines.length && rawLines[i + 1].trim().startsWith('|') && rawLines[i + 1].trim().endsWith('|')) {
          i++;
          tableLines.push(rawLines[i].trim());
        }

        if (tableLines.length >= 2) {
          const headerRow = tableLines[0].split('|').slice(1, -1).map(c => c.trim());
          const hasSeparator = /^\|[\s-:]+\|$/.test(tableLines[1].replace(/\|[\s-:]+/g, '|'));
          const dataRows = (hasSeparator ? tableLines.slice(2) : tableLines.slice(1)).map(row =>
            row.split('|').slice(1, -1).map(c => c.trim())
          );

          elements.push(
            <div key={`table-${i}`} className="my-3.5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/70 shadow-md">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900/95 border-b border-slate-800 text-slate-300">
                  <tr>
                    {headerRow.map((cell, ci) => (
                      <th key={ci} className="py-2.5 px-3 font-semibold text-[11px] uppercase tracking-wider text-indigo-300 border-r border-slate-800/80 last:border-r-0">
                        {formatInline(cell)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-200">
                  {dataRows.map((rowCells, ri) => (
                    <tr key={ri} className="hover:bg-slate-900/40 transition-colors">
                      {rowCells.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 text-xs border-r border-slate-800/50 last:border-r-0 font-normal">
                          {formatInline(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Bullet List Items
      if (trimmed.match(/^[-*•]\s+/)) {
        const itemText = trimmed.replace(/^[-*•]\s+/, '');
        elements.push(
          <div key={`li-${i}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-slate-200 leading-relaxed pl-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
            <div className="flex-1">{formatInline(itemText)}</div>
          </div>
        );
        continue;
      }

      // Numbered List Items
      if (trimmed.match(/^\d+\.\s+/)) {
        const match = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (match) {
          const num = match[1];
          const textContent = match[2];
          elements.push(
            <div key={`numli-${i}`} className="flex items-start gap-2.5 my-1 text-xs sm:text-sm text-slate-200 leading-relaxed pl-1">
              <span className="w-5 h-5 rounded-md bg-slate-800 text-[10px] font-semibold text-indigo-300 border border-slate-700/80 flex items-center justify-center flex-shrink-0 mt-0.5">
                {num}
              </span>
              <div className="flex-1">{formatInline(textContent)}</div>
            </div>
          );
          continue;
        }
      }

      // Standard Paragraph
      elements.push(
        <p key={`p-${i}`} className="text-xs sm:text-sm text-slate-200 leading-relaxed my-1">
          {formatInline(line)}
        </p>
      );
    }

    return elements;
  };

  return (
    <div className="space-y-2.5">
      {/* Formatted Content Body */}
      <div className="text-slate-100">
        {renderFormattedContent()}
      </div>

      {/* Sources Citations Pill */}
      {sources && sources.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <BookOpen size={11} className="text-indigo-400" /> Grounded Syllabus:
          </span>
          {sources.map((src, i) => (
            <span key={i} className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-medium">
              {src}
            </span>
          ))}
        </div>
      )}

      {/* Interactive Follow-up Deep-Dive Chips */}
      {onPromptClick && showSuggestions && !sanitizedText.toLowerCase().includes('connection hiccup') && (
        <div className="pt-2.5 pb-1 flex flex-wrap items-center gap-1.5 animate-in fade-in">
          <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1 select-none">
            <Sparkles size={11} className="text-indigo-400" /> Deep Dive:
          </span>
          {[
            'Show code implementation & dry run',
            'Explain Time and Space Complexity trade-offs',
            'What follow-up interview questions could be asked?'
          ].map((promptText, pIdx) => (
            <button
              key={pIdx}
              onClick={() => onPromptClick(promptText)}
              className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-indigo-600/25 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-500/50 text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95"
            >
              <span>{promptText}</span>
              <ArrowRight size={10} className="text-slate-500" />
            </button>
          ))}
        </div>
      )}

      {/* Message Actions Bar (Copy & TTS) */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-800/40 text-slate-400 text-xs">
        <button
          onClick={() => handleCopyText(sanitizedText)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:text-white hover:bg-slate-800/80 transition-colors text-[11px] font-medium cursor-pointer"
          title="Copy response"
        >
          {copiedMessage ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>

        {speechText && onSpeak && (
          <button
            onClick={() => (isSpeaking && onStopSpeak ? onStopSpeak() : onSpeak(speechText))}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:text-indigo-300 hover:bg-slate-800/80 transition-colors text-[11px] font-medium cursor-pointer"
            title={isSpeaking ? 'Stop audio' : 'Listen with Voice Assistant'}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={12} className="text-rose-400" />
                <span className="text-rose-300">Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 size={12} />
                <span>Listen Aloud</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default FormattedAiMessage;
