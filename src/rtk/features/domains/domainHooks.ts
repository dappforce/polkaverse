import { getFirstOrUndefined, isDef, parseDomain } from '@subsocial/utils'
import { useEffect, useState } from 'react'
import { shallowEqual } from 'react-redux'
import useSubsocialEffect from 'src/components/api/useSubsocialEffect'
import { DomainDetails } from 'src/components/domains/utils'
import { useMyAddress } from '../../../components/auth/MyAccountsContext'
import { DomainStruct } from '../../../components/domains/utils'
import useSubstrate from '../../../components/substrate/useSubstrate'
import { useActions } from '../../app/helpers'
import { useFetch } from '../../app/hooksCommon'
import { useAppDispatch, useAppSelector } from '../../app/store'
import { fetchDomainsByOwner, selectDomainsByOwner, upsertOwnDomains } from './domainsByOwnerSlice'
import { fetchDomains, selectDomains, upsertDomain } from './domainsSlice'
import { setTopLevelDomains } from './topLevelDomains'

export const useIsMyDomain = (domainName: string) => {
  const { domains, loading, error } = useMyDomains()

  if (!domainName || !domains || loading || error) return undefined

  return !!domains.find(d => d === domainName)
}

export const useMyDomains = () => {
  const myAddress = useMyAddress()

  const domains =
    useAppSelector(state => (myAddress ? selectDomainsByOwner(state, myAddress) : [])) || []

  const props = useFetch(fetchDomainsByOwner, { id: myAddress || '' })

  return {
    domains,
    ...props,
  }
}

export const useFetchDomains = (domains: string[], reload?: boolean) => {
  const domainsStruct = useAppSelector(state => selectDomains(state, domains), shallowEqual)

  const props = useFetch(fetchDomains, { ids: domains, reload })

  return {
    domainsStruct,
    ...props,
  }
}

export const useFetchDomain = (domain: string) => {
  const { domainsStruct, ...props } = useFetchDomains([domain], true)

  return {
    domainStruct: getFirstOrUndefined(domainsStruct),
    ...props,
  }
}

export const useCreateReloadDomain = () => {
  return useActions<string>(({ dispatch, args, api }) => {
    dispatch(fetchDomains({ ids: [args], reload: true, api }))
  })
}

export const useCreateReloadMyDomains = () => {
  const myAddress = useMyAddress()

  return useActions<void>(({ dispatch, api }) => {
    myAddress && dispatch(fetchDomainsByOwner({ id: myAddress, api, reload: true }))
  })
}

type UpsertDomainsProps = {
  address: string
  domain: DomainStruct
  domainName: string
}

export const useCreateUpsertDomains = () => {
  return useActions<UpsertDomainsProps>(({ dispatch, args }) => {
    const { address, domain, domainName } = args

    dispatch(upsertDomain({ ...domain, id: domainName }))
    dispatch(upsertOwnDomains({ address, newDomain: domainName }))
  })
}

const skippedDomains = ['gov']

export const useFetchTopLevelDomains = () => {
  const domains = useAppSelector(state => state.topLevelDomains.domains || [])
  const dispatch = useAppDispatch()
  useSubsocialEffect(
    ({ substrate }) => {
      if (domains.length) return

      const fetchTlds = async () => {
        const api = await substrate.api
        const tldsCodec = await api.query.domains.supportedTlds.keys()
        const tlds = tldsCodec
          .map(x => (x.toHuman() as string)[0])
          .filter(isDef)
          .filter(d => !skippedDomains.includes(d))

        dispatch(setTopLevelDomains(tlds))
      }

      fetchTlds()
    },
    [domains.length],
  )

  return domains
}

export const useBuildDomainsWithTldByDomain = (d: DomainDetails) => {
  const tlds = useFetchTopLevelDomains()

  const { id: domainName } = d

  const { domain, tld } = parseDomain(domainName)

  return tlds
    .map(_tld => {
      if (_tld === tld) return

      return `${domain}.${_tld}`
    })
    .filter(isDef)
}

export const useIsReservedWord = (domain: string) => {
  const [isReserved, setValue] = useState<boolean>()
  const [loading, setLoading] = useState(true)
  const { api, isApiReady } = useSubstrate()
  const { domain: domainName } = parseDomain(domain)

  useEffect(() => {
    if (!isApiReady) return

    const check = async () => {
      setLoading(true)

      const minDomainLength = api?.consts.domains.minDomainLength.toHuman() as unknown as number
      const isReserved =
        domainName?.length < minDomainLength ||
        !!(await api.query.domains.reservedWords(domainName)).toHuman()

      setValue(isReserved)
      setLoading(false)
    }

    check()
  }, [isApiReady, domainName])

  return {
    isReserved,
    loading,
  }
}

export const useIsSupportedTld = (tld: string) => {
  const [isSupported, setValue] = useState<boolean>()
  const [loading, setLoading] = useState(true)
  const { api } = useSubstrate()

  useEffect(() => {
    if (!api) return

    const check = async () => {
      setLoading(true)
      let isSupported = false

      if (!tld) {
        isSupported = true
      } else {
        // const supportedTld = await api.query.domains.supportedTlds(tld)
        // isSupported = !!supportedTld.toHuman()

        // TODO: hardcode. Change when we allow tlds in blockchain
        isSupported = tld === 'sub'
      }

      setValue(isSupported)
      setLoading(false)
    }

    check()
  }, [api, tld])

  return {
    isSupported,
    loading,
  }
}
