import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit'
import { isDef } from '@subsocial/utils'
import { createSelectUnknownIds, FetchManyArgs, ThunkApiConfig } from 'src/rtk/app/helpers'
import { SelectOneFn } from 'src/rtk/app/hooksCommon'
import { RootState } from 'src/rtk/app/rootReducer'
import { DomainStruct } from '../../../components/domains/utils'

export type DomainEntity = DomainStruct & {
  /** `id` is an account address that owns spaces. */
  id: string
}

const sliceName = 'domains'

const adapter = createEntityAdapter<DomainEntity>()

const selectors = adapter.getSelectors<RootState>(state => state.domains)

export const selectEntityOfDomain: SelectOneFn<{}, DomainEntity | undefined> = (
  state,
  { id: domain },
) => selectors.selectById(state, domain)

export const selectDomain = (state: RootState, id: string): DomainEntity | undefined =>
  selectEntityOfDomain(state, { id })

export const selectDomains = (state: RootState, ids: string[]) =>
  ids.map(id => selectDomain(state, id)).filter(isDef)

const selectUnknownDomains = createSelectUnknownIds(selectors.selectIds)

export const fetchDomains = createAsyncThunk<DomainEntity[], FetchManyArgs<{}>, ThunkApiConfig>(
  `${sliceName}/fetchMany`,
  async ({ ids, reload, api }, { getState }): Promise<DomainEntity[]> => {
    let newIds = ids

    if (!reload) {
      newIds = selectUnknownDomains(getState(), ids)
      if (!newIds.length) {
        // Nothing to load: all ids are known and their profiles are already loaded.
        return []
      }
    }

    const promises = newIds.map(async domainName => {
      const id = domainName.toString()
      if (!id) return

      const struct = await api.findDomain(id)

      const result = {
        id,
      } as DomainEntity

      if (!struct) return result

      return {
        ...result,
        ...struct,
      } as DomainEntity
    })

    const results = await Promise.all(promises)

    return results.filter(isDef)
  },
)

const slice = createSlice({
  name: sliceName,
  initialState: adapter.getInitialState(),
  reducers: {
    // upsertOwnDomains: adapter.upsertOne,
  },
  extraReducers: builder => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    builder.addCase(fetchDomains.fulfilled, adapter.upsertMany)
  },
})

export const {
  // upsertOwnDomains,
} = slice.actions

export default slice.reducer
