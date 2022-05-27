/**
 * 超时自动登出
 */
import dayjs from 'dayjs'
import { Storage, STORAGE_KEYS } from '@/service/storage'
import { httpLogOut } from '@/service/http_request'
import { throttle } from 'lodash'

const DEFAULT_DELAY_TIME = 1 * 60 * 1000 // 每分钟去询问一次是否超时

const setLastTime = throttle(() => {
  Storage.set(STORAGE_KEYS.LAST_OPERATION_TIME, dayjs().valueOf())
}, 5000)

export const listenUserOperation = () => {
  Storage.set(STORAGE_KEYS.LAST_OPERATION_TIME, dayjs().valueOf())
  document.addEventListener('mousemove', setLastTime)
  document.addEventListener('mousedown', setLastTime)
  document.addEventListener('mousewheel', setLastTime)
  document.addEventListener('keydown', setLastTime)
  return () => {
    document.removeEventListener('mousemove', setLastTime)
    document.removeEventListener('mousedown', setLastTime)
    document.removeEventListener('mousewheel', setLastTime)
    document.removeEventListener('keydown', setLastTime)
  }
}

export const autoLogoutCheckInterval = () => {
  // 超时校验
  const timer = setInterval(() => {
    const lastTime = Storage.get(STORAGE_KEYS.LAST_OPERATION_TIME)
    const userId = Storage.get(STORAGE_KEYS.USER_ID)
    if (userId && lastTime && dayjs(lastTime).add(30, 'minute').isBefore(dayjs())) {
      // 退出登录
      httpLogOut()
      Storage.remove(STORAGE_KEYS.USER_ID)
      timer && clearInterval(timer)
      // location.reload()
    }
  }, DEFAULT_DELAY_TIME)
  return timer
}

/* 
* 使用
let removelistenUserOperation = null
let autoLogoutCheckTimer = null

  const userId = useMemo(() => {
    return Storage.get(STORAGE_KEYS.USER_ID)
  }, [Location])

  useEffect(() => {
    if (userId) {
      // 获取当前用户信息
      authDataStore.getUserInfo()
      // 长时间不操作自动退出
      removelistenUserOperation = listenUserOperation()
      autoLogoutCheckTimer = autoLogoutCheckInterval()
    }
    return () => {
      authDataStore.setUserInfo(null)
      removelistenUserOperation?.()
      autoLogoutCheckTimer && clearInterval(autoLogoutCheckTimer)
    }
  }, [userId])

  const handleStorageChange = (e) => {
    if (e.key === STORAGE_KEYS.USER_ID) {
      location.reload()
    }
  }
  
  useEffect(() => {
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
*/

/* 
* 特殊页面需要阻止自动退出
useEffect(() => {
    !isLogin && window.location.replace(RoutePatterns.ROUTE_HOME)
    if (isLogin) {
      // 打开大屏时防止自动退出
      prevent_logout_timer = setInterval(() => {
        Storage.set(STORAGE_KEYS.LAST_OPERATION_TIME, dayjs().valueOf())
      }, 30000)
    }
    return () => {
      prevent_logout_timer && clearInterval(prevent_logout_timer)
    }
  }, [isLogin])
*/
