import { memo } from "react"
import ReactMarkdown, { Options } from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism"

interface MarkdownProps extends Options {
  className?: string
}

function Markdown({ children, className = "", ...props }: MarkdownProps) {
  return (
    <div className={`markdown prose dark:prose-invert ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "")
            return match ? (
              <SyntaxHighlighter
                style={a11yDark}
                language={match?.[1] ?? ""}
                PreTag='div'
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code
                {...props}
                className={className}
              >
                {children}
              </code>
            )
          }
        }}
        remarkPlugins={[remarkGfm]}
        {...props}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default memo(Markdown)