import React from 'react'
import { useLoadSudo } from 'src/hooks/useLoadSudo'
import { equalAddresses } from '../substrate'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { useMyAddress } from './MyAccountsContext'

export const NotSudo = React.memo(() => (
  <NoData description='Only sudo user can access this page' />
))

type OnlySudoProps = React.PropsWithChildren<{}>

export const OnlySudo = ({ children }: OnlySudoProps) => {
  const myAddress = useMyAddress()
  const sudo = useLoadSudo()
  const iAmSudo = equalAddresses(myAddress, sudo)

  return sudo ? (
    <>
      {/* <div>Sudo: <b><code>{sudo.toString()}</code></b></div> */}
      {iAmSudo ? children : <NotSudo />}
    </>
  ) : (
    <Loading label='Loading sudo account...' />
  )
}
