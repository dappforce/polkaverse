// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import * as Yup from 'yup'
import { maxLenError, minLenError, urlValidation } from '../utils/forms/validation'
import { pluralize } from '../utils/Plularize'

const TITLE_MIN_LEN = 3
const TITLE_MAX_LEN = 100

const MAX_TAGS_PER_POST = 10

const POST_MAX_LEN = 10000

export const buildValidationSchema = () =>
  Yup.object().shape({
    title: Yup.string()
      // .required('Post title is required')
      .min(TITLE_MIN_LEN, minLenError('Post title', TITLE_MIN_LEN))
      .max(TITLE_MAX_LEN, maxLenError('Post title', TITLE_MAX_LEN)),

    body: Yup.string()
      .required('Post body is required')
      // .min(p.minTextLen.toNumber(), minLenError('Post body', p.postMinLen))
      .max(POST_MAX_LEN, maxLenError('Post body', POST_MAX_LEN)),

    image: urlValidation('Image'),

    tags: Yup.array().max(
      MAX_TAGS_PER_POST,
      `Too many tags. You can use up to ${pluralize({
        count: MAX_TAGS_PER_POST,
        singularText: 'tag',
      })} per post.`,
    ),

    canonical: urlValidation('Original post'),
  })

export const buildSharePostValidationSchema = () =>
  Yup.object().shape({
    body: Yup.string().max(POST_MAX_LEN, maxLenError('Post body', POST_MAX_LEN)),
  })
