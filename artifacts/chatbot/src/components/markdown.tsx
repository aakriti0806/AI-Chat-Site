import React, { memo } from "react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export const MarkdownRenderer = memo(
  ({ content }: { content: string }) => {
    return (
      <Markdown
        className="prose prose-sm dark:prose-invert max-w-none break-words"
        components={{
          code({ node, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <SyntaxHighlighter
                {...props}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                className="rounded-md !my-4 !bg-zinc-950"
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code {...props} className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-sm">
                {children}
              </code>
            );
          },
          p({ children }) {
            return <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>;
          },
          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-medium"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </Markdown>
    );
  }
);

MarkdownRenderer.displayName = "MarkdownRenderer";
