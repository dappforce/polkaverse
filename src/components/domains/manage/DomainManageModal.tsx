import { RightOutlined } from '@ant-design/icons'
import { Button, ButtonProps, Form, Input, Modal, Row } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { LabeledValue } from 'antd/lib/select'
import clsx from 'clsx'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { twitterShareUrl } from 'src/components/urls'
import { Copy, ShareLink } from 'src/components/urls/helpers'
import NoData from 'src/components/utils/EmptyList'
import { TextWithEmoji } from 'src/components/utils/TextWithEmoji'
import config from 'src/config'
import { DomainEntity, fetchDomains } from 'src/rtk/features/domains/domainsSlice'
import { useAppDispatch, useAppSelector } from '../../../rtk/app/store'
import { useFetchDomain } from '../../../rtk/features/domains/domainHooks'
import { selectSpaceIdsByOwner } from '../../../rtk/features/spaceIds/ownSpaceIdsSlice'
import { useMyAddress } from '../../auth/MyAccountsContext'
import useSubstrate from '../../substrate/useSubstrate'
import { Loading } from '../../utils'
import { ButtonLink } from '../../utils/CustomLinks'
import { MutedDiv } from '../../utils/MutedText'
import SelectSpacePreview from '../../utils/SelectSpacePreview'
import TxButton from '../../utils/TxButton'
import styles from '../index.module.sass'
import { cutResolvedDomain } from '../utils'
import { MenuSteps, useManageDomainContext } from './ManageDomainProvider'

// type ManageDomainProps = {
//   domainStruct: DomainEntity
// }
//
// const useTimeByBlock = (blockNumber?: string) => {
//   const { api, isApiReady } = useSubstrate()
//   const [time, setTime] = useState<number>()
//
//   useEffect(() => {
//     if (!isApiReady || !blockNumber) return
//     ;(async () => {
//       const blockTime = api.consts.timestamp?.minimumPeriod.muln(2).toNumber()
//       const currentTimestamp = await api.query.timestamp.now()
//       const block = await api.rpc.chain.getBlock()
//
//       const lastBlockNumber = block.block.header.number.unwrap()
//       const time = currentTimestamp.add(new BN(blockNumber).sub(lastBlockNumber).muln(blockTime))
//
//       setTime(time.toNumber())
//     })()
//   }, [isApiReady, blockNumber])
//
//   return time
// }

// const DomainExpireAt = ({ domainStruct }: ManageDomainProps) => {
//   const expireAt = domainStruct?.expiresAt
//   const time = useTimeByBlock(expireAt)
//   const dataPart = time ? `${SubDate.formatDate(time)}` : undefined
//
//   if (!expireAt) return null
//
//   return (
//     <Row justify='center'>
//       <MutedDiv>{`It expires ${dataPart} (at block ${expireAt}).`}</MutedDiv>
//     </Row>
//   )
// }

type ManageDomainStepProps = {
  domainStruct: DomainEntity
}

const ManageDomainMenu: FC<ManageDomainStepProps> = ({ domainStruct }) => {
  const { openManageModal } = useManageDomainContext()
  if (!domainStruct) return <NoData />

  return (
    <>
      <Row justify='center'>
        <div className={clsx('SubsocialGradient', styles.MenuModalDomainTitle)}>
          {domainStruct.id}
        </div>
      </Row>
      {/*<DomainExpireAt domainStruct={domainStruct} />*/}
      <div className='mt-3 mb-2'>You can use your domain as:</div>
      <ChooseStep title='Username on Sub.ID' action={() => openManageModal('subid')} />
      <ChooseStep title='Username for your space' action={() => openManageModal('inner')} />
      <ChooseStep title='Alias for your site' action={() => openManageModal('outer')} />
    </>
  )
}

type ChooseStepProps = {
  title: string
  action: VoidFunction
}

const ChooseStep = ({ title, action }: ChooseStepProps) => {
  return (
    <div onClick={action} className={styles.ChooseStep}>
      <RightOutlined className='mr-3' />
      {title}
    </div>
  )
}

const ActionButton = ({ children, ...props }: ButtonProps) => {
  return (
    <Button size='large' type='primary' className='w-100' {...props}>
      {children}
    </Button>
  )
}

