import ReactMarkdown from 'react-markdown'

interface Props {
  source?: string
  className?: string
}

export const DfMd = ({ source, className = '' }: Props) => (
  <ReactMarkdown className={`markdown-body ${className}`} linkTarget='_blank'>
    {source ?? ''}
  </ReactMarkdown>
)
