import clsx from 'clsx'
import { ComponentProps } from 'react'
import { MdOutlineRemoveRedEye } from 'react-icons/md'
import { usePostViewCount } from 'src/rtk/app/hooks'

export default function PostViewCount({
  postId,
  iconSize = 'semilarge',
  ...props
}: { postId: string; iconSize?: 'normal' | 'semilarge' } & ComponentProps<'div'>) {
  const viewCount = usePostViewCount(postId)

  return (
    <div
      {...props}
      className={clsx(
        'd-flex align-items-center ColorMuted FontWeightMedium GapTiny',
        props.className,
      )}
    >
      <MdOutlineRemoveRedEye
        className={iconSize === 'semilarge' ? 'FontSemilarge' : 'FontNormal'}
      />
      <span>{viewCount}</span>
    </div>
  )
}