const UsernameOnSubId: FC<ManageDomainStepProps> = ({ domainStruct }) => {
  const { openManageModal } = useManageDomainContext()

  const subIdLink = 'https://sub.id/'
  const truncatedDomain = cutResolvedDomain(domainStruct?.id)

  return (
    <>
      <div className={clsx(styles.ModalTitle)}>Use as a username on Sub.ID</div>
      <MutedDiv>
        Sub.ID supports Subsocial Usernames, allowing you to use your domain as a username. You can
        see the full link below, which will go to your Sub.ID page.
      </MutedDiv>
      <Copy text={`${subIdLink}${truncatedDomain}`} message='Your Sub.ID link copied'>
        <Row justify='center' className={styles.ModalLink}>
          <MutedDiv>{subIdLink}</MutedDiv>
          <div className={clsx('SubsocialGradient')}>{truncatedDomain}</div>
        </Row>
      </Copy>
      <div
        className='mt-3 GapSmall justify-content-center'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <ActionButton ghost onClick={() => openManageModal('menu')}>
          Back
        </ActionButton>
        <Copy text={`${subIdLink}${domainStruct?.id}`} message='Your SubId link copied'>
          <ActionButton>Copy</ActionButton>
        </Copy>
      </div>
    </>
  )
}

const SpaceUsername: FC<ManageDomainStepProps> = ({ domainStruct }) => {
  const { openManageModal } = useManageDomainContext()
  const { api, subsocial } = useSubstrate()
  const dispatch = useAppDispatch()
  const myAddress = useMyAddress()
  const mySpaceIds =
    useAppSelector(state => selectSpaceIdsByOwner(state, myAddress as string)) || []

  const defaultInnerSpace = domainStruct?.innerSpace?.toString()

  const [innerValue, setInnerValue] = useState<string | undefined>(defaultInnerSpace)
  useEffect(() => {
    if (mySpaceIds.length > 0)
      setInnerValue(prev => {
        if (prev) return prev
        return mySpaceIds?.[0]
      })
  }, [mySpaceIds])

  const domain = domainStruct.id

  const innerSpaceHandler = (id?: string | number | LabeledValue) => {
    const labeledValue = id as LabeledValue
    setInnerValue(labeledValue.value.toString())
  }

  const onSuccess = () => {
    dispatch(fetchDomains({ ids: [domain], reload: true, api: subsocial }))
  }

  const getTxParams = () => [domain, { Space: innerValue }]

  const SelectSpaceInput = useCallback(() => {
    return !!mySpaceIds.length ? (
      <SelectSpacePreview
        className={'w-100'}
        spaceIds={mySpaceIds}
        onSelect={innerSpaceHandler}
        defaultValue={defaultInnerSpace}
        imageSize={24}
      />
    ) : (
      <ButtonLink
        size='large'
        style={{ width: '576px' }}
        block
        type='primary'
        ghost
        href='/spaces/new'
        as='/spaces/new'
      >
        Create the first space to use domains inside the {config.appName}
      </ButtonLink>
    )
  }, [defaultInnerSpace, !!mySpaceIds.length])

  const basePart = `${config.appBaseUrl}/@`
  const truncatedDomain = cutResolvedDomain(domain)

  return (
    <>
      <div className={clsx(styles.ModalTitle)}>Use as a username for your space</div>
      <MutedDiv className='mb-3'>
        {config.appName} supports Subsocial Usernames, allowing you to use your domain as a
        username. You can see the full link below.
      </MutedDiv>
      <Row justify='center'>
        <SelectSpaceInput />
      </Row>
      <Copy text={`${basePart}${truncatedDomain}`} message='Your new space link copied'>
        <Row justify='center' className={styles.ModalLink}>
          <MutedDiv>{basePart}</MutedDiv>
          <div className={clsx('SubsocialGradient')}>{truncatedDomain}</div>
        </Row>
      </Copy>
      <div
        className='mt-3 GapSmall justify-content-center'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <ActionButton ghost onClick={() => openManageModal('menu')}>
          Back
        </ActionButton>
        <TxButton
          canUseProxy={false}
          tx='domains.setInnerValue'
          size='large'
          type='primary'
          params={getTxParams}
          customNodeApi={api}
          disabled={!!defaultInnerSpace && defaultInnerSpace === innerValue}
          label='Save'
          successMessage='Username for your space updated'
          onSuccess={onSuccess}
        />
      </div>
    </>
  )
}

