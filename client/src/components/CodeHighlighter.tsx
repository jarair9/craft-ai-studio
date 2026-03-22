import { useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface CodeHighlighterProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeHighlighter({ code, language = 'typescript', showLineNumbers = true }: CodeHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      codeRef.current.textContent = code;
      hljs.highlightElement(codeRef.current);
    }
  }, [code]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="relative bg-[#282c34] rounded-lg overflow-hidden border border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e2227] border-b border-border">
        <span className="text-xs text-muted-foreground font-mono">{language}</span>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="gap-1 h-7 text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-[#2d3139]">
                {showLineNumbers && (
                  <td className="select-none w-12 px-4 py-1 text-right text-muted-foreground text-xs font-mono bg-[#1e2227] border-r border-border">
                    {idx + 1}
                  </td>
                )}
                <td className="px-4 py-1 text-xs font-mono">
                  <pre className="m-0">
                    <code
                      ref={idx === 0 ? codeRef : undefined}
                      className={`language-${language}`}
                      dangerouslySetInnerHTML={{
                        __html: hljs.highlight(line || ' ', { language, ignoreIllegals: true }).value
                      }}
                    />
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
