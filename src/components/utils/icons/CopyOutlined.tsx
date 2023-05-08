import Icon from '@ant-design/icons'
import type { CustomIconComponentProps } from '@ant-design/icons/lib/components/Icon'

const CopyOutlinedSvg = () => (
  <svg
    width='20'
    height='23'
    viewBox='0 0 20 23'
    fill='currentColor'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M14.5 0.5H2.5C1.4 0.5 0.5 1.4 0.5 2.5V16.5H2.5V2.5H14.5V0.5ZM17.5 4.5H6.5C5.4 4.5 4.5 5.4 4.5 6.5V20.5C4.5 21.6 5.4 22.5 6.5 22.5H17.5C18.6 22.5 19.5 21.6 19.5 20.5V6.5C19.5 5.4 18.6 4.5 17.5 4.5ZM17.5 20.5H6.5V6.5H17.5V20.5Z'
      fill='currentColor'
    />
  </svg>
)

const CopyOutlinedIcon = (props: Partial<CustomIconComponentProps>) => (
  <Icon component={CopyOutlinedSvg} {...props} />
)

export default CopyOutlinedIcon
