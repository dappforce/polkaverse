import { Form, Input } from 'antd'
import TextArea from 'antd/lib/input/TextArea'
import clsx from 'clsx'
import { DfForm, maxLenError, minLenError } from 'src/components/forms'
import { UploadAvatar } from 'src/components/uploader'
import { DESC_MAX_LEN, NAME_MAX_LEN, NAME_MIN_LEN } from 'src/config/ValidationsConfig'
import messages from 'src/messages'
import {
  useOnBoardingData,
  useOnBoardingDataForm,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import { ProfileOnBoardingData } from 'src/rtk/features/onBoarding/onBoardingSlice'
import OnBoardingContentContainer from '../../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../../types'
import styles from './Profile.module.sass'

type FieldName = keyof ProfileOnBoardingData
const fieldName = (name: FieldName): FieldName => name

const getInitialValues = (): ProfileOnBoardingData => ({
  image: '',
  name: '',
  about: '',
})

export default function Profile({ ...props }: OnBoardingContentProps) {
  const { form, onFieldsChange } = useOnBoardingDataForm('profile', getInitialValues)
  const data = useOnBoardingData('profile')

  const onAvatarChanged = (url?: string) => {
    form.setFieldsValue({ [fieldName('image')]: url })
  }

  const onSubmitValidation = async () => {
    return form
      .validateFields()
      .then(() => true)
      .catch(() => false)
  }

  return (
    <OnBoardingContentContainer {...props} onSubmitValidation={onSubmitValidation}>
      <DfForm
        className={clsx(styles.Form)}
        size='middle'
        layout='vertical'
        form={form}
        initialValues={{}}
        onFieldsChange={onFieldsChange}
      >
        <Form.Item
          name={fieldName('image')}
          help={<p className='text-center m-0 mt-1'>{messages.imageShouldBeLessThanTwoMB}</p>}
          className={styles.ImageInput}
        >
          <UploadAvatar
            className='justify-content-center'
            img={data?.image}
            onChange={onAvatarChanged}
          />
        </Form.Item>

        <Form.Item
          name={fieldName('name')}
          label='Profile name'
          hasFeedback
          rules={[
            { required: true, message: 'Name is required' },
            { min: NAME_MIN_LEN, message: minLenError('Name', NAME_MIN_LEN) },
            { max: NAME_MAX_LEN, message: maxLenError('Name', NAME_MAX_LEN) },
          ]}
        >
          <Input size='large' placeholder='Elon Musk' />
        </Form.Item>

        <Form.Item
          name={fieldName('about')}
          label='Bio'
          hasFeedback
          rules={[{ max: DESC_MAX_LEN, message: maxLenError('Description', DESC_MAX_LEN) }]}
        >
          <TextArea size='large' placeholder='Tell us a little bit about yourself' />
        </Form.Item>
      </DfForm>
    </OnBoardingContentContainer>
  )
}
