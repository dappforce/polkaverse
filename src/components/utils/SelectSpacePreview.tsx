// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

/* eslint-disable react/display-name */
import { isEmptyStr } from '@subsocial/utils'
import { Select } from 'antd'
import { LabeledValue } from 'antd/lib/select'
import { DataSourceTypes, SpaceId } from 'src/types'
import { useFetchSpaces, useSelectSpace } from '../../rtk/features/spaces/spacesHooks'
import { SpaceAvatar } from '../spaces/helpers'
import { MutedDiv } from './MutedText'
import { BareProps } from './types'

type Props = BareProps & {
  imageSize?: number
  spaceIds: SpaceId[]
  onSelect?: (value?: string | number | LabeledValue) => void
  defaultValue?: string
  disabled?: boolean
  loading?: boolean
}

type SpaceOptionProps = {
  spaceId: SpaceId
  imageSize?: number
}

const SpaceOption = ({ spaceId, imageSize }: SpaceOptionProps) => {
  const spaceStruct = useSelectSpace(spaceId)

  const spaceStub = <>{spaceId}</>

  if (!spaceStruct) return spaceStub

  const { struct, content } = spaceStruct

  const name = content?.name

  return (
    <div className={'d-flex align-items-center'}>
      <SpaceAvatar
        space={struct}
        avatar={content?.image}
        size={imageSize}
        isUnnamedSpace={isEmptyStr(name)}
        asLink={false}
      />
      <div className='content'>
        {!name ? <MutedDiv>{'Unnamed Space'}</MutedDiv> : <div className='handle'>{name}</div>}
      </div>
    </div>
  )
}

const SelectSpacePreview = (props: Props) => {
  const { spaceIds, onSelect, defaultValue, imageSize, className, style, disabled, loading } = props
  useFetchSpaces({ ids: spaceIds, dataSource: DataSourceTypes.SQUID })

  const onClear = () => onSelect && onSelect(undefined)

  const defaultSpaceId = defaultValue || spaceIds[0]

  const options = spaceIds.map(spaceId => ({
    key: 'key-' + spaceId,
    value: spaceId,
    label: <SpaceOption spaceId={spaceId} imageSize={imageSize} />,
  }))

  return (
    <Select
      onSelect={onSelect}
      loading={loading}
      defaultValue={{
        label: <SpaceOption spaceId={defaultSpaceId} imageSize={imageSize} />,
        value: defaultSpaceId,
        key: defaultSpaceId,
      }}
      labelInValue
      className={className}
      style={style}
      onClear={onClear}
      size='large'
      dropdownMatchSelectWidth={200}
      options={options}
      disabled={disabled}
    />
  )
}

export default SelectSpacePreview
