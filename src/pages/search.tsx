import dynamic from 'next/dynamic'
import { PageNotFound } from 'src/components/utils'
import config from 'src/config'

const getSearchResult = () => dynamic(import('../components/search/SearchResults'), { ssr: false })

export default config.enableSearch ? getSearchResult() : PageNotFound
