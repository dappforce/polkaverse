import { Form, Input, InputProps } from 'antd'
import { Rule } from 'antd/lib/form'
import React from 'react'
import messages from 'src/messages'
import { isAccountId } from 'src/utils/check'

type AccountInputFieldProps = InputProps & {
  name: string
  label?: string
  rules?: Rule[]
  help?: React.ReactNode
  extra?: React.ReactNode
}

export const AccountInputField = ({
  name,
  label,
  extra = messages.supportedAccounts,
  rules = [],
  className,
  help,
  ...inputProps
}: AccountInputFieldProps) => {
  return (
    <Form.Item
      name={name}
      label={label}
      className={className}
      extra={extra}
      validateTrigger={['onChange', 'onBlur', 'onKeyUp']}
      help={help}
      rules={[
        ({ getFieldValue }) => ({
          async validator() {
            const account = getFieldValue(name)
            if (!account || isAccountId(account)) {
              return Promise.resolve()
            }
            return Promise.reject(new Error('This is not a valid account address.'))
          },
        }),
        ...rules,
      ]}
    >
      <Input autoFocus {...inputProps} />
    </Form.Item>
  )
}
