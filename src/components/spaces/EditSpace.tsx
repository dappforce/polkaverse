import { MailOutlined } from '@ant-design/icons'
import { Form, Input, Select } from 'antd'
import clsx from 'clsx'
import capitalize from 'lodash/capitalize'
import { useEffect, useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import messages from 'src/messages'
import { WriteAccessRequired } from 'src/moderation'
import { useCreateReloadProfile, useCreateReloadSpaceIdsForMyAccount } from 'src/rtk/app/hooks'
import { DataSourceTypes, IpfsCid, SpaceContent, SpaceData } from 'src/types'
import { useAmIBlocked, useMyAddress, useMyEmailAddress } from '../auth/MyAccountsContext'
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
import styles from './EditSpace.module.sass'
import { BuiltInRole, getWhoCanPost } from './permissions/utils'
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
import { useRouter } from 'next/router'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { useAppSelector } from '../../rtk/app/store'
import { selectSpaceIdsByOwner } from '../../rtk/features/spaceIds/ownSpaceIdsSlice'
import SpacePermissionInfoSection from './permissions/SpacePermissionInfoSection'

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

type FormProps = CanHaveSpaceProps &
  ValidationProps & {
    asProfile?: boolean
  }

function getInitialValues({ space }: FormProps): FormValues {
  if (space) {
    const { struct, content } = space
    const whoCanPost = getWhoCanPost(struct)
    return { ...content, whoCanPost }
  }
  return {}
}

function getFormActionLabel(space: SpaceData | undefined, asProfile?: boolean) {
  const actionLabel = space ? 'Update' : 'Create new'
  const entityLabel = asProfile ? 'profile' : 'space'
  const fullActionLabel = `${actionLabel} ${entityLabel}`
  return {
    actionLabel,
    entityLabel,
    fullActionLabel,
  }
}

export function InnerForm(props: FormProps) {
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const myAddress = useMyAddress()
  const myEmailAddress = useMyEmailAddress()

  useEffect(() => {
    if (myEmailAddress) {
      form.setFieldsValue({ email: myEmailAddress })
    }
  }, [myEmailAddress])

  const isEmailReady = !!myEmailAddress

  const [ipfsCid, setIpfsCid] = useState<IpfsCid>()
  const reloadMySpaceIds = useCreateReloadSpaceIdsForMyAccount()
  const reloadMyProfile = useCreateReloadProfile()
  const ownSpaceIds: string[] = useAppSelector(
    state => selectSpaceIdsByOwner(state, myAddress || '') || [],
  )

  const { space, asProfile } = props

  const initialValues = getInitialValues(props)
  const tags = initialValues.tags || []
  const links = initialValues.links

  const blocked = useAmIBlocked()

  // Auto save a space's about only if we are on a "New Space" form.
  const autoSaveId: AutoSaveId | undefined = !space ? 'space' : undefined

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged(): IpfsCid | undefined {
      const prevCid = space?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!space) {
      if (asProfile) {
        return [IpfsContent(cid)]
      }
      return [IpfsContent(cid), null]
    } else {
      return [
        space.struct.id,
        {
          content: OptionIpfsContent(getCidIfChanged()),
        },
      ]
    }
  }

  const fieldValuesToContent = (): Content => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { whoCanPost, ...spaceContent } = getFieldValues()

    const content = { ...(space?.content || {}), ...spaceContent }

    return getNonEmptySpaceContent(content as Content)
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
    const prevCid = space?.struct.contentId
    prevCid && ipfs.removeContent(prevCid).catch(err => new Error(err))

    clearAutoSavedContent('space')
    const id = space?.struct.id || getNewIdFromEvent(txResult)?.toString()
    if (props.asProfile) {
      reloadMyProfile({ id: myAddress ?? '', dataSource: DataSourceTypes.CHAIN })
    }
    if (id) {
      goToSpacePage(id, !props.asProfile && isEmptyArray(ownSpaceIds) && !space)
      reloadMySpaceIds()
    }
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  const { entityLabel, fullActionLabel } = getFormActionLabel(space, asProfile)

  let extrinsic = space ? 'spaces.updateSpace' : 'spaces.createSpace'
  if (!space && asProfile) {
    extrinsic = 'profiles.createSpaceAsProfile'
  }

  return (
    <>
      <DfForm
        form={form}
        validateTrigger={['onBlur']}
        className={styles.EditForm}
        initialValues={initialValues}
      >
        <Form.Item
          name={fieldName('image')}
          label='Avatar'
          help={messages.imageShouldBeLessThanTwoMB}
        >
          <UploadAvatar onChange={onAvatarChanged} img={initialValues.image} />
        </Form.Item>

        <Form.Item
          name={fieldName('name')}
          label={`${capitalize(entityLabel)} name`}
          hasFeedback
          rules={[
            { required: true, message: 'Name is required.' },
            { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
            { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) },
          ]}
        >
          <Input placeholder={`Name of your ${entityLabel}`} />
        </Form.Item>

        {space && (
          <Form.Item label='Who can post?'>
            <SpacePermissionInfoSection
              spaceId={space.struct.id}
              className={styles.SpacePermissions}
            />
          </Form.Item>
        )}

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
          <Input
            className={clsx('', isEmailReady && styles.EmailText)}
            disabled={isEmailReady}
            bordered={!isEmailReady}
            type='email'
            placeholder='Email address'
          />
        </Form.Item>

        <NewSocialLinks name='links' links={links} collapsed={!links} />

        <DfFormButtons
          form={form}
          txProps={{
            label: fullActionLabel,
            tx: extrinsic,
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
  const { space, asProfile } = props
  const { fullActionLabel } = getFormActionLabel(space, asProfile)

  return (
    <PageContent meta={{ title: fullActionLabel }}>
      <Section className='EditEntityBox' title={fullActionLabel}>
        <WriteAccessRequired>
          <InnerForm {...props} {...consts} />
        </WriteAccessRequired>
      </Section>
    </PageContent>
  )
}

const CannotEditSpace = <NoData description='You do not have permission to edit this space' />

const LoadSpaceThenEdit = withLoadSpaceFromUrl(FormInSection)

function useIsEditAsProfile() {
  const { query } = useRouter()
  return query['as-profile'] === 'true'
}

export function EditSpace(props: FormProps) {
  const myAddress = useMyAddress()
  const asProfile = useIsEditAsProfile()

  const checkSpacePermission: CheckSpacePermissionFn = space => {
    const isOwner = space && equalAddresses(myAddress, space.struct.ownerId)
    return {
      ok: isOwner,
      error: () => CannotEditSpace,
    }
  }

  return (
    <LoadSpaceThenEdit
      {...props}
      asProfile={asProfile}
      checkSpacePermission={checkSpacePermission}
    />
  )
}

export const NewSpace = () => {
  const asProfile = useIsEditAsProfile()
  return <FormInSection asProfile={asProfile} />
}

export default NewSpace
