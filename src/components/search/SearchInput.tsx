import { nonEmptyStr } from '@subsocial/utils'
import { Input, Tag } from 'antd'
import BN from 'bn.js'
import clsx from 'clsx'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSendEvent } from 'src/providers/AnalyticContext'
import { SpaceWithSomeDetails } from 'src/types'
import { useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { getSpaceId } from '../substrate/util/index'
import BaseAvatar from '../utils/DfAvatar'
import style from './SearchInput.module.sass'

const { Search } = Input

type SpaceTagProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  space?: SpaceWithSomeDetails
}

const SpaceFilter = ({ visible, setVisible, space }: SpaceTagProps) => {
  if (!space) return null

  const { content, struct } = space

  if (!content) return null

  const owner = struct.ownerId

  const { name, image } = content

  return (
    <div className='d-flex'>
      {visible ? (
        <Tag className={style.SpaceTag} closable onClose={() => setVisible(false)}>
          {' '}
          <>
            <BaseAvatar identityValue={owner} avatar={image} size={16} />
            <span className={style.SpaceName}>{name}</span>
          </>
        </Tag>
      ) : null}
    </div>
  )
}

const SearchInput = () => {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState<string | undefined>(router.query.q as string)
  const [withSpaceFilter, setWithSpaceFilter] = useState<boolean>(true)
  const [spaceId, setSpaceId] = useState<string>()
  const isSearchPage = router.pathname.includes('search')
  const sendEvent = useSendEvent()

  const spaceIdOrHandle = router.query?.spaceId as string | undefined

  const space = useSelectSpace(spaceId)

  useSubsocialEffect(
    ({ subsocial }) => {
      const resolveSpaceId = async () => {
        let id: BN | undefined

        if (spaceIdOrHandle) {
          id = await getSpaceId(spaceIdOrHandle, subsocial)
        }

        setSpaceId(id?.toString())
      }

      resolveSpaceId()
    },
    [router.pathname],
  )

  useEffect(() => {
    setWithSpaceFilter(!!spaceId)
  }, [spaceId?.toString()])

  useEffect(() => {
    if (isSearchPage) return

    setSearchValue(undefined)
  }, [isSearchPage])

  const onSearch = (value: string) => {
    const spaceIdParam = { spaceId: withSpaceFilter ? spaceId : '' }

    const queryPath = {
      pathname: '/search',
      query: {
        ...router.query,
        ...spaceIdParam,
        q: value,
      },
    }

    sendEvent('search', { value })
    return nonEmptyStr(value) && router.replace(queryPath, queryPath)
  }

  const onChange = (value: string) => setSearchValue(value)

  const placeholder = withSpaceFilter
    ? 'Search for posts in this space'
    : 'Search for spaces, posts or comments'

  return (
    <div className={clsx('DfSearch', style.SearchInput)}>
      <Search
        placeholder={placeholder}
        onSearch={onSearch}
        value={searchValue}
        onChange={e => onChange(e.currentTarget.value)}
        prefix={
          <SpaceFilter visible={withSpaceFilter} setVisible={setWithSpaceFilter} space={space} />
        }
      />
    </div>
  )
}

export default SearchInput
