import React, { useState, useEffect, useRef } from 'react';

declare const Prism: any;

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  placeholder?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, theme, placeholder, readOnly }) => {
  const [highlightedCode, setHighlightedCode] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  // Run syntax highlighting when value changes
  useEffect(() => {
    if (typeof Prism !== 'undefined') {
      // Basic highlighting for HTML (which includes CSS/JS inside script/style tags usually)
      const html = Prism.highlight(value || '', Prism.languages.html || Prism.languages.markup, 'html');
      setHighlightedCode(html);
    } else {
      setHighlightedCode(value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
    }
  }, [value]);

  // Sync scroll from textarea to pre
  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // Generate line numbers
  const lineCount = value.split('\n').length;
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className={`relative w-full h-full flex overflow-hidden code-editor-wrapper ${theme === 'dark' ? 'editor-dark' : 'editor-light'} transition-colors duration-300`}>
      {/* Line Numbers Sidebar */}
      <div className="bg-[var(--line-num-bg)] text-[var(--line-num-color)] text-right pr-3 pl-3 py-4 select-none font-mono text-xs sm:text-sm leading-[1.5] border-r border-[var(--line-border)] h-full overflow-hidden shrink-0 min-w-[3rem] flex flex-col items-end">
        <div style={{ transform: `translateY(-${textareaRef.current?.scrollTop || 0}px)` }} className="transition-transform duration-0">
          {lineNumbers.map((num) => (
            <div key={num} className="h-[1.5em]">{num}</div>
          ))}
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 h-full min-w-0">
        
        {/* Highlighter Layer (Bottom) */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 w-full h-full p-4 font-mono text-xs sm:text-sm leading-[1.5] overflow-hidden pointer-events-none whitespace-pre"
        >
          <code 
            className="language-html" 
            dangerouslySetInnerHTML={{ __html: highlightedCode + '<br />' }} 
          />
        </pre>

        {/* Editing Layer (Top) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onScroll={handleScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-[var(--caret-color)] font-mono text-xs sm:text-sm leading-[1.5] resize-none focus:outline-none custom-scrollbar whitespace-pre z-10"
        />
      </div>
    </div>
  );
};
