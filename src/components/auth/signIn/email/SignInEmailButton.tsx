import { AvatarOrSkeleton } from 'src/components/utils'
import styles from './SignInEmailButton.module.sass'

const SignInEmailButton = () => {
  return (
    <div className={styles.SignInEmailButton}>
      <div className='d-flex align-items-center'>
        <AvatarOrSkeleton
          externalIcon
          icon={'/images/signIn/EmailIcon.svg'}
          size={'large'}
          className='mr-2 align-items-start'
        />
        <div className='font-weight-bold'>Sign in with email</div>
      </div>
      <div className={styles.SignInChip}>New</div>
    </div>
  )
}

export default SignInEmailButton
