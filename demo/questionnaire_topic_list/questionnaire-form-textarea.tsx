import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Form, Input } from 'antd'
import { useStore, TopicInfo } from '@/stores'

const { TextArea } = Input

export default observer((props: { topicInfo: TopicInfo; finished: boolean; index: number }) => {
  const { topicInfo, finished, index } = props || {}
  const { id, name, minLength, maxLength, required } = topicInfo
  const { indexQuestionnaireStore } = useStore()
  const { validateValueFail } = indexQuestionnaireStore
  const [value, setValue] = useState<string>(topicInfo.value)
  const [showValueTip, setShowValueTip] = useState<boolean>(false) // 展示未填写提示

  useEffect(() => {
    setShowValueTip(validateValueFail && required && !value)
  }, [validateValueFail])

  const valueChangeHandler = (e) => {
    const value = e.target.value
    indexQuestionnaireStore.updateAnswerValue(id, value)
    setValue(value)
    setShowValueTip(!value)
  }

  const getFormLabel = useMemo(() => {
    return (
      <span>
        {`${index + 1}. ${name}`}
        {showValueTip && <span className="error-tip">{' （请填写）'}</span>}
      </span>
    )
  }, [showValueTip])

  return (
    <Form.Item label={getFormLabel}>
      {finished ? (
        <div className="textarea-container">{value}</div>
      ) : (
        <TextArea
          rows={4}
          className={showValueTip ? 'error-textarea' : 'normal-textarea'}
          showCount
          minLength={minLength}
          maxLength={maxLength}
          placeholder="请输入"
          defaultValue={value}
          onBlur={(e) => {
            valueChangeHandler(e)
          }}
        />
      )}
    </Form.Item>
  )
})
