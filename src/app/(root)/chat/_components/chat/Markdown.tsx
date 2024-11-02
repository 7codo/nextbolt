import { createScopedLogger } from "@/app/(root)/chat/_lib/utils/logger";
import {
  allowedHTMLElements,
  rehypePlugins,
  remarkPlugins,
} from "@/app/(root)/chat/_lib/utils/markdown";
import { memo, useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import type { BundledLanguage } from "shiki";
import { Artifact } from "./Artifact";
import { CodeBlock } from "./CodeBlock";
import styles from "./Markdown.module.css";

const logger = createScopedLogger("MarkdownComponent");

interface MarkdownProps {
  children: string;
  html?: boolean;
  limitedMarkdown?: boolean;
}

export const Markdown = memo(
  ({ children, html = false, limitedMarkdown = false }: MarkdownProps) => {
    logger.trace("Render");

    const components = useMemo(() => {
      return {
        div: ({ className, children, node, ...props }) => {
          if (className?.includes("__boltArtifact__")) {
            const messageId = node?.properties.dataMessageId as string;

            if (!messageId) {
              logger.error(`Invalid message id ${messageId}`);
            }

            return <Artifact messageId={messageId} />;
          }

          return (
            <div className={className} {...props}>
              {children}
            </div>
          );
        },
        pre: (props) => {
          const { children, node, ...rest } = props;

          const [firstChild] = node?.children ?? [];

          if (
            firstChild &&
            firstChild.type === "element" &&
            firstChild.tagName === "code" &&
            firstChild.children[0].type === "text"
          ) {
            const { className, ...rest } = firstChild.properties;
            const [, language = "plaintext"] =
              /language-(\w+)/.exec(String(className) || "") ?? [];

            return (
              <CodeBlock
                code={firstChild.children[0].value}
                language={language as BundledLanguage}
                {...rest}
              />
            );
          }

          return <pre {...rest}>{children}</pre>;
        },
      } satisfies Components;
    }, []);

    return (
      <ReactMarkdown
        allowedElements={allowedHTMLElements}
        components={components}
        className={styles.MarkdownContent}
        remarkPlugins={remarkPlugins(limitedMarkdown)}
        rehypePlugins={rehypePlugins(html)}
      >
        {children}
      </ReactMarkdown>
    );
  }
);
Markdown.displayName = "Markdown";