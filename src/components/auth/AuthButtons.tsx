import Button, { ButtonSize, ButtonType } from 'antd/lib/button'
import { useAuth } from './AuthContext'
import { useMyAccountsContext } from './MyAccountsContext'

type InnerAuthButtonProps = {
  type?: ButtonType
  size?: ButtonSize
  title?: string
  className?: string
}

type OpenAuthButton = InnerAuthButtonProps & {
  block?: boolean
  ghost?: boolean
}

export function OpenAuthButton({
  type = 'default',
  size,
  title = 'Click me',
  className,
  block = false,
  ghost = false,
}: OpenAuthButton) {
  const { openSignInModal } = useAuth()

  return (
    <Button
      size={size}
      className={className}
      type={type}
      block={block}
      ghost={ghost}
      onClick={() => openSignInModal()}
    >
      {title}
    </Button>
  )
}

type SignInButtonProps = InnerAuthButtonProps & {
  isPrimary?: boolean
}

export const SignInMobileStub = () => <Button disabled>Read only</Button>

export const SignInButton = ({
  isPrimary,
  size,
  title = 'Sign in',
  ...props
}: SignInButtonProps) => (
  <OpenAuthButton type={isPrimary ? 'primary' : 'default'} size={size} title={title} {...props} />
)

type SwitchAccountButtonProps = InnerAuthButtonProps

export const SwitchAccountButton = ({
  size,
  title = 'Switch accounts',
}: SwitchAccountButtonProps) => (
  <OpenAuthButton type={'link'} size={size} title={title} className='DfButtonAsMenuItem' />
)

type SignOutButtonProps = InnerAuthButtonProps

export function SignOutButton({ size, title = 'Sign out' }: SignOutButtonProps) {
  const { signOut } = useMyAccountsContext()

  return (
    <div className='mx-5'>
      <Button block size={size} onClick={signOut}>
        {title}
      </Button>
    </div>
  )
}
