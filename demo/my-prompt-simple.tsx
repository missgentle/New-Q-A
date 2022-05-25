import React, { useEffect } from 'react'
import { Prompt, useLocation } from 'react-router-dom'
import { Modal } from 'antd'

export default (props: {
  icon?: React.ReactNode
  title?: string | React.ReactNode
  content?: string | React.ReactNode
  centered?: boolean
  closable?: boolean
  okText?: React.ReactNode
  cancelText?: React.ReactNode
  strict?: boolean // 是否严格校验路由(如页面存在锚点时可设为false)
  onOk: (location) => void
  onCancel?: (location) => void
  when: boolean
}) => {
  const {
    icon = null,
    title = '提示',
    content = '填写的信息尚未保存，确定离开此页面？',
    centered = true,
    closable = true,
    okText = '确定',
    cancelText = '取消',
    strict = true,
    onOk,
    onCancel,
    when,
  } = props || {}

  const Location = useLocation()

  useEffect(() => {
    window.addEventListener('beforeunload', beforeunloadHandler)
    return () => {
      window.removeEventListener('beforeunload', beforeunloadHandler)
    }
  }, [when])

  const beforeunloadHandler = (event) => {
    if (!when) return true // 无修改时允许刷新或关闭窗口
    event.preventDefault()
    event.returnValue = ''
  }

  return (
    <Prompt
      message={(location) => {
        // 非严格模式：避免锚点改变触发提示
        if (!strict && location.pathname === Location.pathname) return true
        Modal.confirm({
          icon,
          title,
          content,
          centered,
          closable,
          okText,
          cancelText,
          onOk: () => {
            onOk(location)
          },
          onCancel: (valueOrFn) => {
            if (valueOrFn?.triggerCancel) return // 点×直接关闭
            onCancel?.(location)
            valueOrFn() // 不点×直接调用关闭方法
          },
        })
        return false
      }}
      when={when}
    />
  )
}


/* 使用方法 */
/* 
<SelfPrompt
  onOk={(location) => {
    setOriginFormDetail(formValues) // isSame=>true
    setTimeout(() => { History.push(location) }, 0)
  }}
  when={!isSame}
/> 
*/
