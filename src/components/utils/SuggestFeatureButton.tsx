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
  <ExternalButtonWithBulb url='https://github.com/dappforce/polkaverse/issues/new?assignees=&labels=enhancement&projects=&template=feature-request.md' />
)
