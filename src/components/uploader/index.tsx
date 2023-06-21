// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { CameraOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import { newLogger } from '@subsocial/utils'
import { Upload } from 'antd'
import ImgCrop from 'antd-img-crop'
import { DraggerProps } from 'antd/lib/upload'
import clsx from 'clsx'
import React, { FC, useCallback, useState } from 'react'
import { useSubsocialApi } from 'src/components/substrate/SubstrateContext'
import { resolveIpfsUrl } from 'src/ipfs'
import { DfBgImg } from '../utils/DfBgImg'
import { showErrorMessage } from '../utils/Message'
import { MutedSpan } from '../utils/MutedText'
import { BareProps, FVoid } from '../utils/types'
import styles from './index.module.sass'

const log = newLogger('Uploader')

type BaseUploadProps = Omit<DraggerProps, 'onChange'> & {
  onChange: (url?: string) => void
  img?: string
}

const setError = (err: string) => {
  showErrorMessage(err)
}

type RemoveIconProps = BareProps & {
  onClick: FVoid
}

const RemoveIcon = (props: RemoveIconProps) => (
  <div title='Remove image' {...props}>
    <DeleteOutlined />
  </div>
)

type UploadButtonProps = {
  loading: boolean
}

type InnerUploadImgProps = {
  UploadButton: FC<UploadButtonProps>
}

export const UploadImg = ({
  onChange,
  UploadButton,
  listType,
  ...props
}: BaseUploadProps & InnerUploadImgProps) => {
  const [loading, setLoading] = useState(false)
  const { ipfs } = useSubsocialApi()

  const beforeUpload = useCallback((file: File | Blob) => {
    const isJpgOrPng =
      file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
    if (!isJpgOrPng) {
      setError('You can only upload JPG/PNG/GIF file.')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      setError('Image must smaller than 2MB.')
    }
    return isJpgOrPng && isLt2M
  }, [])

  return (
    <div>
      <Upload
        accept='.gif, .png, .jpeg, .jpg'
        action={async file => {
          if (file) {
            try {
              setLoading(true)
              const cid = await ipfs.saveFileToOffchain(file)
              onChange(cid)
              setLoading(false)
              return cid
            } catch (err: any) {
              const error = err?.response?.data?.message
              error && setError(err.response.data.message)
              log.error('Failed upload image:', err)
              setLoading(false)
              return undefined
            }
          }
        }}
        listType={listType}
        showUploadList={false}
        beforeUpload={beforeUpload}
        className={styles.DfUploadImg}
        {...props}
      >
        <UploadButton loading={loading} />
      </Upload>
    </div>
  )
}

type UploadWithCover = BaseUploadProps & {
  placeholder?: React.ReactNode
  extraPlaceHolder?: string
  uploadClassName?: string
}

type ImagePreviewProps = BareProps & {
  imgUrl: string
  onRemove: FVoid
}

type InnerUploadProps = BaseUploadProps & {
  ImagePreview: React.FC<ImagePreviewProps>
}

export const PreviewUploadedImage = ({ imgUrl, onRemove, className, style }: ImagePreviewProps) => {
  return (
    <div className='d-flex'>
      <img
        src={resolveIpfsUrl(imgUrl)}
        style={style}
        className={clsx('DfImagePreview', className)}
        alt='cover'
      />
      <RemoveIcon className={styles.DfRemoveCover} onClick={onRemove} />
    </div>
  )
}

const InnerUploadImgWithCover = ({
  onChange,
  img,
  ImagePreview,
  uploadClassName,
  placeholder,
  extraPlaceHolder,
  ...props
}: UploadWithCover & InnerUploadProps) => {
  const [imgUrl, setUrl] = useState(img)

  const handleChange = async (cid?: string) => {
    if (cid) {
      onChange(cid)
      setUrl(cid)
    }
  }

  const UploadButton: FC<UploadButtonProps> = ({ loading }) => (
    <div className={uploadClassName}>
      {loading ? <LoadingOutlined /> : <CameraOutlined style={{ fontSize: '1.5rem' }} />}
      <div className='FontNormal'>{placeholder}</div>
      {extraPlaceHolder && <MutedSpan className='extra mt-3'>{extraPlaceHolder}</MutedSpan>}
    </div>
  )

  return imgUrl ? (
    <ImagePreview
      imgUrl={imgUrl}
      onRemove={() => {
        onChange(undefined)
        setUrl(undefined)
      }}
    />
  ) : (
    <UploadImg
      listType='picture-card'
      onChange={handleChange}
      UploadButton={UploadButton}
      {...props}
    />
  )
}

export const UploadCover = (props: UploadWithCover) => {
  return (
    <InnerUploadImgWithCover
      ImagePreview={PreviewUploadedImage}
      className={styles.DfUploadImg}
      {...props}
    />
  )
}

export const UploadAvatar = (props: UploadWithCover) => {
  return (
    <ImgCrop rotate>
      <InnerUploadImgWithCover
        ImagePreview={({ imgUrl, onRemove }) => (
          <div className={clsx('d-flex', props.className)}>
            <DfBgImg
              className='DfAvatar'
              size={100}
              src={imgUrl}
              style={{ border: '1px solid #ddd' }}
              rounded
            />
            <RemoveIcon className={styles.DfRemoveIcon} onClick={onRemove} />
          </div>
        )}
        {...props}
        className={clsx(styles.DfUploadAvatar, props.className)}
      />
    </ImgCrop>
  )
}
