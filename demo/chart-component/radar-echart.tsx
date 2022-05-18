import React from 'react'
import { observer } from 'mobx-react'
import ReactEcharts from 'echarts-for-react'
interface RadarItem {
  name?: string
  lineWidth?: number // 面积边缘线宽
  symbolSize?: number // 面积边缘线上的点的大小
  areaColor?: string // 面积颜色
  legendColor?: string // legend icon颜色
  legendBorderColor?: string // legend icon边框颜色
  legendBorderWidth?: number
}

interface LabelItem {
  name: string
  max?: number
  unit?: string
}

interface LabelStyle {
  fontSize?: string | number
  color?: string
  fontWeight?: number
  padding?: number[]
}

interface LegendOption {
  left?: number | string
  right?: number | string
  top?: number | string
  bottom?: number | string
  icon?: string
  orient?: string
  itemGap?: string | number // 图例间隔
  itemWidth?: string | number // 图例图形宽
  itemHeight?: string | number // 图例图形高
  textSize?: string | number // 图例文字大小
  textColor?: string // 图例文字颜色
}

interface TooltipOption {
  trigger?: string
  position?: string
  padding?: string | number
  backgroundColor?: string
  textSize?: string | number
  textColor?: string
  iconWidth?: number
  iconHeight?: number
}

interface SplitOption {
  splitNumber?: number // 蜘蛛网圈数
  splitAreaColor?: string // 蜘蛛网填充颜色
  splitLineColor?: string // 蜘蛛网线条颜色
  axisLineColor?: string // 蜘蛛网交叉线颜色
  axisLineType?: string | number[] // 蜘蛛网交叉线类型, number[]表虚线
}
interface RadarEChartProps {
  className?: string
  height?: number
  radius?: number // 雷达图半径
  center?: Array<string | number> // 雷达图中心位置
  labelList?: LabelItem[] // 各指标项的名称和最大值
  labelStyle?: LabelStyle // 指标项样式
  groupList?: RadarItem[] // 分组绘图对象
  valueList?: any[][] // 分组数值数组
  colors?: string[] // 应用于点和线的颜色
  legendOption?: LegendOption // legend配置
  tooltipOption?: TooltipOption // tooltip配置
  splitOption?: SplitOption // 蜘蛛网配置
}

export default observer(
  ({
    className = '',
    height = 400,
    radius = 150,
    center = ['50%', '50%'],
    labelList = [],
    groupList = null,
    valueList = null,
    colors = ['#6680FF', '#FFD226'],
    labelStyle = {
      fontSize: '24px',
      color: 'rgba(255,255,255,0.85)',
      fontWeight: 400,
      padding: [12, 8],
    },
    legendOption = {
      left: 'auto',
      right: 0,
      top: 'auto',
      bottom: 'auto',
      icon: 'rect',
      orient: 'vertical',
      itemGap: 15,
      itemWidth: 20,
      itemHeight: 20,
      textSize: 24,
      textColor: 'rgba(255,255,255,0.85)',
    },
    tooltipOption = {
      trigger: 'item',
      position: 'right',
      padding: 20,
      backgroundColor: 'rgba(21,28,36,0.80)',
      textSize: 24,
      textColor: 'rgba(255,255,255,0.85)',
      iconWidth: 20,
      iconHeight: 20,
    },
    splitOption = {
      splitNumber: 4,
      splitAreaColor: 'rgba(0,0,0,0)',
      splitLineColor: 'rgba(36,240,255,0.3)',
      axisLineType: [15, 15],
      axisLineColor: 'rgba(36,240,255,0.3)',
    },
  }: RadarEChartProps) => {
    const { left, right, top, bottom } = legendOption || {}
    const radarOption = {
      color: colors, // 应用于点和线的颜色
      radar: {
        indicator: labelList,
        radius, // 半径
        center, // 调整圆心位置
        axisName: {
          // formatter: '【{value}】',
          fontSize: labelStyle?.fontSize || '24px',
          color: labelStyle?.color || 'rgba(255,255,255,0.85)',
          fontWeight: labelStyle?.fontWeight || 400,
          padding: labelStyle?.padding || [12, 8],
        },
        splitNumber: splitOption?.splitNumber || 4, // 蜘蛛网圈数
        // 蜘蛛网分块颜色设置
        splitArea: {
          areaStyle: {
            color: splitOption?.splitAreaColor || 'rgba(0,0,0,0)',
          },
        },
        // 蜘蛛网线设置
        splitLine: {
          lineStyle: {
            color: splitOption?.splitLineColor || 'rgba(36,240,255,0.3)',
          },
        },
        // 交叉线
        axisLine: {
          lineStyle: {
            type: splitOption?.axisLineType || [15, 15], // 虚线
            color: splitOption?.axisLineColor || 'rgba(36,240,255,0.3)',
          },
        },
      },
      series: [
        {
          type: 'radar',
          data: groupList?.map((el, index) => {
            const { name, lineWidth, symbolSize, areaColor } = el || {}
            return {
              // 数据连线线宽
              lineStyle: {
                width: lineWidth || 2,
              },
              symbolSize: symbolSize || 12,
              // 面积颜色设置
              areaStyle: {
                color: areaColor || 'rgba(102,128,255,0.30)',
              },
              name: name,
              value:
                valueList[index]?.map((item, index) =>
                  Math.min(item, labelList[index]?.max || item),
                ) || [],
            }
          }),
          label: {
            show: false,
          },
        },
      ],
      legend: {
        left: left || left === 0 ? left : 'auto',
        right: right || 0,
        top: top || top === 0 ? top : 'auto',
        bottom: bottom || bottom === 0 ? bottom : 'auto',
        icon: legendOption?.icon || 'rect',
        orient: legendOption?.orient || 'vertical',
        itemGap: legendOption?.itemGap || 15,
        itemWidth: legendOption?.itemWidth || 20,
        itemHeight: legendOption?.itemHeight || 20,
        textStyle: {
          fontSize: legendOption?.textSize || 24,
          color: legendOption?.textColor || 'rgba(255,255,255,0.85)',
        },
        data: groupList?.map((el, i) => ({
          name: el?.name,
          itemStyle: {
            color: el?.legendColor || colors[i % colors?.length],
            borderColor: el?.legendBorderColor || colors[i % colors?.length],
            borderWidth: el?.legendBorderWidth || 2,
          },
        })),
      },
      tooltip: {
        trigger: tooltipOption?.trigger || 'item',
        position: tooltipOption?.position,
        padding: tooltipOption?.padding || 20,
        backgroundColor: tooltipOption?.backgroundColor || 'rgba(21,28,36,0.80)',
        textStyle: {
          fontSize: tooltipOption?.textSize || 24,
          color: tooltipOption?.textColor || 'rgba(255,255,255,0.85)',
        },
        formatter: (params) => {
          const { name, value = [], dataIndex, color } = params || {}
          return `
            <div>
              <span style="display:inline-block;margin-right:5px;width:${
                tooltipOption?.iconWidth || 20
              }px;height:${tooltipOption?.iconHeight || 20}px; 
                background-color:${color}">
              </span> ${name}
              ${value
                ?.map((v, index) => {
                  const label = labelList[index]?.name || ''
                  const value =
                    Number(v) === labelList[index]?.max ? valueList[dataIndex][index] : v
                  const unit = labelList[index]?.unit || ''
                  return '<div>' + label + ' : ' + value + ' ' + unit + '</div>'
                })
                ?.join('')}
            </div>
          `
        },
      },
    }

    return <ReactEcharts className={className} style={{ height }} option={radarOption} />
  },
)
