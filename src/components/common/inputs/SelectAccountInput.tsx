import { Select } from 'antd'
import { useEffect, useState } from 'react'
import { SelectAddressPreview } from '../../profile-selector/MyAccountMenu'
import { isEmptyArray, toSubsocialAddress } from '@subsocial/utils'
import registry from '@subsocial/api/utils/registry'
import { GenericAccountId } from '@polkadot/types'
import Avatar from '../../profiles/address-views/Avatar'
import styles from './inputs.module.sass'
import { useSelectProfile } from 'src/rtk/app/hooks'
import { useMyAccounts } from 'src/components/auth/MyAccountsContext'
import { equalAddresses } from 'src/components/substrate'

export const isValidAccount = (address?: string) => {
  try {
    if (address) {
      return !!new GenericAccountId(registry, address)
    }

    return false
  } catch {}

  return false
}

type SelectAccountInputProps = {
  className?: string
  setValue: (value: string) => void
  value?: string
  withAvatar?: boolean
}

const filterSelectOptions = (adresses: string[], value?: string) => {
  return adresses
    .filter(x => {
      return !equalAddresses(x, value)
    })
    .map((address, index) => {
      return {
        key: address + index,
        label: <SelectAddressPreview address={address} withShortAddress={true} />,
        value: address,
      }
    })
}

export const SelectAccountInput = ({
  setValue,
  value,
  className,
  withAvatar = true,
}: SelectAccountInputProps) => {
  const { accounts, status } = useMyAccounts()
  const allExtensionAccounts = accounts.map(x => toSubsocialAddress(x.address) as string)

  const [ defaultOptions, setDefaultOptions ] = useState<any[]>([])
  const [ selectOptions, setSelectOptions ] = useState<any[]>(defaultOptions)
  const profile = useSelectProfile(value)

  useEffect(() => {
    if (!value) return

    const options = status === 'OK' ? filterSelectOptions(allExtensionAccounts, value) : []
    setDefaultOptions(options)
    setSelectOptions(options)
  }, [ value, status ])

  const onSelectChange = (value: string) => {
    setValue(value)
  }

  const onSearchHandler = (searchValue: any) => {
    const options = []

    if (isValidAccount(searchValue)) {
      options.push({
        key: 'key-' + searchValue,
        label: (
          <SelectAddressPreview
            address={new GenericAccountId(registry, searchValue)}
            withoutBalances
            withShortAddress={true}
          />
        ),
        value: searchValue,
      })
    } else {
      const filterOptions = defaultOptions.filter((x: any) => x.value.includes(searchValue))

      if (!isEmptyArray(filterOptions)) {
        options.push(...filterOptions)
      }
    }

    !isEmptyArray(options) && setSelectOptions(options)
  }

  const onSelectHandler = (searchValue: any) => {
    const filterOptions = selectOptions.filter((x: any) => !x.value.includes(searchValue))
    if (filterOptions) {
      setSelectOptions(filterOptions as any[])
    }
  }

  const avatar = (
    <div className='mr-2'>
      {value 
        ? <Avatar address={value} avatar={profile?.content?.image} size={50} /> 
        : <div className={`${styles.Circle} mr-2`}></div>}
    </div>
  )

  return (
    <div className='d-flex align-items-center'>
      {withAvatar && avatar}
      <Select
        showSearch
        allowClear
        value={value}
        size='large'
        className={className}
        options={selectOptions}
        onSearch={onSearchHandler}
        onSelect={onSelectHandler}
        onChange={onSelectChange}
        placeholder='Substate-based address'
      />
    </div>
  )
}
