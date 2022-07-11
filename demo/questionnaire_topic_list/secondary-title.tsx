import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import scopedClasses from '@/utils/scopedClasses'

const sc = scopedClasses('questionnaire-topic-list')

const ChineseNumber = {
  1: '一、',
  2: '二、',
  3: '三、',
  4: '四、',
  5: '五、',
  6: '六、',
  7: '七、',
  8: '八、',
  9: '九、',
  10: '十、',
}

export default observer((props: { name: string; index: number }) => {
  const { name, index } = props || {}

  const getFormLabel = useMemo(() => {
    return <span>{`${ChineseNumber[index + 1] + name}`}</span>
  }, [name])

  return <div className={sc('secondary-title')}>{getFormLabel}</div>
})
