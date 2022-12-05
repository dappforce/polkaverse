import isEmptyObj from 'lodash.isempty'
import { useState } from 'react'
import store from 'store'

const AUTOSAVE_PREFIX = 'autosave'

type Props = {
  entity: 'space' | 'post'
}

export const useAutoSaveFromForm = ({ entity }: Props) => {
  const autosaveId = `${AUTOSAVE_PREFIX}-${entity}`
  const [savedData] = useState(store.get(autosaveId) || {})

  const saveContent = (content: Record<string, any>) => {
    if (isEmptyObj(content)) return

    store.set(autosaveId, content)
  }

  const clearDraft = () => {
    store.remove(autosaveId)
  }

  return {
    savedData,
    saveContent,
    clearDraft,
  }
}
