// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { Form, FormInstance, Input, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { maxLenError, minLenError } from 'src/components/forms'
import { UploadCover } from 'src/components/uploader'
import DfMdEditor from 'src/components/utils/DfMdEditor/client'
import { AutoSaveId } from 'src/components/utils/DfMdEditor/types'
import messages from 'src/messages'
import { PostContent } from 'src/types'
import { PostType } from '.'
import Embed from '../embed/Embed'
import { isSupportedEmbeddedLink } from '../embed/utils'

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 500

const BODY_MAX_LEN = 100_000 // ~100k chars

const MAX_TAGS = 10

type Content = PostContent

export type FormValues = Partial<
  Content & {
    spaceId: string
    link?: string
  }
>

type FieldName = keyof FormValues

export const fieldName = (name: FieldName): FieldName => name

type PostBodyFieldProps = {
  onChange: (mdText: string) => void
  require?: boolean
  autoSaveId?: AutoSaveId
  autofocus?: boolean
}

export const PostBodyField = ({ onChange, autoSaveId, require, autofocus }: PostBodyFieldProps) => (
  <Form.Item
    name={fieldName('body')}
    label='Post'
    hasFeedback
    rules={[
      { required: require, message: 'Post body is required.' },
      {
        max: BODY_MAX_LEN,
        message: maxLenError('Post body', BODY_MAX_LEN),
      },
    ]}
  >
    <DfMdEditor autoSaveId={autoSaveId} options={{ autofocus: autofocus }} onChange={onChange} />
  </Form.Item>
)

type CommonFieldsProps = {
  form: FormInstance<FormValues>
  initialValues?: FormValues
}

type FieldComponent = (props: CommonFieldsProps) => JSX.Element | null

export const ArticleFields = ({ form, initialValues }: CommonFieldsProps) => {
  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  return (
    <>
      <Form.Item
        name={fieldName('title')}
        label='Post title'
        hasFeedback
        rules={[
          // { required: true, message: 'Post title is required.' },
          {
            min: TITLE_MIN_LEN,
            message: minLenError('Post title', TITLE_MIN_LEN),
          },
          {
            max: TITLE_MAX_LEN,
            message: maxLenError('Post title', TITLE_MAX_LEN),
          },
        ]}
      >
        <Input placeholder='Optional: A title of your post' />
      </Form.Item>
      <Form.Item name={fieldName('image')} label='Cover' help={messages.imageShouldBeLessThanTwoMB}>
        <UploadCover onChange={onAvatarChanged} img={initialValues?.image} />
      </Form.Item>
    </>
  )
}

type EmbeddedLinkFieldProps = {
  autoFocus?: boolean
}

export const EmbeddedLinkField = ({
  initialValues,
  autoFocus,
}: CommonFieldsProps & EmbeddedLinkFieldProps) => {
  const [link, setLink] = useState(initialValues?.link)

  useEffect(() => {
    setLink(initialValues?.link)
  }, [initialValues?.link])

  const onLinkChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const link = e.target.value
    setLink(link)
  }

  return (
    <div>
      <Form.Item
        name={fieldName('link')}
        label='Video URL:'
        help={messages.formHints.embedded}
        rules={[
          { required: true, message: 'Link is required.' },
          ({ getFieldValue }) => ({
            async validator() {
              const email = getFieldValue(fieldName('link'))
              if (isSupportedEmbeddedLink(email)) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('This link is not supported, sorry'))
            },
          }),
        ]}
      >
        <Input onBlur={onLinkChange} size='large' autoFocus={autoFocus} />
      </Form.Item>
      {link && <Embed link={link} className='my-2' />}
    </div>
  )
}

type TagFieldProps = {
  tags: string[]
}

export const TagField = ({ tags }: TagFieldProps) => {
  return (
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
  )
}

export const canonicalField = (
  <Form.Item
    name={fieldName('canonical')}
    label='Original URL'
    help='This is the original URL of the place you first posted about this on another social media platform (i.e. Medium, Reddit, Twitter, etc.)'
    hasFeedback
    rules={[{ type: 'url', message: 'Should be a valid URL.' }]}
  >
    <Input type='url' placeholder='URL of the original post' />
  </Form.Item>
)

export const typedFieldsByType: Record<PostType, FieldComponent> = {
  article: ArticleFields,
  link: EmbeddedLinkField,
}
