import { PlusOutlined } from '@ant-design/icons'
import { Button, Divider, FormInstance, Row } from 'antd'
import { FiTrash } from 'react-icons/fi'
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
    <div className={styles.EditorsWrapper}>
      <div className={styles.InputSection}>
        <AccountInputField
          extra=''
          placeholder='Enter account address'
          name={FIELD_ACCOUNT_NAME}
          className={styles.AccountInput}
        />
        <Button type='primary' icon={<PlusOutlined />} onClick={setNewAccount} />
      </div>
      <div className={styles.EditorsList}>
        {accounts.map((account, i) => (
          <Row key={account} align='middle'>
            <ProfilePreviewByAccountId
              size={48}
              address={account}
              right={
                <FiTrash
                  className={`${'DfMutedLink'} ${styles.Trash}`}
                  onClick={() => removeAccount(account)}
                />
              }
            />
            {accounts.length - 1 !== i && <Divider className='my-3' />}
          </Row>
        ))}
      </div>
    </div>
  )
}
