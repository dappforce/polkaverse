import { Reaction, ReactionId } from '@subsocial/api/types/substrate'
import { isEmptyArray, newLogger, nonEmptyArr } from '@subsocial/utils'
import { Divider, Modal, Tabs, Tag } from 'antd'
import BN from 'bn.js'
import partition from 'lodash.partition'
import { useState } from 'react'
import useSubsocialEffect from '../api/useSubsocialEffect'
import { ProfilePreviewByAccountId } from '../profiles/address-views'
import { useGetSubstrateIdsById } from '../substrate/hooks/useGetIdsById'
import { Loading } from '../utils'
import { MutedDiv } from '../utils/MutedText'
import { Pluralize } from '../utils/Plularize'

const { TabPane } = Tabs

const log = newLogger('List voters')

type VotersProps = {
  id: BN
  reactionIds?: ReactionId[]
  active?: number
  open: boolean
  close: () => void
}

export enum ActiveVoters {
  All = 0,
  Upvote,
  Downvote,
}

function isUpvote(reaction: Reaction): boolean {
  return reaction && reaction.kind.toString() === 'Upvote'
}

const renderVoters = (state: Array<Reaction>) => {
  return state.map((reaction, i) => {
    return (
      <div key={reaction.id.toString()} className='ReactionsItem'>
        {i > 0 && <Divider className='my-2' />}
        <ProfilePreviewByAccountId
          address={reaction.created.account}
          bottom={
            isUpvote(reaction) ? <Tag color='green'>Upvoted</Tag> : <Tag color='red'>Downvoted</Tag>
          }
        />
      </div>
    )
  })
}

type TabPaneType = {
  title: string
  key: string
  voters: Array<Reaction>
}

const renderTitle = (title: string, voters: Array<Reaction>) =>
  nonEmptyArr(voters) ? `${title} (${voters.length})` : title

const InnerModalVoters = (props: VotersProps) => {
  const { reactionIds, open, close, active = ActiveVoters.All } = props
  const votersCount = reactionIds ? reactionIds.length : 0
  const [reactionView, setReactionView] = useState<Array<Reaction>>()
  const [trigger, setTrigger] = useState(false)
  const [upvoters, downvoters] = partition(reactionView, x => isUpvote(x))

  const toggleTrigger = () => {
    reactionIds === undefined && setTrigger(!trigger)
  }

  useSubsocialEffect(
    ({ substrate }) => {
      if (!reactionIds) return toggleTrigger()

      let isMounted = true

      const load = async () => {
        const reactions = await substrate.findReactions(reactionIds)
        isMounted && setReactionView(reactions)
      }

      load().catch(err => log.error('Failed to load reactions:', err))

      return () => {
        isMounted = false
      }
    },
    [trigger],
  )

  const renderContent = () => {
    if (!reactionView) return <Loading />

    const panes: TabPaneType[] = [
      { key: 'all', title: 'All', voters: reactionView },
      { key: 'upvote', title: 'Upvoters', voters: upvoters },
      { key: 'downvote', title: 'Downvoters', voters: downvoters },
    ]

    if (isEmptyArray(reactionView)) {
      return (
        <MutedDiv className='DfNoVoters'>
          <em>No reactions yet</em>
        </MutedDiv>
      )
    }

    return (
      <Tabs defaultActiveKey={active.toString()} style={{ marginTop: '-1rem' }}>
        {panes.map(({ key, title, voters }) => (
          <TabPane key={key} tab={renderTitle(title, voters)} disabled={isEmptyArray(voters)}>
            {renderVoters(voters)}
          </TabPane>
        ))}
      </Tabs>
    )
  }

  return (
    <Modal
      onCancel={close}
      visible={open}
      title={<Pluralize count={votersCount} singularText='Reaction' />}
      footer={null}
      className='pb-0'
    >
      {renderContent()}
    </Modal>
  )
}

const useCreateReactionIdsByPostId = (id: BN) =>
  useGetSubstrateIdsById<ReactionId>({ id, pallet: 'reactions', method: 'reactionIdsByPostId' })

export const PostVoters = (props: VotersProps) => {
  const { loading, entities } = useCreateReactionIdsByPostId(props.id)

  if (loading) return null

  return <InnerModalVoters {...props} reactionIds={entities} />
}
