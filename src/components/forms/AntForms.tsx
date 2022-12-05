import styles from './AntForms.module.sass'

import { LoadingOutlined } from '@ant-design/icons'
import { Button, Form } from 'antd'
import { FormInstance, FormItemProps, FormProps } from 'antd/lib/form'
import dynamic from 'next/dynamic'
import React from 'react'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import { isMobileDevice } from 'src/config/Size.config'
import { showErrorMessage, showInfoMessage } from '../utils/Message'

export const LABEL_LEN = isMobileDevice ? 0 : 6
export const FIELD_LEN = 24 - LABEL_LEN

const defaultFormProps: FormProps = {
  validateTrigger: ['onBlur'],
  autoComplete: 'off',
  size: 'large',
  labelAlign: 'left',
  labelCol: { span: LABEL_LEN },
  wrapperCol: { span: FIELD_LEN },
}

const buttonSize = isMobileDevice ? 'middle' : 'large'

const commonFormButtonsProps: FormItemProps = {
  wrapperCol: {
    offset: LABEL_LEN,
    span: FIELD_LEN,
  },
}

const commonFormTxButtonProps: TxButtonProps = {
  type: 'primary',
  size: defaultFormProps.size,
}

const TxButtonStub = React.memo(() => (
  <Button {...commonFormTxButtonProps} disabled={true}>
    <LoadingOutlined />
  </Button>
))

const TxButton = dynamic(() => import('../utils/TxButton'), { loading: TxButtonStub, ssr: false })

export const DfForm = (props: FormProps) => {
  const mergedProps = { ...defaultFormProps, ...props }
  if (mergedProps.layout === 'vertical') {
    mergedProps.labelCol = undefined
    mergedProps.wrapperCol = undefined
  }
  return (
    <Form {...mergedProps} className={`${styles.DfForm} ${props.className}`}>
      {props.children}
    </Form>
  )
}

type DfFormTxButtonProps = Omit<TxButtonProps, 'form'> & {
  form: FormInstance
}

type DfFormButtonsProps = FormItemProps & {
  form: FormInstance
  withReset?: boolean
  txProps: TxButtonProps
}

export const DfFormButtons = ({
  form,
  withReset = true,
  txProps,
  ...props
}: DfFormButtonsProps) => (
  <Form.Item {...commonFormButtonsProps} {...props}>
    <DfFormTxButton form={form} size={buttonSize} {...txProps} />
    {withReset && (
      <Button onClick={() => form.resetFields()} size={buttonSize}>
        Reset form
      </Button>
    )}
  </Form.Item>
)

export const shouldSignAndSend = async (form: FormInstance) => {
  try {
    await form.validateFields()
    const isChanged = form.isFieldsTouched()
    if (!isChanged) {
      showInfoMessage({
        message: 'Nothing to update',
        description: 'Form has not been changed',
      })
    }
    return isChanged
  } catch (err) {
    // Form is invalid
    showErrorMessage({
      message: 'Form is invalid',
      description: 'Fix form errors and try again',
    })
    return false
  }
}

export const DfFormTxButton = ({ form, ...props }: DfFormTxButtonProps) => (
  <TxButton {...commonFormTxButtonProps} {...props} onValidate={() => shouldSignAndSend(form)} />
)
