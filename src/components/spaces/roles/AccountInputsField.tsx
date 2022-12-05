import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Col, Divider, FormInstance, Row } from 'antd'
import { ProfilePreviewByAccountId } from 'src/components/profiles/address-views'
import { AccountInputField } from 'src/components/utils/forms/AccountInputField'
import { AccountId } from 'src/types'
import { isAccountId } from 'src/utils/check'
import styles from './Roles.module.sass'

type AccountInputFieldProps = {
  form: FormInstance
  onChange: (accounts: AccountId[]) => void
  accounts: AccountId[]
}

const FIELD_ACCOUNT_NAME = 'account'

export const InputAccountsField = ({ accounts, onChange, form }: AccountInputFieldProps) => {
  const setNewAccount = () => {
    const newAccount: AccountId = form.getFieldValue(FIELD_ACCOUNT_NAME)

    if (newAccount && isAccountId(newAccount)) {
      onChange([...new Set([...accounts, newAccount])])
      form.resetFields()
    }
  }

  const removeAccount = (removeAccount: AccountId) =>
    onChange(accounts.filter(x => removeAccount !== x))

  return (
    <Row className='mb-3'>
      <Row>
        <Col span={21}>
          <AccountInputField name={FIELD_ACCOUNT_NAME} className='mb-0' />
        </Col>
        <Col span={2} offset={1}>
          <Button type='primary' icon={<PlusOutlined />} onClick={setNewAccount} />
        </Col>
      </Row>
      {accounts.map(account => (
        <Row key={account} align='middle'>
          <Divider className='my-3' />
          <ProfilePreviewByAccountId
            size={48}
            address={account}
            right={
              <DeleteOutlined
                className={`${'DfMutedLink'} ${styles.Trash} mr-3`}
                onClick={() => removeAccount(account)}
              />
            }
          />
        </Row>
      ))}
    </Row>
  )
}
