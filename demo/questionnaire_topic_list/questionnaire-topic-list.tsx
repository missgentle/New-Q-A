import React from 'react'
import { observer } from 'mobx-react'
import { TopicInfo, TopicType } from '@/stores'
import scopedClasses from '@/utils/scopedClasses'
import { Form } from 'antd'
import FormRadio from './questionnaire-form-radio'
import FormCheckbox from './questionnaire-form-checkbox'
import FormTextArea from './questionnaire-form-textarea'

import './questionnaire-topic-list.scss'

const sc = scopedClasses('questionnaire-topic-list')

export default observer(
  (props: { topicList: TopicInfo[]; finished?: boolean; showAlphaCode?: boolean }) => {
    const { topicList = [], finished = true, showAlphaCode = false } = props || {}

    const formItemDisplay = (type: TopicType, item: TopicInfo, index: number) => {
      if (type === TopicType.RADIO) {
        return (
          <FormRadio
            topicInfo={item}
            finished={finished}
            index={index}
            showAlphaCode={showAlphaCode}
          />
        )
      }
      if (type === TopicType.CHECKBOX) {
        return (
          <FormCheckbox
            topicInfo={item}
            finished={finished}
            index={index}
            showAlphaCode={showAlphaCode}
          />
        )
      }
      if (type === TopicType.TEXTAREA) {
        return <FormTextArea topicInfo={item} finished={finished} index={index} />
      }
    }

    return (
      <div className={sc('container')}>
        <div className="content">
          <div className={sc('form')}>
            <Form layout="vertical" size="small" scrollToFirstError>
              {topicList?.map((item: TopicInfo, index) => {
                const { id, type } = item
                return (
                  <div id={'topic-' + (index + 1)} key={id}>
                    {formItemDisplay(type, item, index)}
                  </div>
                )
              })}
            </Form>
          </div>
        </div>
      </div>
    )
  },
)
