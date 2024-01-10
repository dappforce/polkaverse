import clsx from 'clsx'
import { useState } from 'react'
import { useSetChatOpen } from 'src/rtk/app/hooks'
import { useAppSelector } from 'src/rtk/app/store'
import { idToBn, PostStruct } from 'src/types'
import { MutedSpan } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'
import { ActiveVoters, PostVoters } from '../voting/ListVoters'

type StatsProps = {
  post: PostStruct
  goToCommentsId?: string
}

export const StatsPanel = (props: StatsProps) => {
  const { post } = props

  const setChatOpen = useSetChatOpen()
  const [postVotersOpen, setPostVotersOpen] = useState(false)

  const totalMessageCount = useAppSelector(state => state.chat.totalMessageCount)
  const { upvotesCount, downvotesCount, sharesCount, id } = post
  const reactionsCount = upvotesCount + downvotesCount
  const showReactionsModal = () => reactionsCount && setPostVotersOpen(true)

  const toggleCommentsSection = () => {
    setChatOpen(true)
  }
  const comments = <Pluralize count={totalMessageCount || 0} singularText='Comment' />

  return (
    <>
      <div className='DfCountsPreview'>
        <MutedSpan className={reactionsCount ? '' : 'disable'}>
          <span onClick={showReactionsModal} className={clsx(reactionsCount > 0 && 'DfMutedLink')}>
            <Pluralize count={reactionsCount} singularText='Reaction' />
          </span>
        </MutedSpan>
        <MutedSpan>
          <span onClick={toggleCommentsSection}>{comments}</span>
        </MutedSpan>
        {
          <MutedSpan>
            <Pluralize count={sharesCount || 0} singularText='Share' />
          </MutedSpan>
        }
        {/* <MutedSpan><Pluralize count={score} singularText='Point' /></MutedSpan> */}
      </div>
      <PostVoters
        id={idToBn(id)}
        active={ActiveVoters.All}
        open={postVotersOpen}
        close={() => setPostVotersOpen(false)}
      />
    </>
  )
}
