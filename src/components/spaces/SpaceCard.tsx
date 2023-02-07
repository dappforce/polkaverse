import { EditOutlined } from '@ant-design/icons'
import CardWithContent, { CardWithContentProps } from 'src/components/utils/cards/CardWithContent'
import { useSelectSpace } from 'src/rtk/app/hooks'
import { editSpaceUrl } from '../urls'
import { ButtonLink } from '../utils/CustomLinks'
import { DfMd } from '../utils/DfMd'
import FollowSpaceButton from '../utils/FollowSpaceButton'
import { SpaceAvatar, useIsMySpace } from './helpers'
import ViewSpaceLink from './ViewSpaceLink'

export interface SpaceCardProps
  extends Omit<CardWithContentProps, 'avatarProps' | 'title' | 'subtitle' | 'actions'> {
  spaceId: string
}

export default function SpaceCard({ spaceId, ...props }: SpaceCardProps) {
  const spaceData = useSelectSpace(spaceId)
  const isMySpace = useIsMySpace(spaceData?.struct)

  return (
    <CardWithContent
      {...props}
      avatar={
        spaceData && (
          <SpaceAvatar
            noMargin
            address={spaceData?.struct.ownerId}
            space={spaceData?.struct}
            size={64}
            avatar={spaceData?.content?.image}
          />
        )
      }
      title={
        spaceData ? (
          <ViewSpaceLink
            title={spaceData.content?.name ?? 'Unnamed Space'}
            space={spaceData.struct}
          />
        ) : (
          'Unnamed Space'
        )
      }
      subtitle={<DfMd className='ColorCurrentColor' source={spaceData?.content?.about} />}
      buttons={[
        spaceData &&
          (isMySpace ? (
            <ButtonLink
              href={'/[spaceId]/edit'}
              as={editSpaceUrl(spaceData.struct)}
              className='bg-transparent'
            >
              <EditOutlined /> Edit
            </ButtonLink>
          ) : (
            <FollowSpaceButton space={spaceData.struct} />
          )),
      ]}
    />
  )
}
