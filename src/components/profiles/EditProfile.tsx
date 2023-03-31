import { IpfsContent, OptionIpfsContent } from '@subsocial/api/substrate/wrappers'
import { newLogger } from '@subsocial/utils'
import { Form, Input } from 'antd'
import Router from 'next/router'
import { useEffect, useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { TxCallback, TxFailedCallback } from 'src/components/substrate/SubstrateTxButton'
import { DESC_MAX_LEN, NAME_MAX_LEN, NAME_MIN_LEN } from 'src/config/ValidationsConfig'
import messages from 'src/messages'
import { AnyAccountId, IpfsCid, SpaceContent, SpaceData } from 'src/types'
import { DfForm, DfFormButtons, maxLenError, minLenError } from '../forms'
import { PageContent } from '../main/PageWrapper'
import { getTxParams } from '../substrate'
import { UploadAvatar } from '../uploader'
import { accountUrl } from '../urls'
import DfMdEditor from '../utils/DfMdEditor'
import { clearAutoSavedContent } from '../utils/DfMdEditor/client'
import { AutoSaveId } from '../utils/DfMdEditor/types'
import Section from '../utils/Section'
import { withMyProfile } from './address-views/utils/withLoadedOwner'

const log = newLogger('EditProfile')

type Content = SpaceContent

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name

type FormProps = {
  address: AnyAccountId
  owner?: SpaceData
}

function getInitialValues({ owner }: FormProps): FormValues {
  if (owner) {
    const { content } = owner
    return { ...content }
  }
  return {}
}

export function InnerForm(props: FormProps) {
  const [form] = Form.useForm()
  const { ipfs } = useSubsocialApi()
  const [IpfsCid, setIpfsCid] = useState<IpfsCid>()

  const { owner, address } = props
  const hasProfile = !!owner?.struct === true
  const initialValues = getInitialValues(props)

  useEffect(() => {
    form.setFields(Object.entries(initialValues).map(([name, value]) => ({ name, value })))
  }, [hasProfile])

  // Auto save a profile's about only if we are on a "New Profile" form.
  const autoSaveId: AutoSaveId | undefined = !hasProfile ? 'profile' : undefined

  const getFieldValues = (): FormValues => {
    return form.getFieldsValue() as FormValues
  }

  const newTxParams = (cid: IpfsCid) => {
    // const fieldValues = getFieldValues()

    // /** Returns `undefined` if value hasn't been changed. */
    // function getValueIfChanged (field: FieldName): any | undefined {
    //   return form.isFieldTouched(field) ? fieldValues[field] as any : undefined
    // }

    /** Returns `undefined` if CID hasn't been changed. */
    function getCidIfChanged(): IpfsCid | undefined {
      const prevCid = owner?.struct.contentId
      return prevCid !== cid.toString() ? cid : undefined
    }

    if (!hasProfile) {
      // If creating a new profile.
      return [IpfsContent(cid)]
    } else {
      // If updating the existing profile.

      const update = {
        content: OptionIpfsContent(getCidIfChanged()),
      }

      return [update]
    }
  }

  const fieldValuesToContent = (): Content => {
    return getFieldValues() as Content
  }

  const pinToIpfsAndBuildTxParams = () =>
    getTxParams({
      json: fieldValuesToContent(),
      buildTxParamsCallback: newTxParams,
      setIpfsCid,
      ipfs,
    })

  const goToProfilePage = () => {
    if (address) {
      Router.push('/accounts/[address]', accountUrl({ address })).catch(err =>
        log.error('Failed to redirect to "View Account" page:', err),
      )
    }
  }

  const onFailed: TxFailedCallback = () => {
    IpfsCid && ipfs.unpinContentFromIpfs(IpfsCid).catch(err => new Error(err))
  }

  const onSuccess: TxCallback = () => {
    clearAutoSavedContent('profile')
    goToProfilePage()
  }

  const onDescChanged = (mdText: string) => {
    form.setFieldsValue({ [fieldName('about')]: mdText })
  }

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  return (
    <>
      <DfForm form={form} initialValues={initialValues}>
        <Form.Item
          name={fieldName('image')}
          label='Avatar'
          help={messages.imageShouldBeLessThanTwoMB}
        >
          <UploadAvatar onChange={onAvatarChanged} img={initialValues.image} />
        </Form.Item>

        <Form.Item
          name={fieldName('name')}
          label='Profile name'
          hasFeedback
          rules={[
            // { required: true, message: 'Name is required.' },
            { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
            { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) },
          ]}
        >
          <Input placeholder='Full name or nickname' />
        </Form.Item>

        <Form.Item
          name={fieldName('about')}
          label='About'
          hasFeedback
          rules={[{ max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }]}
        >
          <DfMdEditor autoSaveId={autoSaveId} onChange={onDescChanged} />
        </Form.Item>

        <DfFormButtons
          form={form}
          txProps={{
            label: hasProfile ? 'Update profile' : 'Create new profile',
            tx: hasProfile ? 'profiles.updateProfile' : 'profiles.createProfile',
            params: pinToIpfsAndBuildTxParams,
            onSuccess,
            onFailed,
          }}
        />
      </DfForm>
    </>
  )
}

// function bnToNum (bn: Codec, _default: number): number {
//   return bn ? (bn as unknown as BN).toNumber() : _default
// }

export function FormInSection(props: FormProps) {
  const { owner } = props
  const title = !!owner?.struct ? 'Edit profile' : 'New profile'

  return (
    <PageContent meta={{ title }}>
      <Section className='EditEntityBox' title={title}>
        <InnerForm {...props} />
      </Section>
    </PageContent>
  )
}

export const EditProfile = withMyProfile(FormInSection)

export const NewProfile = withMyProfile(FormInSection)

export default NewProfile
