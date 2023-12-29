import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Props {
  source?: string
  className?: string
  omitDefaultClassName?: boolean
}

export const DfMd = ({ source, omitDefaultClassName, className = '' }: Props) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    className={clsx(!omitDefaultClassName && 'markdown-body', className)}
    linkTarget='_blank'
  >
    {source?.replaceAll('(https://app.subsocial.network/ipfs', '(https://ipfs.subsocial.network') ??
      ''}
  </ReactMarkdown>
)
