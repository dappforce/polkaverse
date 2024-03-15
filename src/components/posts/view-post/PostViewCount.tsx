import clsx from 'clsx'
import { ComponentProps } from 'react'
import { FaRegEye } from 'react-icons/fa6'
import { usePostViewCount } from 'src/rtk/app/hooks'

export default function PostViewCount({
  postId,
  ...props
}: { postId: string } & ComponentProps<'div'>) {
  const viewCount = usePostViewCount(postId)

  return (
    <div
      {...props}
      className={clsx(
        'd-flex align-items-center ColorMuted FontWeightMedium GapTiny',
        props.className,
      )}
    >
      <FaRegEye className='FontLarge' />
      <span>{viewCount}</span>
    </div>
  )
}
