// SPDX-License-Identifier: GPL-3.0-or-later.
// Copyright (C) 2022-2023 DAPPFORCE PTE. LTD., aleksandr.siman@gmail.com.
// Full Notice is available in the root folder.

import { BulbOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import ExternalLink from '../spaces/helpers/ExternalLink'
import styles from './SuggestFeatureButton.module.sass'

type ButtonWithBulbProps = {
  url: string
}

export const ExternalButtonWithBulb = ({ url }: ButtonWithBulbProps) => (
  <Button className={`ml-4 ${styles.FeatureButton}`} shape='round'>
    <ExternalLink
      url={url}
      value={
        <>
          <BulbOutlined className='mr-2' />
          Suggest feature
        </>
      }
    />
  </Button>
)

export const SugestFeature = () => (
  <ExternalButtonWithBulb url='https://forms.gle/sdmMJN3n4sxyNTWW7' />
)
