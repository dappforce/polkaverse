import { MailOutlined } from '@ant-design/icons'
import { Form, Input, Select } from 'antd'
import { useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import messages from 'src/messages'
import { WriteAccessRequired } from 'src/moderation'
import { useCreateReloadSpaceIdsForMyAccount } from 'src/rtk/app/hooks'
import { IpfsCid, SpaceContent } from 'src/types'
import { useAmIBlocked, useMyAddress } from '../auth/MyAccountsContext'
import { DfForm, DfFormButtons, maxLenError, minLenError } from '../forms'
import { PageContent } from '../main/PageWrapper'
import { UploadAvatar } from '../uploader'
import { goToSpacePage } from '../urls/goToPage'
import { getNonEmptySpaceContent } from '../utils/content'
import DfMdEditor from '../utils/DfMdEditor'
import { clearAutoSavedContent } from '../utils/DfMdEditor/client'
import { AutoSaveId } from '../utils/DfMdEditor/types'
import NoData from '../utils/EmptyList'
import Section from '../utils/Section'
import { newWritePermission } from './permissions/space-permissions'
import { BuiltInRole, getWhoCanPost } from './permissions/utils'
import { WhoCanPostSelector } from './permissions/WhoCanPostSelector'
import { NewSocialLinks } from './SocialLinks/NewSocialLinks'

import {
  CanHaveSpaceProps,
  CheckSpacePermissionFn,
  withLoadSpaceFromUrl,
} from './withLoadSpaceFromUrl'

import {
  DESC_MAX_LEN,
  MAX_HANDLE_LEN,
  MIN_HANDLE_LEN,
  NAME_MAX_LEN,
  NAME_MIN_LEN,
} from 'src/config/ValidationsConfig'

import { equalAddresses, getNewIdFromEvent, getTxParams } from '../substrate'

import { IpfsContent, OptionIpfsContent } from '@subsocial/api/substrate/wrappers'
import { isEmptyArray } from '@subsocial/utils'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { useAppSelector } from '../../rtk/app/store'
import { selectSpaceIdsByOwner } from '../../rtk/features/spaceIds/ownSpaceIdsSlice'

const MAX_TAGS = 10

type Content = SpaceContent

type FormValues = Partial<
  Content & {
    whoCanPost: BuiltInRole
  }
>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type ValidationProps = {
  minHandleLen: number
  maxHandleLen: number
}

type FormProps = CanHaveSpaceProps & ValidationProps

function getInitialValues({ space }: FormProps): FormValues {
  if (space) {
    const { struct, content } = space
    const whoCanPost = getWhoCanPost(struct)
    return { ...content, whoCanPost }
  }
  return {}
}

export function InnerForm(props: FormProps) {
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const address = useMyAddress()

  const [ipfsCid, setIpfsCid] = useState<IpfsCid>()
  const reloadMySpaceIds = useCreateReloadSpaceIdsForMyAccount()
  const ownSpaceIds: string[] = useAppSelector(
    state => selectSpaceIdsByOwner(state, address || '') || [],
  )

  const { space } = props

  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []
  const links = initialValues.links

  const [whoCanPostHint, setWhoCanPostHint] = useState(
    messages.formHints.whoCanPost[initialValues.whoCanPost!],
  )
  const blocked = useAmIBlocked()

  const changeWhoCanPost = (field: BuiltInRole) =>
    setWhoCanPostHint(messages.formHints.whoCanPost[field])

  // Auto save a space's about only if we are on a "New Space" form.
  const autoSaveId: AutoSaveId | undefined = !space ? 'space' : undefined

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    const fieldValues = getFieldValues()

    /** Returns `undefined` if value hasn't been changed. */
    function getValueIfChanged(field: FieldName): any | undefined {
      return form.isFieldTouched(field) ? (fieldValues[field] as any) : undefined
    }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged(): IpfsCid | undefined {
      const prevCid = space?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    const permissions = newWritePermission(
      getValueIfChanged('whoCanPost'),
      initialValues['whoCanPost'],
    )

    if (!space) {
      return [IpfsContent(cid), permissions]
    } else {
      return [
        space.struct.id,
        {
          content: OptionIpfsContent(getCidIfChanged()),
          permissions,
        },
      ]
    }
  }

  const fieldValuesToContent = (): Content => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { whoCanPost, ...spaceContent } = getFieldValues()
    return getNonEmptySpaceContent(spaceContent as Content)
  }

  const pinToIpfsAndBuildTxParams = () =>
    getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs,
    })

  const onFailed: TxFailedCallback = () => {
    ipfsCid && ipfs.removeContent(ipfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = txResult => {
    clearAutoSavedContent('space')
    const id = space?.struct.id || getNewIdFromEvent(txResult)?.toString()
    if (id) {
      goToSpacePage(id, isEmptyArray(ownSpaceIds) && !space)
      reloadMySpaceIds()
    }
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  return (
    <>
      <DfForm form={form} validateTrigger={['onBlur']} initialValues={initialValues}>
        <Form.Item
          name={fieldName('image')}
          label='Avatar'
          help={messages.imageShouldBeLessThanTwoMB}
        >
          <UploadAvatar onChange={onAvatarChanged} img={initialValues.image} />
        </Form.Item>

        <Form.Item
          name={fieldName('name')}
          label='Space name'
          hasFeedback
          rules={[
            { required: true, message: 'Name is required.' },
            { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
            { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) },
          ]}
        >
          <Input placeholder='Name of your space' />
        </Form.Item>

        <Form.Item name={fieldName('whoCanPost')} label='Who can post?' help={whoCanPostHint}>
          <WhoCanPostSelector space={space?.struct} onChange={changeWhoCanPost} />
        </Form.Item>

        <Form.Item
          name={fieldName('about')}
          label='Description'
          hasFeedback
          rules={[
            {
              max: DESC_MAX_LEN,
              message: maxLenError('Description', DESC_MAX_LEN),
            },
          ]}
        >
          <DfMdEditor autoSaveId={autoSaveId} onChange={onDescChanged} />
        </Form.Item>

        <Form.Item
          name={fieldName('tags')}
          label='Tags'
          hasFeedback
          rules={[
            {
              type: 'array',
              max: MAX_TAGS,
              message: `You can add up to ${MAX_TAGS} tags.`,
            },
          ]}
        >
          <Select mode='tags' placeholder="Press 'Enter' or 'Tab' key to add tags">
            {tags.map((tag, i) => (
              <Select.Option key={i} value={tag}>
                {tag}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name={fieldName('email')}
          label={
            <span>
              <MailOutlined /> Email address
            </span>
          }
          rules={[{ pattern: /\S+@\S+\.\S+/, message: 'Should be a valid email' }]}
        >
          <Input type='email' placeholder='Email address' />
        </Form.Item>

        <NewSocialLinks name='links' links={links} collapsed={!links} />

        <DfFormButtons
          form={form}
          txProps={{
            label: space ? 'Update space' : 'Create new space',
            tx: space ? 'spaces.updateSpace' : 'spaces.createSpace',
            params: pinToIpfsAndBuildTxParams,
            onSuccess,
            onFailed,
            disabled: blocked,
          }}
        />
      </DfForm>
    </>
  )
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection(props: Partial<FormProps>) {
  const [consts] = useState<ValidationProps>({
    minHandleLen: MIN_HANDLE_LEN, // bnToNum(api.consts.spaces.minHandleLen, 5),
    maxHandleLen: MAX_HANDLE_LEN, // bnToNum(api.consts.spaces.maxHandleLen, 50)
  })
  const { space } = props
  const title = space ? 'Edit space' : 'New space'

  return (
    <PageContent meta={{ title }}>
      <Section className='EditEntityBox' title={title}>
        <WriteAccessRequired>
          <InnerForm {...props} {...consts} />
        </WriteAccessRequired>
      </Section>
    </PageContent>
  )
}

const CannotEditSpace = <NoData description='You do not have permission to edit this space' />

const LoadSpaceThenEdit = withLoadSpaceFromUrl(FormInSection)

export function EditSpace(props: FormProps) {
  const myAddress = useMyAddress()

  const checkSpacePermission: CheckSpacePermissionFn = space => {
    const isOwner = space && equalAddresses(myAddress, space.struct.ownerId)
    return {
      ok: isOwner,
      error: () => CannotEditSpace,
    }
  }

  return <LoadSpaceThenEdit {...props} checkSpacePermission={checkSpacePermission} />
}

export const NewSpace = FormInSection

export default NewSpace
