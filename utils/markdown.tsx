import React from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400 lowercase">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm leading-relaxed text-gray-300">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // 1. Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-4 text-gray-200 leading-7">
      {parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          // It's a code block
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, -1).join('\n');
          return <CodeBlock key={index} language={language} code={code} />;
        } else {
          // It's regular text, handle bold, inline code, links
          return (
            <div key={index} className="whitespace-pre-wrap">
                {renderInlineMarkdown(part)}
            </div>
          );
        }
      })}
    </div>
  );
};

// Helper for bold (**text**), inline code (`text`), and headers (#)
function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple paragraph splitting
  const paragraphs = text.split(/\n\n+/);
  
  return (
      <>
          {paragraphs.map((para, pIdx) => {
             // Check for headers
             if (para.startsWith('# ')) return <h1 key={pIdx} className="text-2xl font-bold mb-2 text-white">{para.substring(2)}</h1>;
             if (para.startsWith('## ')) return <h2 key={pIdx} className="text-xl font-bold mb-2 text-white">{para.substring(3)}</h2>;
             if (para.startsWith('### ')) return <h3 key={pIdx} className="text-lg font-bold mb-2 text-white">{para.substring(4)}</h3>;
             if (para.startsWith('- ')) {
                 const items = para.split('\n').map(line => line.trim().substring(2));
                 return <ul key={pIdx} className="list-disc list-inside ml-2 mb-2">{items.map((item, i) => <li key={i}>{formatInline(item)}</li>)}</ul>
             }

             return <p key={pIdx} className="mb-2">{formatInline(para)}</p>;
          })}
      </>
  )
}

function formatInline(text: string): React.ReactNode[] {
    // Split by bold (**...**) and inline code (`...`)
    // Very basic parser.
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}
