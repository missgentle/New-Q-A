import React, { useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { SimpleItem } from '@/stores'
import { Chart, registerInteraction } from '@antv/g2'

interface LegendOption {
  layout?: string
  position?: string
  legendWidth?: number
  offsetX?: number
  itemHeight?: number
  itemNameFill?: string
  itemNameFontSize?: number
  itemNameFontWeight?: number
  itemValueFill?: string
  itemValueFontSize?: number
  itemValueFontWeight?: number
  markerSymbol?: string
  markerSpacing?: number
  markerR?: number
  pageMarkerInactiveFill?: string
  pageMarkerInactiveOpacity?: number
  pageMarkerFill?: string
  pageMarkerOpacity?: number
  pageMarkerSize?: number
  pageTextFill?: string
  pageTextFontSize?: number
}

interface TooltipOption {
  // 容器
  opacity?: number
  background?: string
  boxShadow?: string
  borderRadius?: string
  // title
  titleColor?: string
  titleFontSize?: string
  titleFontWeight?: number
  titleMarginBottom?: string
  // item
  itemColor?: string
  itemOpacity?: number
  itemFontSize?: string
  itemFontWeight?: number
  itemMarginBottom?: string
}

interface LabelOption {
  position?: string
  autoRotate?: boolean
  offset?: number
  fill?: string
  fontSize?: number
  fontWeight?: number
}
interface RingChartProps {
  className?: string
  height?: number // 高度
  data?: SimpleItem[] // 数据源
  nameKey?: string
  valueKey?: string // 实际数量,
  percentKey?: string // 百分比数, 仅用于显示, 绘图实际百分比会自行计算
  decimal?: boolean // 百分比是否为小数
  colors?: string[]
  unit?: string
  innerRadius?: number // 内圆半径 0~1, 设0就是饼图
  showLabel?: boolean // 是否展示蜘蛛腿标签
  showLegendValue?: boolean // 是否展示Legend数值
  chartPadding?: number | number[] // chart内边距, 可以拉开图例与图表的距离, 调整环的大小
  legendOption?: LegendOption
  tooltipOption?: TooltipOption
  labelOption?: LabelOption
}

export default observer(
  ({
    className = '',
    height = 400,
    data = null,
    nameKey = 'name',
    valueKey = 'value',
    percentKey = 'percent',
    decimal = false,
    colors = ['rgba(36,240,255,0.65)', 'rgba(183,183,183,0.45)', 'rgba(255,51,51,0.45)'],
    unit = '',
    innerRadius = 0.6,
    showLabel = true,
    showLegendValue = true,
    chartPadding = [80, 100, 80, 50],
    legendOption = {
      layout: 'vertical',
      position: 'right',
      legendWidth: 240,
      offsetX: -50,
      itemHeight: 35,
      itemNameFill: 'rgba(255,255,255,0.85)',
      itemNameFontSize: 28,
      itemNameFontWeight: 400,
      itemValueFill: 'rgba(255,255,255,0.85)',
      itemValueFontSize: 28,
      itemValueFontWeight: 400,
      markerSymbol: 'circle',
      markerSpacing: 20,
      markerR: 8,
      pageMarkerInactiveFill: '#000',
      pageMarkerInactiveOpacity: 0.6,
      pageMarkerFill: '#fff',
      pageMarkerOpacity: 0.8,
      pageMarkerSize: 18,
      pageTextFill: '#ccc',
      pageTextFontSize: 22,
    },
    tooltipOption = {
      opacity: 0.8,
      background: '#000000',
      boxShadow: '0px 2px 8px 0px #151C24',
      borderRadius: '2px',
      titleColor: '#FFFFFF',
      titleFontSize: '26px',
      titleFontWeight: 400,
      titleMarginBottom: '20px',
      itemColor: '#FFFFFF',
      itemOpacity: 0.65,
      itemFontSize: '24px',
      itemFontWeight: 400,
      itemMarginBottom: '15px',
    },
    labelOption = {
      position: 'left',
      autoRotate: true,
      offset: 30,
      fill: '#FFFFFF',
      fontSize: 28,
      fontWeight: 400,
    },
  }: RingChartProps) => {
    const ringChart = useRef(null)
    const chartRef = useRef(null)
    const [dataList, setDataList] = useState<Array<SimpleItem>>([])

    // 创建图表
    useEffect(() => {
      // 初始化
      ringChart.current = new Chart({
        container: chartRef.current || '',
        height: height,
        autoFit: true,
        supportCSSTransform: true,
        appendPadding: chartPadding,
      })

      ringChart.current.coordinate('theta', {
        innerRadius,
        radius: 1,
      })

      // 初始数据
      ringChart.current.data(dataList)

      // 设置坐标轴
      ringChart.current.axis(false)

      // 图例
      ringChart.current.legend('name', {
        layout: legendOption?.layout || 'vertical',
        position: legendOption?.position || 'right',
        itemWidth: legendOption?.legendWidth || 240,
        maxItemWidth: legendOption?.legendWidth || 240,
        maxWidth: legendOption?.legendWidth || 240,
        offsetX: legendOption?.offsetX || -50,
        itemHeight: legendOption?.itemHeight || 35,
        itemName: {
          style: {
            fill: legendOption?.itemNameFill || 'rgba(255,255,255,0.85)',
            fontSize: legendOption?.itemNameFontSize || 28,
            fontWeight: legendOption?.itemNameFontWeight || 400,
          },
          formatter: (text) => (showLegendValue ? `${text}: ` : text),
        },
        itemValue: showLegendValue && {
          style: {
            fill: legendOption?.itemValueFill || 'rgba(255,255,255,0.85)',
            fontSize: legendOption?.itemValueFontSize || 28,
            fontWeight: legendOption?.itemValueFontWeight || 400,
          },
          formatter: (text, item) => {
            const tmpList = ringChart.current.getData()
            const res = tmpList.find((el) => el.name === item.value)
            return res?.value || res?.value === 0
              ? `${res?.value || 0}${unit}`
              : `${res?.percent || 0}%`
          },
        },
        // 图例分页 过多时才生效
        pageNavigator: {
          marker: {
            style: {
              // 非激活, 不可点击态时的填充色设置
              inactiveFill: legendOption?.pageMarkerInactiveFill || '#000',
              inactiveOpacity: legendOption?.pageMarkerInactiveOpacity || 0.6,
              // 默认填充色设置
              fill: legendOption?.pageMarkerFill || '#fff',
              opacity: legendOption?.pageMarkerOpacity || 0.8,
              size: legendOption?.pageMarkerSize || 18,
            },
          },
          text: {
            style: {
              fill: legendOption?.pageTextFill || '#ccc',
              fontSize: legendOption?.pageTextFontSize || 22,
            },
          },
        },
        marker: () => {
          const tmp = {
            symbol: legendOption?.markerSymbol || 'circle',
            spacing: legendOption?.markerSpacing || 20,
            style: { r: legendOption?.markerR || 8 },
          }
          return tmp
        },
        animate: true,
        animateOption: {
          appear: {
            animation: 'fade-in', // 动画名称
            easing: 'easeQuadIn', // 动画缓动效果
            delay: 2000, // 动画延迟执行时间
            duration: 1000, // 动画执行时间
          },
        },
      })

      // 设置tooltip
      ringChart.current.tooltip({
        // 不显示标记点
        showMarkers: false,
        domStyles: {
          // 容器
          'g2-tooltip': {
            opacity: tooltipOption?.opacity || 0.8,
            background: tooltipOption?.background || '#000000',
            boxShadow: tooltipOption?.boxShadow || '0px 2px 8px 0px #151C24',
            borderRadius: tooltipOption?.borderRadius || '2px',
          },
          // title
          'g2-tooltip-title': {
            color: tooltipOption?.titleColor || '#FFFFFF',
            fontSize: tooltipOption?.titleFontSize || '26px',
            fontWeight: tooltipOption?.titleFontWeight || 400,
            marginBottom: tooltipOption?.titleMarginBottom || '20px',
          },
        },
        // 容器模板
        containerTpl: `
        <div class="g2-tooltip">
          <div class="g2-tooltip-title"></div>
          <ul class="g2-tooltip-list">
          </ul>
        </div>`,
        // 列表项模板（为了方便直接设置style，但是容器不行，会覆盖）
        itemTpl: `
      <li style="
        color: ${tooltipOption?.itemColor || '#FFFFFF'};
        opacity: ${tooltipOption?.itemOpacity || '0.65'};
        font-size: ${tooltipOption?.itemFontSize || '24px'};
        font-weight: ${tooltipOption?.itemFontWeight || '400'};
        margin-bottom: ${tooltipOption?.itemMarginBottom || '15px'};
      ">
        {value}%
      </li>
      `,
      })

      // 设置交互区域
      registerInteraction('element-single-selected', {
        start: [{ trigger: 'element:mouseenter', action: 'element-single-selected:toggle' }],
      })
      ringChart.current.interaction('element-single-selected')

      // 生成geometry，设置坐标，color，分组和动画
      ringChart.current
        .interval()
        .position('percent')
        .color('name', colors)
        .label(showLabel && 'percent', (percent) => {
          return {
            position: labelOption?.position || 'left',
            autoRotate: labelOption?.autoRotate || true,
            offset: labelOption?.offset || 30,
            style: {
              fill: labelOption?.fill || '#FFFFFF',
              fontSize: labelOption?.fontSize || 28,
              fontWeight: labelOption?.fontWeight || 400,
            },
            content: () => {
              return `${percent}%`
            },
            animate: {
              enter: {
                animation: 'fade-in', // 动画名称
                easing: 'easeQuadIn', // 动画缓动效果
                delay: 100, // 动画延迟执行时间
                duration: 1000, // 动画执行时间
              },
            },
          }
        })
        .adjust('stack')
        .animate({
          enter: {
            easing: 'easeQuadIn', // 动画缓动效果
            delay: 100, // 动画延迟执行时间
            duration: 1000, // 动画执行时间
          },
          appear: {
            easing: 'easeQuadIn', // 动画缓动效果
            delay: 100, // 动画延迟执行时间
            duration: 1000, // 动画执行时间
          },
          update: {
            duration: 1000, // 动画执行时间
          },
        })

      // 渲染
      ringChart.current.render()

      // 清理销毁并还原
      return () => {
        ringChart.current?.clear(true)
        ringChart.current?.destroy()
        ringChart.current = null
      }
    }, [])

    // 这里的目的是生成标准化的，g2可识别的干净的数据（mobx数据不识别）
    useEffect(() => {
      if (!data) return
      const someData = data?.find((item) => item.percent)
      if (!someData) {
        setDataList([])
        return
      }
      const pureList = data?.map((item) => {
        return {
          name: item[nameKey],
          value: Number(item[valueKey]),
          percent: decimal ? Number(item[percentKey]) * 100 : Number(item[percentKey]),
        }
      })
      setDataList(pureList)
    }, [data])

    // 创建图表更新
    useEffect(() => {
      ringChart.current?.changeData(dataList)
    }, [dataList])

    return <div ref={chartRef} className={className}></div>
  },
)
