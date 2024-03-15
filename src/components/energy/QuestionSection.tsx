import { Button } from 'antd'
import styles from './Energy.module.sass'

const QuestionSection = () => {
  return (
    <div className={styles.QuestionWrapper}>
      <div className={styles.QuestionTitle}>Still have questions?</div>

      <Button type='primary' size='large' href='/c/ask' target='__blank' shape='round' ghost>
        Ask in chat
      </Button>
    </div>
  )
}

export default QuestionSection