const SiteAlias: FC<ManageDomainStepProps> = ({ domainStruct }) => {
  const { openManageModal } = useManageDomainContext()
  const [form] = useForm()
  const dispatch = useAppDispatch()
  const { api, subsocial } = useSubstrate()
  const domain = domainStruct.id

  const defaultOuterValue = domainStruct?.outerValue

  const outerLinkName = 'outerLink'
  const [outerLink, setOuterLink] = useState<string | undefined>(defaultOuterValue)

  const getTxParams = () => [domain, outerLink]

  const initialValue = {
    outerLink: defaultOuterValue,
  }

  useEffect(() => {
    form.setFields([{ name: outerLinkName, value: defaultOuterValue }])
  }, [domain, defaultOuterValue])

  const outerLinkHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOuterLink(e.target.value)
  }

  const onSuccess = () => {
    dispatch(fetchDomains({ ids: [domain], reload: true, api: subsocial }))
  }

  const OuterLinkInput = useCallback(() => {
    return (
      <Form.Item
        name={outerLinkName}
        rules={[{ type: 'url', message: 'Url is not valid' }]}
        className='m-0'
      >
        <Input
          type='url'
          size='large'
          onChange={outerLinkHandler}
          placeholder='Optional: Enter the your redirect link here'
        />
      </Form.Item>
    )
  }, [])

  const basePart = '.sub.id'
  const truncatedDomain = cutResolvedDomain(domain)

  return (
    <>
      <div className={clsx(styles.ModalTitle)}>Use as an alias for your site</div>
      <MutedDiv className='mb-3'>
        You can set your domain to redirect to any site you wish. Just enter the URL of the page you
        want to redirect to.
      </MutedDiv>
      <Form form={form} layout='vertical' initialValues={initialValue}>
        <OuterLinkInput />
      </Form>
      <Copy text={`http://${truncatedDomain}${basePart}`} message='Alias for your site copied'>
        <Row justify='center' className={styles.ModalLink}>
          <div className={clsx('SubsocialGradient')}>{truncatedDomain}</div>
          <MutedDiv>{'.sub.id'}</MutedDiv>
        </Row>
      </Copy>
      <div
        className='mt-3 GapSmall justify-content-center'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <ActionButton ghost onClick={() => openManageModal('menu')}>
          Back
        </ActionButton>
        <TxButton
          canUseProxy={false}
          tx='domains.setOuterValue'
          size='large'
          type='primary'
          params={getTxParams}
          customNodeApi={api}
          disabled={defaultOuterValue === outerLink}
          label='Save'
          successMessage='Alias for your site updated'
          onSuccess={onSuccess}
        />
      </div>
    </>
  )
}

const Success: FC<ManageDomainStepProps> = ({ domainStruct }) => {
  const { openManageModal } = useManageDomainContext()
  const domain = domainStruct.id

  return (
    <>
      <Row justify='center' align='middle'>
        <TextWithEmoji
          emoji='🎉'
          text='Your domain is registered!'
          className={clsx(styles.ModalTitle)}
        />
        <MutedDiv className={styles.ModalSubtitle}>
          Your profile is ready to use, and you can edit it at any time.
        </MutedDiv>
      </Row>
      <Row justify='center'>
        <div className={clsx('SubsocialGradient', styles.ModalDomainTitle)}>{domain}</div>
      </Row>
      <div
        className='mt-3 GapSmall justify-content-center'
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          maxWidth: '420px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <ActionButton type='default' onClick={() => openManageModal('menu')}>
          What is next?
        </ActionButton>
        <ShareLink
          url={twitterShareUrl(
            '/dd',
            `I just registered ${domain} through Subsocial Username on @SubsocialChain`,
          )}
        >
          <ActionButton>Tweet about this</ActionButton>
        </ShareLink>
      </div>
    </>
  )
}

type ManageDomainModalProps = {
  domain: string
  close: VoidFunction
  visible: boolean
}

const componentByStep: Record<MenuSteps, FC<ManageDomainStepProps>> = {
  success: Success,
  menu: ManageDomainMenu,
  subid: UsernameOnSubId,
  inner: SpaceUsername,
  outer: SiteAlias,
}

export const ManageDomainModal = ({ domain, close, visible }: ManageDomainModalProps) => {
  const { domainStruct, loading } = useFetchDomain(domain)
  const { currentStep } = useManageDomainContext()

  const Content = () => {
    if (loading) return <Loading label='Loading domain...' />

    if (!currentStep || !domainStruct) return null

    const Component = componentByStep[currentStep]

    return <Component domainStruct={domainStruct} />
  }

  return (
    <Modal
      className={clsx(styles.Modal, 'DfSignInModal')}
      closable={false}
      title={null}
      width={currentStep === 'success' ? 520 : 620}
      onCancel={close}
      visible={visible}
      footer={null}
    >
      <Content />
    </Modal>
  )
}
