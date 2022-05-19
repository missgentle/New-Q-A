import React, { useState, useEffect } from 'react'
import { Prompt, useLocation, useHistory } from 'react-router-dom'
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
  onOk: () => void
  onCancel: () => void
  when: boolean
}) => {
  const {
    icon = null,
    title = '提示',
    content = '要在离开前对填写的信息进行保存吗？',
    centered = true,
    closable = true,
    okText = '保存',
    cancelText = '放弃修改并离开',
    strict = true,
    onOk,
    onCancel,
    when,
  } = props || {}

  const Location = useLocation()
  const History = useHistory()
  const [goLocation, setGoLocation] = useState(null)

  useEffect(() => {
    !when && goLocation && History.push(goLocation)
  }, [when, goLocation])

  useEffect(() => {
    return () => {
      setGoLocation(null)
    }
  }, [])

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
            onOk()
            setGoLocation(location)
          },
          onCancel: (valueOrFn) => {
            if (valueOrFn?.triggerCancel) return // 点×直接关闭
            onCancel?.()
            setGoLocation(location)
            valueOrFn() // 不点×直接调用关闭方法
          },
        })
        return false
      }}
      when={when}
    />
  )
}
