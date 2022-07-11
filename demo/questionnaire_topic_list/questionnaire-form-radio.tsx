import React, { useState, useEffect, useMemo } from 'react'
import { observer } from 'mobx-react'
import { Form, Radio, Input, Space } from 'antd'
import { useStore, TopicInfo, TopicOptionInfo } from '@/stores'

export default observer(
  (props: { topicInfo: TopicInfo; finished: boolean; index: number; showAlphaCode: boolean }) => {
    const { topicInfo, finished, index, showAlphaCode = false } = props || {}
    const { id, name, optionList, required } = topicInfo
    const { indexQuestionnaireStore } = useStore()
    const { validateValueFail, validateRemarkFail } = indexQuestionnaireStore

    const [value, setValue] = useState<string>(topicInfo.value)
    const [remark, setRemark] = useState<string>(topicInfo.remark)
    const [remarkRequiredId, setRemarkRequiredId] = useState<string>('') // 需要填写备注项的id
    const [showRemarkTip, setShowRemarkTip] = useState<boolean>(false) // 展示未填写备注提示
    const [showValueTip, setShowValueTip] = useState<boolean>(false) // 展示未选择提示

    useEffect(() => {
      optionList?.some((item) => {
        if (item.remarkRequired) return setRemarkRequiredId(item.id)
      })
    }, [optionList])

    useEffect(() => {
      setShowRemarkTip(
        (validateValueFail || validateRemarkFail) && value === remarkRequiredId && !remark,
      )
      setShowValueTip(validateValueFail && required && !value)
    }, [validateValueFail, validateRemarkFail])

    const valueChangeHandler = (e) => {
      const value = e.target.value
      if (remarkRequiredId && value !== remarkRequiredId) {
        indexQuestionnaireStore.updateAnswerRemark(id, '')
        setRemark('')
      }
      indexQuestionnaireStore.updateAnswerValue(id, value)
      setValue(value)
      setShowRemarkTip(false)
      setShowValueTip(false)
    }

    const remarkChangeHandler = (e) => {
      const value = e.target.value
      indexQuestionnaireStore.updateAnswerRemark(id, value)
      setRemark(value)
      setShowRemarkTip(!value)
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
          <Radio.Group value={value}>
            <Space direction="vertical" size={20}>
              {optionList?.map((option: TopicOptionInfo, index: number) => {
                return (
                  <Radio key={option?.id} value={option?.id}>
                    {(showAlphaCode ? String.fromCharCode(65 + index) + ' ' : '') + option?.name}
                    {option?.remarkRequired && value === option?.id && (
                      <div className="remark-container">{remark}</div>
                    )}
                  </Radio>
                )
              })}
            </Space>
          </Radio.Group>
        ) : (
          <Radio.Group
            defaultValue={value}
            onChange={(e) => {
              valueChangeHandler(e)
            }}
          >
            <Space direction="vertical" size={20}>
              {optionList?.map((option: TopicOptionInfo, index: number) => {
                return (
                  <Radio key={option?.id} value={option?.id}>
                    {(showAlphaCode ? String.fromCharCode(65 + index) + ' ' : '') + option?.name}
                    {option?.remarkRequired && value === option?.id && (
                      <>
                        <span className="required-text"></span>
                        <Input
                          className={showRemarkTip ? 'error-input' : 'normal-input'}
                          maxLength={option?.remarkMaxLength}
                          placeholder="请输入"
                          defaultValue={remark}
                          onBlur={(e) => {
                            remarkChangeHandler(e)
                          }}
                        />
                      </>
                    )}
                    {showRemarkTip && option?.remarkRequired && (
                      <span className="error-tip">请填写具体内容</span>
                    )}
                  </Radio>
                )
              })}
            </Space>
          </Radio.Group>
        )}
      </Form.Item>
    )
  },
)
