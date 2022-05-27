import React, { useState, useMemo, useEffect } from 'react'
import { observer } from 'mobx-react'
import { SimpleItem } from '@/stores'
import ReactEcharts from 'echarts-for-react'
import 'echarts-gl'
interface Ring3dEChartProps {
  className?: string
  height?: number // 高度
  data?: SimpleItem[] // 数据源
  nameKey?: string
  valueKey?: string // 实际数量,
  percentKey?: string // 百分比数, 仅用于显示, 绘图实际百分比会自行计算
  colors?: string[]
  unit?: string
  diameterRatio?: number // 内外径比
}

export default observer(
  ({
    className = '',
    height = 400,
    data = null,
    nameKey = 'name',
    valueKey = 'value',
    percentKey = 'percent',
    colors = [
      'rgba(38,138,255,0.8)',
      'rgba(30,214,255,0.8)',
      'rgba(165,51,51,0.8)',
      'rgba(145,54,205,0.8)',
      'rgba(255,210,38,0.8)',
      'rgba(102,128,255,0.8)',
      'rgba(198,229,230,0.8)',
      'rgba(60,212,149,0.8)',
    ],
    unit = '',
    diameterRatio = 0.7,
  }: Ring3dEChartProps) => {
    const [dataList, setDataList] = useState<Array<SimpleItem>>([])

    const getParametricEquation = (
      startRatio: number,
      endRatio: number,
      isSelected: boolean,
      isHovered: boolean,
      k: number,
    ) => {
      // 计算
      const midRatio = (startRatio + endRatio) / 2
      const startRadian = startRatio * Math.PI * 2
      const endRadian = endRatio * Math.PI * 2
      const midRadian = midRatio * Math.PI * 2
      // 如果只有一个扇形，则不实现选中效果。
      if (startRatio === 0 && endRatio === 1) {
        isSelected = false
      }
      // 通过扇形内径/外径的值，换算出辅助参数 k（默认值 1/3）
      k = typeof k !== 'undefined' ? k : 1 / 3
      // 计算选中效果分别在 x 轴、y 轴方向上的位移（未选中，则位移均为 0）
      const offsetX = isSelected ? Math.cos(midRadian) * 0.1 : 0
      const offsetY = isSelected ? Math.sin(midRadian) * 0.1 : 0
      // 计算高亮效果的放大比例（未高亮，则比例为 1）
      const hoverRate = isHovered ? 1.25 : 1
      // 返回曲面参数方程
      return {
        u: {
          min: -Math.PI,
          max: Math.PI * 3,
          step: Math.PI / 32,
        },
        v: {
          min: 0,
          max: Math.PI * 2,
          step: Math.PI / 20,
        },
        x: function (u, v) {
          if (u < startRadian) {
            return offsetX + Math.cos(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          if (u > endRadian) {
            return offsetX + Math.cos(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          return offsetX + Math.cos(u) * (1 + Math.cos(v) * k) * hoverRate
        },
        y: function (u, v) {
          if (u < startRadian) {
            return offsetY + Math.sin(startRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          if (u > endRadian) {
            return offsetY + Math.sin(endRadian) * (1 + Math.cos(v) * k) * hoverRate
          }
          return offsetY + Math.sin(u) * (1 + Math.cos(v) * k) * hoverRate
        },
        z: function (u, v) {
          if (u < -Math.PI * 0.5) {
            return Math.sin(u)
          }
          if (u > Math.PI * 2.5) {
            return Math.sin(u)
          }
          return Math.sin(v) > 0 ? 1 : -1
        },
      }
    }
    const getPie3D = (pieData: SimpleItem[], diameterRatio: number) => {
      const sumValue = pieData.reduce((preSum, curItem) => {
        return preSum + curItem?.value
      }, 0)
      const k = diameterRatio ? (1 - diameterRatio) / (1 + diameterRatio) : 1 / 3

      const series = pieData?.map((item, i) => {
        const start = pieData.reduce((preSum, curItem, index) => {
          return index < i ? preSum + curItem?.value : preSum
        }, 0)
        const end = pieData.reduce((preSum, curItem, index) => {
          return index <= i ? preSum + curItem?.value : preSum
        }, 0)
        return {
          type: 'surface',
          name: item?.name ? ` ${item?.name} ${item?.percent + '%'} ${item?.value}` : ` series${i}`,
          pieData: {
            ...item,
            startRatio: start / sumValue,
            endRatio: end / sumValue,
          },
          parametric: true,
          parametricEquation: getParametricEquation(
            start / sumValue,
            end / sumValue,
            false,
            false,
            k,
          ),
          wireframe: {
            show: false,
          },
          pieStatus: {
            selected: false,
            hovered: false,
            k: k,
          },
          itemStyle: {
            color: colors[i % colors.length],
          },
        }
      })

      // 准备待返回的配置项，把准备好的 legendData、series 传入。
      const option = {
        //animation: false,
        series,
        // 伪装图例单位
        title: {
          text: `单位：${unit}`,
          left: 'right',
          textStyle: {
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
          },
          right: 35,
        },
        legend: {
          type: 'scroll', // 图例翻页
          orient: 'vertical', // 图例排列方向
          right: 0,
          top: 50,
          itemGap: 30, // 图例间隔
          itemWidth: 20, // 图例图形宽
          itemHeight: 20, // 图例图形高
          data: series?.map((item) => item?.name),
          textStyle: {
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
          },
        },
        tooltip: {
          padding: 20,
          backgroundColor: 'rgba(21,28,36,0.80)',
          textStyle: {
            fontSize: 24,
            color: 'rgba(255,255,255,0.85)',
          },
          formatter: (params) => {
            if (params.seriesName !== 'mouseoutSeries') {
              return `
                <span style="display:inline-block;margin-right:5px;width:20px;height:20px; 
                  background-color:${params.color}">
                </span>
                ${option.series[params.seriesIndex].pieData?.name}<br/>
                ${option.series[params.seriesIndex].pieData?.percent}%<br/>
                ${option.series[params.seriesIndex].pieData?.value}${unit}<br/>
              `
            }
          },
        },
        xAxis3D: {
          min: -1,
          max: 1,
        },
        yAxis3D: {
          min: -1,
          max: 1,
        },
        zAxis3D: {
          min: -1,
          max: 1,
        },
        grid3D: {
          show: false, // 隐藏坐标系
          boxHeight: 10, // 三维笛卡尔坐标系在三维场景中的高度, 这里将影响环的厚度。
          bottom: '30%',
          width: '60%', // 组件的视图宽, 可调整图形位置
          viewControl: {
            autoRotate: true, // 自动旋转
            autoRotateAfterStill: 5, // 在鼠标静止操作后恢复自动旋转的时间间隔
            autoRotateSpeed: 15, // 旋转的角速度, 默认10, 即转一圈需要36s
            distance: 150, // 视角距离主体的距离, 默认200, 值越小视觉上图形越大
            minDistance: 150, // 这里固定最小距离, 避免缩放过大超出容器
            alpha: 30, // 俯视角度 默认20
          },
        },
      }
      return option
    }

    useEffect(() => {
      if (!data) return
      const pureList = data?.map((item) => {
        return {
          name: item[nameKey],
          value: item[valueKey],
          percent: item[percentKey],
        }
      })
      setDataList(pureList)
    }, [data])

    const ringOption = useMemo(() => {
      return getPie3D(dataList, diameterRatio)
    }, [dataList])

    return (
      <ReactEcharts
        className={className}
        style={{ height }}
        option={ringOption}
        notMerge={true}
        lazyUpdate={true}
        // onChartReady={this.onChartReadyCallback}
        // onEvents={EventsDict}
      />
    )
  },
)
