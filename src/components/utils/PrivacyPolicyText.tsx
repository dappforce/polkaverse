import clsx from 'clsx'
import { HTMLProps } from 'react'
import CustomLink from '../referral/CustomLink'

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
          <CustomLink href='https://subsocial.network/legal/terms' passHref>
            <a target='_blank'>Terms of Use</a>
          </CustomLink>
        ),
        privacy: (
          <CustomLink href='https://subsocial.network/legal/privacy' passHref>
            <a target='_blank'>Privacy Policy</a>
          </CustomLink>
        ),
      })}
    </span>
  )
}
