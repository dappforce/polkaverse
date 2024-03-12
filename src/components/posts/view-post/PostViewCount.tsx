import { ComponentProps } from 'react'
import { FaRegEye } from 'react-icons/fa'
import { IconWithLabel } from 'src/components/utils'
import { usePostViewCount } from 'src/rtk/app/hooks'

export default function PostViewCount({
  postId,
  ...props
}: { postId: string } & ComponentProps<'div'>) {
  const viewCount = usePostViewCount(postId)

  return (
    <div {...props} className={props.className}>
      <IconWithLabel renderZeroCount icon={<FaRegEye />} count={viewCount} />
    </div>
  )
}
