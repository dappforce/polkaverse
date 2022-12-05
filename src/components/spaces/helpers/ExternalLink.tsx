type LinkProps = {
  url: string
  value: React.ReactNode
}

const ExternalLink = ({ url, value }: LinkProps) => (
  <a href={url} target='_blank' rel='noreferrer'>
    {value}
  </a>
)

export default ExternalLink
