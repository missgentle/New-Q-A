import React, { useMemo } from 'react'
import { observer } from 'mobx-react'
import { SearchItemControlEnum, SearchItem, ActionItem } from '@/stores'
import { Form, Row, Col, Button, Input, Select, DatePicker } from 'antd'
import scopedClasses from '@/utils/scopedClasses'
import './search-bar.scss'

export enum SearchItemControlEnum {
  INPUT = 'input',
  SELECT = 'select',
  RANGE_PICKER = 'range-Picker',
}

export interface ActionItem {
  key: string
  text: string
  type: ButtonType
}

export interface SearchItem {
  key: string
  label: string
  type: SearchItemControlEnum
  optionList?: OptionItem[] | string[]
  initialValue?: any
  allowClear?: boolean
  disabledDate?: (currentDate) => boolean
  loading?: boolean
  showSearch?: boolean
  onChange?: (v: string) => void
}

export interface OptionItem {
  id?: string
  code?: string
  value?: any
  name?: string
  label?: string
}

const sc = scopedClasses('work-table-search-bar')
const { Option } = Select
const { RangePicker } = DatePicker
const defActionList: ActionItem[] = [
  {
    key: 'search',
    text: '查询',
    type: 'primary',
  },
  {
    key: 'reset',
    text: '重置',
    type: 'default',
  },
]
interface SearchBarProps {
  className?: string
  colNum?: number
  searchList?: SearchItem[]
  actionList?: ActionItem[]
  onSearch?: (info: any) => void
}

export default observer(
  ({
    className = '',
    colNum = 3,
    searchList = null,
    actionList = defActionList,
    onSearch = null,
  }: SearchBarProps) => {
    const [form] = Form.useForm()

    const searchListPro = useMemo(() => {
      const proList = []
      for (let i = 0; i < searchList?.length; i += colNum) {
        proList.push(searchList.slice(i, i + colNum))
      }
      return proList
    }, [searchList])

    const renderSearchItemControl = (searchItem: SearchItem) => {
      const {
        key,
        label,
        type,
        optionList,
        initialValue,
        allowClear,
        disabledDate,
        loading,
        showSearch,
        onChange,
      } = searchItem || {}
      switch (type) {
        case SearchItemControlEnum.INPUT:
          return (
            <Form.Item name={key} label={label} initialValue={initialValue}>
              <Input placeholder="请输入" allowClear={allowClear} />
            </Form.Item>
          )
        case SearchItemControlEnum.SELECT:
          return (
            <Form.Item name={key} label={label} initialValue={initialValue}>
              <Select
                getPopupContainer={(trigger) => trigger as HTMLElement}
                placeholder="请选择"
                allowClear={allowClear}
                showSearch={showSearch}
                loading={loading}
                onChange={onChange}
                onSearch={onChange}
              >
                {optionList?.map((item) =>
                  typeof item === 'string' ? (
                    <Option value={item} key={item}>
                      {item}
                    </Option>
                  ) : (
                    <Option
                      value={item?.id || item?.code || item?.value}
                      key={item?.id || item?.code || item?.value}
                    >
                      {item?.label || item?.name || item?.value}
                    </Option>
                  ),
                )}
              </Select>
            </Form.Item>
          )
        case SearchItemControlEnum.RANGE_PICKER:
          return (
            <Form.Item name={key} label={label} initialValue={initialValue}>
              <RangePicker style={{ width: '100%' }} disabledDate={disabledDate} />
            </Form.Item>
          )
        default:
          return null
      }
    }

    const onSearchAction = (action: ActionItem) => {
      if (action.key === 'reset') {
        form.resetFields()
      }
      const info = form?.getFieldsValue() || {}
      onSearch?.(info)
    }

    return (
      <div className={sc(`search ${className}`)}>
        <Form form={form} name="advanced_search" className={sc('search-form')}>
          {searchListPro?.map((rowItems, index) => (
            <Row gutter={40} key={index}>
              {rowItems?.map((searchItem) => (
                <Col span={24 / colNum} key={searchItem?.key}>
                  {renderSearchItemControl(searchItem)}
                </Col>
              ))}
            </Row>
          ))}
        </Form>
        <div className={sc('search-action')}>
          <div className={sc('search-action-item')}>
            {actionList.map((action) => (
              <Button
                className={sc('search-action-btn')}
                key={action?.key}
                type={action?.type}
                onClick={onSearchAction.bind(null, action)}
              >
                {action?.text}
              </Button>
            ))}
          </div>
        </div>
      </div>
    )
  },
)
