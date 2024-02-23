import clsx from 'clsx'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { DfImage } from './DfImage'

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
    components={{
      // @ts-expect-error - the props type is not correctly inferred
      img: props => <DfImage {...props} />,
    }}
  >
    {source?.replaceAll('(https://app.subsocial.network/ipfs', '(https://ipfs.subsocial.network') ??
      ''}
  </ReactMarkdown>
)
