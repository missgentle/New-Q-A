import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Form, Checkbox, Space, Input } from 'antd'
import { useStore, TopicInfo, TopicOptionInfo } from '@/stores'

export default observer(
  (props: { topicInfo: TopicInfo; finished: boolean; index: number; showAlphaCode: boolean }) => {
    const { topicInfo, finished, index, showAlphaCode = false } = props || {}
    const { id, name, optionList, required } = topicInfo
    const { indexQuestionnaireStore } = useStore()
    const { validateValueFail } = indexQuestionnaireStore

    const [value, setValue] = useState<string>(topicInfo.value)
    const [showValueTip, setShowValueTip] = useState<boolean>(false) // 展示未选择提示

    useEffect(() => {
      setShowValueTip(validateValueFail && required && !value)
    }, [validateValueFail])

    const valueChangeHandler = (v) => {
      indexQuestionnaireStore.updateAnswerValue(id, v?.toString())
      setValue(v?.toString())
      setShowValueTip(false)
    }

    const getFormLabel = useMemo(() => {
      return (
        <span>
          {`${index + 1}. ${name}`}
          {showValueTip && <span className="error-tip">{' （请选择）'}</span>}
        </span>
      )
    }, [showValueTip])

    return (
      <Form.Item label={getFormLabel}>
        {finished ? (
          <Checkbox.Group value={value?.split(',')}>
            <Space direction="vertical" size={20}>
              {optionList?.map((option: TopicOptionInfo, index: number) => {
                return (
                  <Checkbox key={option?.id} value={option?.id}>
                    {(showAlphaCode ? String.fromCharCode(65 + index) + ' ' : '') + option?.name}
                  </Checkbox>
                )
              })}
            </Space>
          </Checkbox.Group>
        ) : (
          <Checkbox.Group
            defaultValue={value?.split(',')}
            onChange={(e) => {
              valueChangeHandler(e)
            }}
          >
            <Space direction="vertical" size={20}>
              {optionList?.map((option: TopicOptionInfo, index: number) => {
                return (
                  <Checkbox key={option?.id} value={option?.id}>
                    {(showAlphaCode ? String.fromCharCode(65 + index) + ' ' : '') + option?.name}
                  </Checkbox>
                )
              })}
            </Space>
          </Checkbox.Group>
        )}
      </Form.Item>
    )
  },
)
