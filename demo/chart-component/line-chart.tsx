import React, { useState, useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import { Chart } from '@antv/g2'
import { GroupItem, Offset } from '@/stores'

interface AxisOption {
  labelFill?: string
  labelFontSize?: number
  labelFontWeight?: number
  gridStroke?: string
  gridLineWidth?: number
  gridLineDash?: number[]
  lineStroke?: string
  lineLineWidth?: number
}

interface UnitOption {
  x?: number
  y?: number
  fill?: string
  fontSize?: number
  fontWeight?: number
}

interface LegendOption {
  position?: string
  maxItemWidth?: number
  itemSpacing?: number
  itemNameFill?: string
  itemNameFontSize?: number
  itemNameFontWeight?: number
  markerSymbol?: string
  markerSpacing?: number
  markerR?: number
  markerLineWidth?: number
  markerLineDash?: number[]
  pageMarkerInactiveFill?: string
  pageMarkerInactiveOpacity?: number
  pageMarkerFill?: string
  pageMarkerOpacity?: number
  pageMarkerSize?: number
  pageTextFill?: string
  pageTextFontSize?: number
}

interface TooltipOption {
  // 指示线
  crosshairsLineStroke?: string
  crosshairsLineWidth?: number
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
interface LineChartProps {
  className?: string
  height?: number // 高度
  data?: any // 数据源
  // 1.无分组对比时必须传"none", 此时一般需要showLegend传false
  // 2.data是数组&分组对比时需要, 优先级高于groupList, 此时默认不涉及平均值显示
  groupKey?: string
  // 1.无分组对比时(groupKey传"none")
  // 2.data是对象&分组对比时配置, 适用于分组字段固定的情景
  groupList?: GroupItem[]
  colors?: string[] // 颜色
  avgList?: GroupItem[] // 显示平均值时需要, 要与xTicks
  xTicks?: string[] // 横x轴刻度
  xKey?: string // 横x轴取值字段名
  yKey?: string // 纵y轴取值字段名
  xSuffix?: string // 横x轴的后缀, 会加在每个横坐标上
  xUnit?: string // 横x轴单位, 会展示在tooltip的title上, 但配合xTicks时才会显示在横轴末尾
  yUnit?: string // 纵y轴单位
  yUnitOffset?: Offset // 纵y轴单位偏移
  chartPadding?: number | number[] // chart内边距, 可以拉开图例与图表的距离
  showLegend?: boolean // 是否显示图例
  showPoint?: boolean // 线上是否显示节点
  lineShape?: string // 线条形状 曲线：smooth 虚线：dash 阶梯：hv
  xAxisOption?: AxisOption
  yAxisOption?: AxisOption
  yUnitOption?: UnitOption
  legendOption?: LegendOption
  tooltipOption?: TooltipOption
}

export default observer(
  ({
    className = '',
    height = 400,
    data = null,
    groupKey = '',
    groupList = null,
    colors = ['#1554FC', '#66C136'],
    avgList = null,
    xTicks = null,
    xSuffix = '',
    xUnit = '',
    yUnit = '',
    xKey = 'time',
    yKey = 'value',
    chartPadding = [30, 20, 20, 20],
    showLegend = true,
    showPoint = true,
    lineShape = '',
    xAxisOption = {
      labelFill: 'rgba(255,255,255,0.60)',
      labelFontSize: 24,
      labelFontWeight: 400,
      lineStroke: 'rgba(255,255,255,0.40)',
      lineLineWidth: 2,
    },
    yAxisOption = {
      labelFill: 'rgba(255,255,255,0.60)',
      labelFontSize: 24,
      labelFontWeight: 400,
      gridStroke: 'rgba(255,255,255,0.15)',
      gridLineWidth: 2,
      gridLineDash: [5, 5],
    },
    yUnitOption = { x: -50, y: -30, fill: 'rgba(255,255,255,0.60)', fontSize: 22, fontWeight: 400 },
    legendOption = {
      position: 'top-right',
      maxItemWidth: 300,
      itemSpacing: 24,
      itemNameFill: 'rgba(255,255,255,0.65)',
      itemNameFontSize: 24,
      itemNameFontWeight: 400,
      markerSymbol: 'hyphen',
      markerSpacing: 12,
      markerR: 13,
      markerLineWidth: 4,
      markerLineDash: [10, 5],
      pageMarkerInactiveFill: '#000',
      pageMarkerInactiveOpacity: 0.6,
      pageMarkerFill: '#fff',
      pageMarkerOpacity: 0.8,
      pageMarkerSize: 18,
      pageTextFill: '#ccc',
      pageTextFontSize: 22,
    },
    tooltipOption = {
      crosshairsLineStroke: 'rgba(255,255,255,0.45)',
      crosshairsLineWidth: 2,
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
  }: LineChartProps) => {
    const lineChart = useRef(null)
    const chartRef = useRef(null)
    const [dataList, setDataList] = useState<Array<any>>([])

    // 创建图表
    useEffect(() => {
      // 初始化
      lineChart.current = new Chart({
        container: chartRef.current || '',
        height: height,
        autoFit: true,
        appendPadding: chartPadding,
        supportCSSTransform: true,
      })
      // 数据
      lineChart.current.data(dataList)
      // 度量
      lineChart.current.scale({
        // 纵轴
        y: {
          nice: true,
          min: 0,
          maxTickCount: 6,
        },
        // 横轴
        x: xTicks
          ? {
              type: 'cat',
              ticks: xTicks,
            }
          : { type: 'cat', nice: true },
      })

      // 设置横轴
      lineChart.current.axis('x', {
        // 取消刻度标
        tickLine: null,
        // 刻度值
        label: {
          style: {
            fill: xAxisOption?.labelFill || 'rgba(255,255,255,0.60)',
            fontSize: xAxisOption?.labelFontSize || 24,
            fontWeight: xAxisOption?.labelFontWeight || 400,
          },
          // 最后一个加单位
          formatter: (text) => {
            if (xUnit && xTicks && text === xTicks[xTicks?.length - 1]) {
              return text + xSuffix + xUnit
            }
            return text + xSuffix
          },
        },
        // 坐标轴
        line: {
          style: {
            stroke: xAxisOption?.lineStroke || 'rgba(255,255,255,0.40)',
            lineWidth: xAxisOption?.lineLineWidth || 2,
          },
        },
      })

      // 设置纵轴
      lineChart.current.axis('y', {
        // 刻度值
        label: {
          style: {
            fill: yAxisOption?.labelFill || 'rgba(255,255,255,0.60)',
            fontSize: yAxisOption?.labelFontSize || 24,
            fontWeight: yAxisOption?.labelFontWeight || 400,
          },
        },
        // 分割线
        grid: {
          line: {
            style: {
              stroke: yAxisOption?.gridStroke || 'rgba(255,255,255,0.15)',
              lineWidth: yAxisOption?.gridLineWidth || 2,
              lineDash: yAxisOption?.gridLineDash || [5, 5],
            },
          },
        },
      })

      // 伪装y轴单位
      yUnit &&
        lineChart.current.annotation().text({
          content: yUnit,
          position: ['start', 'end'],
          top: true,
          style: {
            fill: yUnitOption?.fill || 'rgba(255,255,255,0.60)',
            fontSize: yUnitOption?.fontSize || 22,
            fontWeight: yUnitOption?.fontWeight || 400,
          },
          offsetX: yUnitOption?.x || -50,
          offsetY: yUnitOption?.y || -30,
        })

      // 图例
      lineChart.current.legend(
        showLegend && {
          position: legendOption?.position || 'top-right',
          maxItemWidth: legendOption?.maxItemWidth || 300,
          itemSpacing: legendOption?.itemSpacing || 24,
          itemName: {
            style: {
              fill: legendOption?.itemNameFill || 'rgba(255,255,255,0.85)',
              fontSize: legendOption?.itemNameFontSize || 24,
              fontWeight: legendOption?.itemNameFontWeight || 400,
            },
            // formatter: (text) => labelMap[text],
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
          marker: (name) => {
            const groupItem = groupList?.find((el) => el?.label === name)
            return {
              symbol: legendOption?.markerSymbol || 'hyphen',
              spacing: legendOption?.markerSpacing || 14,
              style: groupKey
                ? { r: legendOption?.markerR || 13, lineWidth: legendOption?.markerLineWidth || 4 }
                : groupItem
                ? { r: legendOption?.markerR || 13, lineWidth: legendOption?.markerLineWidth || 4 }
                : {
                    r: legendOption?.markerR || 13,
                    lineWidth: legendOption?.markerLineWidth || 4,
                    lineDash: legendOption?.markerLineDash || [10, 5],
                  },
            }
          },
        },
      )

      // tooltip
      lineChart.current.tooltip({
        // 显示指示线
        showCrosshairs: true,
        // 同时显示所有线的值
        shared: true,
        // 指示线的样式
        crosshairs: {
          type: 'x',
          line: {
            stroke: tooltipOption?.crosshairsLineStroke || 'rgba(255,255,255,0.45)',
            lineWidth: tooltipOption?.crosshairsLineWidth || 2,
          },
        },
        // 自定义tooltip的数值，格式化
        customItems: (items) => {
          for (let i = 0; i < items.length; i++) {
            items[i].value = items[i].value + yUnit
            // items[i].name = labelMap[items[i].name]
          }
          return items
        },
        // 自定义title，格式化
        title: (title) => (xUnit ? title + xSuffix + xUnit : title + xSuffix),
        // 自定义模板的对应样式
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
        ${groupKey === 'none' ? '{value}' : '{name}: {value}'}
      </li>
      `,
      })

      // 生成geometry，并设置坐标，color和动画
      lineChart.current
        .line()
        .position('x*y')
        .color('name', colors)
        .animate({
          enter: {
            animation: 'fade-in', // 动画名称
            easing: 'easeQuadIn', // 动画缓动效果
            delay: 100, // 动画延迟执行时间
            duration: 1000, // 动画执行时间
          },
          update: {
            duration: 1000, // 动画执行时间
          },
        })
        .shape('name', (val) => {
          if (avgList && avgList?.find((el) => el?.label === val)) {
            return 'dash'
          }
          return lineShape
        })
        .style('name', (val) => {
          if (avgList && avgList?.find((el) => el?.label === val)) {
            return { lineDash: [10, 5] }
          }
          return ''
        })

      // 绘制线上的节点
      showPoint &&
        lineChart.current
          .point()
          .position('x*y')
          .color('name', colors)
          .shape('circle')
          .animate({
            enter: {
              animation: 'fade-in', // 动画名称
              easing: 'easeQuadIn', // 动画缓动效果
              delay: 200, // 动画延迟执行时间
              duration: 1000, // 动画执行时间
            },
            update: {
              duration: 1000, // 动画执行时间
            },
          })

      // 渲染
      lineChart.current.render()
      // 清理并销毁，还原
      return () => {
        lineChart.current?.clear(true)
        lineChart.current?.destroy()
        lineChart.current = null
      }
    }, [xUnit, yUnit])

    // 这里的目的是生成标准化的，g2可识别的干净的数据（mobx数据不识别）
    useEffect(() => {
      if (!data) return
      if (groupKey) {
        const pureList = data?.map((item) => {
          return {
            name: item[groupKey] || '',
            x: item[xKey],
            y: item[yKey] === null ? null : Number(item[yKey]),
          }
        })
        setDataList(pureList)
        return
      }
      const newList = []
      groupList &&
        groupList?.map((item: GroupItem) => {
          const { key, label } = item || {}
          data?.map((el) => {
            newList.push({
              name: label,
              x: el[xKey],
              y: el[key] === null ? null : Number(el[key]),
            })
          })
        })
      avgList &&
        avgList?.map((item: GroupItem) => {
          const { key, label } = item || {}
          xTicks?.map((tick) => {
            newList.push({
              name: label,
              x: tick,
              y: data[key] === null ? null : Number(data[key]),
            })
          })
        })
      setDataList(newList)
      console.log(data)
    }, [data])

    // 创建图表更新
    useEffect(() => {
      lineChart.current?.changeData(dataList)
    }, [dataList])

    return <div ref={chartRef} className={className}></div>
  },
)
