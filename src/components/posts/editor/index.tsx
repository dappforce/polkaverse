import { IpfsContent, PostUpdate } from '@subsocial/api/substrate/wrappers'
import { newLogger } from '@subsocial/utils'
import { getPostIdFromSlug } from '@subsocial/utils/slugify'
import { Button, Form } from 'antd'
import BN from 'bn.js'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { useAmIBlocked, useIsMyAddress } from 'src/components/auth/MyAccountsContext'
import { PageContent } from 'src/components/main/PageWrapper'
import { CanHaveSpaceProps, withLoadSpaceFromUrl } from 'src/components/spaces/withLoadSpaceFromUrl'
import { getNewIdFromEvent, getTxParams } from 'src/components/substrate'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { postUrl } from 'src/components/urls'
import { Loading } from 'src/components/utils'
import { getNonEmptyPostContent } from 'src/components/utils/content'
import NoData from 'src/components/utils/EmptyList'
import config from 'src/config'
import { WriteAccessRequired } from 'src/moderation'
import {
  useCreateCheckSpacePermission,
  useHasUserASpacePermission,
} from 'src/permissions/checkPermission'
import { AnyId, idToBn, IpfsCid, PostContent, PostData } from 'src/types'
import { PostNotFound } from '../view-post'
import { FormValues } from './Fileds'
import styles from './index.module.sass'
import { useAutoSaveFromForm } from './utils'

const FullEditor = dynamic(import('./FullEditor'), { ssr: false })
const log = newLogger('EditPost')

export type PostType = 'article' | 'link'

type PostFormProps = CanHaveSpaceProps & {
  autofocus: boolean
  post?: PostData
  /** Spaces where you can post. */
  spaceIds?: BN[]
  postType?: PostType
}

function getInitialValues({ space, post }: PostFormProps): FormValues {
  if (space && post) {
    const spaceId = space.struct.id.toString()
    return { ...post.content, spaceId }
  }
  return {}
}

export const RegularPostExt = { RegularPost: null }

function EditPostForm(props: PostFormProps) {
  const router = useRouter()
  const { space: initialSpace, post, postType } = props
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [IpfsCid, setIpfsCid] = useState<IpfsCid>()
  const blocked = useAmIBlocked()

  const { savedData, clearDraft } = useAutoSaveFromForm({ entity: 'post' })
  const { image, title, body } = router.query
  if (typeof image === 'string' && image.startsWith(config.ipfsNodeUrl)) {
    savedData.image = image
  }
  if (typeof title === 'string') {
    savedData.title = title
  }
  if (typeof body === 'string') {
    savedData.body = body
  }

  const initialValues = post ? getInitialValues(props) : savedData
  const [spaceForPost, setSpaceForPost] = useState<string | undefined>(initialSpace?.struct.id)

  const spaceId = spaceForPost

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    if (!post) {
      // If creating a new post.
      return [spaceId, RegularPostExt, IpfsContent(cid)]
    } else {
      // If updating the existing post.
      const update = PostUpdate({
        // If we provide a new space_id in update, it will move this post to another space.
        content: cid.toString(),
      })

      return [post.struct.id, update]
    }
  }

  const fieldValuesToContent = (): PostContent => {
    const { body: htmlBody, ...fields } = getFieldValues()
    const body = htmlBody || undefined
    return getNonEmptyPostContent({ ...fields, body } as PostContent)
  }

  const pinToIpfsAndBuildTxParams = () => {
    return getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs,
    })
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.removeContent(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = txResult => {
    const prevCid = post?.struct.contentId
    prevCid && ipfs.removeContent(prevCid).catch(err => new Error(err))

    clearDraft()
    const id = post?.struct.id || getNewIdFromEvent(txResult)?.toString()
    if (id) {
      goToPostPage(id)
    }
  }

  const goToPostPage = (postId: AnyId) => {
    const content = getFieldValues() as PostContent
    const postData = { struct: { id: postId.toString() }, content }

    const url = postUrl({ id: spaceForPost! }, postData)
    router
      .push('/[spaceId]/[slug]', url)
      .catch(err => log.error(`Failed to redirect to a post page. ${err}`))
  }

  return (
    <FullEditor
      form={form}
      txProps={{
        label: post ? 'Update' : 'Publish',
        tx: post ? 'posts.updatePost' : 'posts.createPost',
        params: pinToIpfsAndBuildTxParams,
        onSuccess,
        onFailed,
        disabled: blocked,
      }}
      setSpaceForPost={setSpaceForPost}
      initialValues={initialValues}
      postType={postType}
      spaceForPost={spaceId}
    />
  )
}

const getPostTypeByContent = (content?: PostContent): PostType | undefined => {
  if (content?.link) return 'link'

  if (content?.image) return 'article'

  return undefined
}

export function FormInSection(props: PostFormProps) {
  const { space, post } = props
  const canWritePost = useHasUserASpacePermission({
    space: space?.struct,
    permission: 'CreatePosts',
  })

  if (space && !canWritePost)
    return <NoData description='You have no permission to create posts in this space' />

  const isNewPost = !post
  const postType = getPostTypeByContent(post?.content)
  const pageTitle = isNewPost ? 'New post' : 'Edit post'

  const form = isNewPost ? (
    <EditPostForm {...props} />
  ) : (
    <EditPostForm {...props} postType={postType} />
  )

  return (
    <PageContent
      outerClassName={styles.SectionOverride}
      className='pb-5'
      meta={{ title: pageTitle }}
    >
      <WriteAccessRequired>{form}</WriteAccessRequired>
    </PageContent>
  )
}

function LoadPostThenEdit(props: PostFormProps) {
  const { space } = props
  const { slug } = useRouter().query
  const postId = slug ? getPostIdFromSlug(slug as string) : undefined
  const [isLoaded, setIsLoaded] = useState(false)
  const [post, setPost] = useState<PostData>()

  const checkPermission = useCreateCheckSpacePermission({ space: space?.struct })
  const isMyPost = useIsMyAddress(post?.struct.ownerId)

  const canEditPost = post?.struct.isComment
    ? isMyPost && checkPermission('UpdateOwnComments')
    : (isMyPost && checkPermission('UpdateOwnPosts')) || checkPermission('UpdateAnyPost')

  useSubsocialEffect(
    ({ subsocial }) => {
      if (!postId) return

      let isMounted = true

      const load = async () => {
        setIsLoaded(false)
        const res = await subsocial.findPost({ id: idToBn(postId) })
        if (isMounted) {
          setPost(res)
          setIsLoaded(true)
        }
      }

      load()

      return () => {
        isMounted = false
      }
    },
    [postId?.toString()],
  )

  if (!postId) return <NoData description='Post id not found in URL' />

  if (!isLoaded) return <Loading label='Loading the post...' />

  if (!post) return <PostNotFound />

  if (!canEditPost)
    return (
      <div className='d-flex flex-column align-items-center'>
        <NoData description='You do not have permission to edit this post' />
        <Button href={postUrl(space, post)}>Go to post</Button>
      </div>
    )

  return <FormInSection {...props} post={post} />
}

export const EditPost = withLoadSpaceFromUrl(LoadPostThenEdit)

export const NewPost = withLoadSpaceFromUrl(FormInSection)

export default EditPost
