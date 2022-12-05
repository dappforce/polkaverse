import { useMemo } from 'react'
import {
  useOnBoardingData,
  useSaveOnBoardingData,
} from 'src/rtk/features/onBoarding/onBoardingHooks'
import OnBoardingContentContainer from '../../OnBoardingContentContainer'
import { OnBoardingContentProps } from '../../types'
import TopicChip from './TopicChip'
import styles from './Topics.module.sass'

const topics: { text: string; value: string }[] = [
  { text: '🌌 Space', value: 'space' },
  { text: '😅 Fails', value: 'fails' },
  { text: '🪙 Crypto', value: 'crypto' },
  { text: '🔗 Blockchain', value: 'blockchain' },
  { text: '👮‍♀️ Regulation', value: 'regulation' },
  { text: '🏛 DeFi', value: 'defi' },
  { text: '🎮 GameFi', value: 'gamefi' },
  { text: '🏙 Infrastructure', value: 'infrastructure' },
  { text: '👥 Social', value: 'social' },
  { text: '💫 Interesting', value: 'interesting' },
  { text: '📷 NFT', value: 'nft' },
  { text: '🔭 Science', value: 'science' },
]

export default function Topics(props: OnBoardingContentProps) {
  const selectedTopics = useOnBoardingData('topics')
  const saveTopics = useSaveOnBoardingData('topics')

  const selectedTopicsSet = useMemo(() => {
    if (!selectedTopics) return new Set<string>()
    return new Set(selectedTopics)
  }, [selectedTopics])

  const createChipClickHandler = (value: string) => () => {
    const currentSet = new Set(selectedTopicsSet)
    if (selectedTopicsSet.has(value)) {
      currentSet.delete(value)
    } else {
      currentSet.add(value)
    }
    saveTopics(Array.from(currentSet))
  }

  return (
    <OnBoardingContentContainer disableSubmitBtn={!selectedTopics?.length} {...props}>
      <div className={styles.TopicsContainer}>
        {topics.map(({ text, value }, idx) => (
          <TopicChip
            selected={selectedTopicsSet.has(value)}
            onClick={createChipClickHandler(value)}
            key={idx}
          >
            {text}
          </TopicChip>
        ))}
      </div>
    </OnBoardingContentContainer>
  )
}
