import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  source?: string
  className?: string
}

export const DfMd = ({ source, className = '' }: Props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className={`markdown-body ${className}`}
    linkTarget='_blank'
  >
    {source?.replaceAll('(https://app.subsocial.network/ipfs', '(https://ipfs.subsocial.network') ??
      ''}
  </ReactMarkdown>
)
