import React from 'react'
import { observer } from 'mobx-react'
import { DiagnosisTopicInfo, TopicInfo, TopicType } from '@/stores'
import scopedClasses from '@/utils/scopedClasses'
import { Form } from 'antd'
import SecondaryTitle from './secondary-title'
import FormRadio from './questionnaire-form-radio'
import FormCheckbox from './questionnaire-form-checkbox'
import FormTextArea from './questionnaire-form-textarea'

import './questionnaire-topic-list.scss'

const sc = scopedClasses('questionnaire-topic-list')

export default observer(
  (props: { topicList: DiagnosisTopicInfo[]; finished?: boolean; showAlphaCode?: boolean }) => {
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
              {topicList?.map((module: DiagnosisTopicInfo, moduleIndex) => {
                const { titleName, questionList } = module
                return (
                  <div id={'title-' + (moduleIndex + 1)} key={moduleIndex}>
                    <SecondaryTitle name={titleName} index={moduleIndex} />
                    {questionList?.map((topic: TopicInfo, index) => {
                      const { id, type } = topic
                      return (
                        <div id={'topic-' + (index + 1)} key={id}>
                          {formItemDisplay(type, topic, index)}
                        </div>
                      )
                    })}
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
