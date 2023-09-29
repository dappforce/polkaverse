import clsx from 'clsx'
import Link from 'next/link'
import { HTMLProps } from 'react'

type TextGenerator = (links: { terms: JSX.Element; privacy: JSX.Element }) => JSX.Element
export interface PrivacyPolicyTextProps extends HTMLProps<HTMLSpanElement> {
  textGenerator: TextGenerator
}

export default function PrivacyPolicyText({
  textGenerator,
  className,
  ...props
}: PrivacyPolicyTextProps) {
  return (
    <span className={clsx('m-0', className)} {...props}>
      {textGenerator({
        terms: (
          <Link href='https://subsocial.network/legal/terms' passHref legacyBehavior>
            <a target='_blank'>Terms of Use</a>
          </Link>
        ),
        privacy: (
          <Link href='https://subsocial.network/legal/privacy' passHref legacyBehavior>
            <a target='_blank'>Privacy Policy</a>
          </Link>
        ),
      })}
    </span>
  )
}
