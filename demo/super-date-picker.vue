<template>
  <view class="super-date-picker-container">
    <u-cell-group>
      <u-cell-item
        :class="center ? 'cell-value-center' : ''"
        :style="{ height: `${barHeight}rpx` }"
        :title="title"
        :arrow="arrow"
        :arrow-direction="arrowDirection"
        :value="`${startTime} ~ ${endTime}`"
        @click="showPicker = true"
      >
        <u-icon
          v-if="showRightIcon"
          slot="right-icon"
          :name="rightIcon"
          size="32"
          color="#666"
        ></u-icon>
      </u-cell-item>
    </u-cell-group>
    <u-popup v-model="showPicker" mode="bottom" @open="open" @close="close">
      <view class="popup-container">
        <view class="popup-title">
          <view class="u-popup-cancel-btn" @click="close">取消</view>
          <view class="u-title">{{ pickerTitle }}</view>
          <view class="u-popup-sure-btn" @click="handleSelectConfirm"
            >确定</view
          >
        </view>
        <view class="select-time-display">
          <view
            @click="timeSwitch(0)"
            class="u-time-label"
            :style="{ color: timeIndex === 0 ? '#008fff' : '#666' }"
            >{{ startTimeDisplay }}</view
          >
          ~
          <view
            @click="timeSwitch(1)"
            class="u-time-label"
            :style="{ color: timeIndex === 1 ? '#008fff' : '#666' }"
            >{{ endTimeDisplay }}</view
          >
        </view>
        <view class="picker-sheet">
          <picker-view
            v-if="visible"
            class="mpvue-picker-view"
            :value="curData"
            :indicator-style="indicatorStyle"
            @change="bindChange"
          >
            <picker-view-column>
              <view class="item" v-for="(item, index) in years" :key="index"
                >{{ item }}年</view
              >
            </picker-view-column>
            <picker-view-column v-if="mode === 'month' || mode === 'date'">
              <view class="item" v-for="(item, index) in months" :key="index"
                >{{ item }}月</view
              >
            </picker-view-column>
            <picker-view-column v-if="mode === 'week'">
              <view class="item" v-for="(item, index) in weeks" :key="index"
                >第{{ item }}周</view
              >
            </picker-view-column>
            <picker-view-column v-if="mode === 'date'">
              <view class="item" v-for="(item, index) in days" :key="index"
                >{{ item }}日</view
              >
            </picker-view-column>
          </picker-view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script lang="ts">
import Vue from "vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeeksInYear from "dayjs/plugin/isoWeeksInYear";
import isLeapYear from "dayjs/plugin/isLeapYear";
dayjs.locale("zh-cn"); // 本地化语言配置会影响周的计算方式
dayjs.extend(weekOfYear);
dayjs.extend(isoWeeksInYear);
dayjs.extend(isLeapYear);

export default Vue.extend({
  name: "super-date-picker",
  props: {
    mode: {
      type: String,
      default: "date", // 可选模式 date | week | month | year
    },
    maxRange: {
      type: Number,
      default: 0, // 最大区间长度 根据mode不同代表的单位不同 0表示无区间长度限制
    },
    barHeight: {
      type: Number,
      default: 100,
    },
    title: {
      type: String,
      default: "时间段",
    },
    center: {
      type: Boolean,
      default: false,
    },
    arrow: {
      type: Boolean,
      default: true,
    },
    arrowDirection: {
      type: String,
      default: "right",
    },
    showRightIcon: {
      type: Boolean,
      default: false,
    },
    rightIcon: {
      type: String,
      default: "calendar",
    },
    // 默认开始时间 只认YYYY-MM-DD格式
    defaultStartTime: {
      type: String,
      default: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
    },
    // 默认结束时间 只认YYYY-MM-DD格式
    defaultEndTime: {
      type: String,
      default: dayjs().format("YYYY-MM-DD"),
    },
    pickerTitle: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      visible: false,
      showPicker: false,
      startTime: "开始时间", // 最终选定的开始时间
      endTime: "结束时间", // 最终选定的结束时间
      startTimeDisplay: "开始时间", // picker当前选择的开始时间
      endTimeDisplay: "结束时间", // picker当前选择的结束时间
      timeIndex: 0, // 0表示正在选开始时间 1表示正在选结束时间
      years: Array.from(Array(dayjs().year()), (v, k) => k + 1).slice(1999), // 年份列表 起始年份2000,
      months: Array.from(Array(12), (v, k) => k + 1),
      weeks: Array.from(Array(53), (v, k) => k + 1), // ISO周数最多一年可能有53周
      days: Array.from(Array(31), (v, k) => k + 1),
      year: dayjs().year(),
      month: dayjs().month() + 1,
      week: dayjs().week(),
      day: dayjs().date(),
      curData: [dayjs().year(), dayjs().month(), dayjs().date()], // 选项的index值组成的数组; 数字大于可选项长度时会选择最后一项
      indicatorStyle: `height: 100rpx;`, // 选中框的样式; 直接赋值会有警告
    };
  },
  mounted() {
    // 初始化
    this.bindModeChange(this.mode);
    this.visible = true;
    this.timeSwitch(0);
  },
  watch: {
    // 监听模式 改变时 初始化
    mode(newMode) {
      this.bindModeChange(newMode);
    },
  },
  methods: {
    open() {
      // 恢复正确显示
      this.startTimeDisplay = this.startTime;
      this.endTimeDisplay = this.endTime;
      this.timeSwitch(0);
    },
    close() {
      this.showPicker = false;
    },
    bindModeChange(mode: string) {
      // 默认值是否合法
      const startTimeIsValid = dayjs(
        this.defaultStartTime,
        "YYYY-MM-DD",
        true
      ).isValid();
      const endTimeIsValid = dayjs(
        this.defaultEndTime,
        "YYYY-MM-DD",
        true
      ).isValid();
      // 不同模式下的初始值设置
      switch (mode) {
        case "date":
          this.startTime = this.startTimeDisplay = startTimeIsValid
            ? dayjs(this.defaultStartTime).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD");
          this.endTime = this.endTimeDisplay = endTimeIsValid
            ? dayjs(this.defaultEndTime).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD");
          break;
        case "week":
          this.startTime = this.startTimeDisplay = startTimeIsValid
            ? dayjs(this.defaultStartTime).year() +
              "年第" +
              dayjs(this.defaultStartTime).week() +
              "周"
            : dayjs().year() + "年第" + dayjs().week() + "周";
          this.endTime = this.endTimeDisplay = endTimeIsValid
            ? dayjs(this.defaultEndTime).year() +
              "年第" +
              dayjs(this.defaultEndTime).week() +
              "周"
            : dayjs().year() + "年第" + dayjs().week() + "周";
          break;
        case "month":
          this.startTime = this.startTimeDisplay = startTimeIsValid
            ? dayjs(this.defaultStartTime).format("YYYY年MM月")
            : dayjs().format("YYYY年MM月");
          this.endTime = this.endTimeDisplay = endTimeIsValid
            ? dayjs(this.defaultEndTime).format("YYYY年MM月")
            : dayjs().format("YYYY年MM月");
          break;
        case "year":
          this.startTime = this.startTimeDisplay = startTimeIsValid
            ? dayjs(this.defaultStartTime).format("YYYY年")
            : dayjs().format("YYYY年");
          this.endTime = this.endTimeDisplay = endTimeIsValid
            ? dayjs(this.defaultEndTime).format("YYYY年")
            : dayjs().format("YYYY年");
          break;
      }
    },
    timeSwitch(index: number) {
      // 切换选择开始时间/结束时间
      this.timeIndex = index;
      const date = index === 0 ? this.startTimeDisplay : this.endTimeDisplay;
      let indexArr = [];
      switch (this.mode) {
        case "date":
          indexArr = date.split("-");
          this.curData = [
            this.years.indexOf(Number(indexArr[0])),
            this.months.indexOf(Number(indexArr[1])),
            this.days.indexOf(Number(indexArr[2])),
          ];
          break;
        case "week":
          indexArr = date.replace("周", "").split("年第");
          this.curData = [
            this.years.indexOf(Number(indexArr[0])),
            this.weeks.indexOf(Number(indexArr[1])),
          ];
          break;
        case "month":
          indexArr = date.replace("月", "").split("年");
          this.curData = [
            this.years.indexOf(Number(indexArr[0])),
            this.months.indexOf(Number(indexArr[1])),
          ];
          break;
        case "year":
          this.curData = [this.years.indexOf(Number(date.replace("年", "")))];
          break;
      }
    },
    bindChange(e: any) {
      // 选项的index值组成的数组
      const val = (this.curData = e.detail.value);

      switch (this.mode) {
        case "date":
          this.year = this.years[val[0]];
          this.month = this.months[val[1]];
          this.day = this.days[val[2]];
          break;
        case "week":
          this.year = this.years[val[0]];
          this.week = this.weeks[val[1]];
          break;
        case "month":
          this.year = this.years[val[0]];
          this.month = this.months[val[1]];
          break;
        case "year":
          this.year = this.years[val[0]];
          break;
      }

      // 选择不同月份显示的可选天数不同
      let dayCount = 31;
      switch (this.month) {
        case 2:
          dayCount =
            this.year % 400 === 0 ||
            (this.year % 4 === 0 && this.year % 100 !== 0)
              ? 29
              : 28;
          break;
        case 4:
        case 6:
        case 9:
        case 11:
          dayCount = 30;
          break;
        default:
          dayCount = 31;
      }
      this.days = Array.from(Array(dayCount), (v, k) => k + 1);

      // 选择不同年份可选的周数不同
      this.weeks = Array.from(
        Array(dayjs(this.year).isoWeeksInYear()),
        (v, k) => k + 1
      );

      // 处理选择今年的情况
      if (this.year == dayjs().year()) {
        // 最多可选当前月份
        this.months = Array.from(Array(dayjs().month() + 1), (v, k) => k + 1);
        // 最多可选当前周
        this.weeks = Array.from(Array(dayjs().week()), (v, k) => k + 1);
        // 如果选择的是当前月份，最多可选当日
        if (this.month == dayjs().month() + 1) {
          this.days = Array.from(Array(dayjs().date()), (v, k) => k + 1);
        }
      } else {
        this.months = Array.from(Array(12), (v, k) => k + 1);
      }

      // 所选时间预览
      const tempDayjs = dayjs()
        .set("year", this.year)
        .set("month", this.month - 1)
        .set("date", this.day);
      switch (this.mode) {
        case "date":
          this.timeIndex === 0
            ? (this.startTimeDisplay = tempDayjs.format("YYYY-MM-DD"))
            : (this.endTimeDisplay = tempDayjs.format("YYYY-MM-DD"));
          break;
        case "week":
          this.timeIndex === 0
            ? (this.startTimeDisplay = `${this.year}年第${this.week}周`)
            : (this.endTimeDisplay = `${this.year}年第${this.week}周`);
          break;
        case "month":
          this.timeIndex === 0
            ? (this.startTimeDisplay = tempDayjs.format("YYYY年MM月"))
            : (this.endTimeDisplay = tempDayjs.format("YYYY年MM月"));
          break;
        case "year":
          this.timeIndex === 0
            ? (this.startTimeDisplay = tempDayjs.format("YYYY年"))
            : (this.endTimeDisplay = tempDayjs.format("YYYY年"));
          break;
      }
    },
    handleSelectConfirm() {
      if (this.startTimeDisplay == "开始时间") {
        uni.showToast({
          title: "请选择开始时间",
          icon: "none",
        });
        return;
      }
      if (this.endTimeDisplay == "结束时间") {
        uni.showToast({
          title: "请选择结束时间",
          icon: "none",
        });
        return;
      }

      let tempStartTime = this.startTimeDisplay;
      let tempEndTime = this.endTimeDisplay;
      let indexArrSt,
        indexArrEt = [];
      switch (this.mode) {
        case "week":
          indexArrSt = this.startTimeDisplay.replace("周", "").split("年第");
          indexArrEt = this.endTimeDisplay.replace("周", "").split("年第");
          tempStartTime = dayjs()
            .year(Number(indexArrSt[0]))
            .week(Number(indexArrSt[1]))
            .startOf("week")
            .format("YYYY-MM-DD");
          tempEndTime = dayjs()
            .year(Number(indexArrEt[0]))
            .week(Number(indexArrEt[1]))
            .endOf("week")
            .format("YYYY-MM-DD");
          break;
        case "month":
          indexArrSt = this.startTimeDisplay.replace("月", "").split("年");
          indexArrEt = this.endTimeDisplay.replace("月", "").split("年");
          tempStartTime = dayjs()
            .year(Number(indexArrSt[0]))
            .month(Number(indexArrSt[1]) - 1)
            .startOf("month")
            .format("YYYY-MM-DD");
          tempEndTime = dayjs()
            .year(Number(indexArrEt[0]))
            .month(Number(indexArrEt[1]) - 1)
            .endOf("month")
            .format("YYYY-MM-DD");
          break;
        case "year":
          tempStartTime = dayjs()
            .year(Number(this.startTimeDisplay.replace("年", "")))
            .startOf("year")
            .format("YYYY-MM-DD");
          tempEndTime = dayjs()
            .year(Number(this.endTimeDisplay.replace("年", "")))
            .endOf("year")
            .format("YYYY-MM-DD");
          break;
      }

      if (dayjs(tempStartTime) > dayjs(tempEndTime)) {
        uni.showToast({
          title: "开始时间需早于结束时间",
          icon: "none",
        });
        return;
      } else if (this.maxRange) {
        const unit =
          this.mode === "year"
            ? "年"
            : this.mode === "month"
            ? "个月"
            : this.mode === "week"
            ? "周"
            : "天";
        // 有限制区间长度
        if (
          dayjs(tempEndTime).diff(
            tempStartTime,
            this.mode === "year" ||
              this.mode === "month" ||
              this.mode === "week"
              ? this.mode
              : "day"
          ) >
          this.maxRange - 1
        ) {
          uni.showToast({
            title: `时间区间不能超过${this.maxRange}${unit}`,
            icon: "none",
          });
          return;
        }
      }
      this.startTime = this.startTimeDisplay;
      this.endTime = this.endTimeDisplay;
      const obj = {
        startTime: tempStartTime,
        endTime: tempEndTime,
        isClose: false, // 非取消关闭
      };
      this.$emit("confirm", obj);
      this.close();
    },
  },
});
</script>

<style scoped lang="scss">
.super-date-picker-container {
  .cell-value-center {
    ::v-deep .u-cell__value {
      text-align: center !important;
      color: #666 !important;
    }
  }

  .popup-container {
    height: 500rpx;
    background: #fff;
    .popup-title {
      height: 90rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .u-title {
        font-size: 30rpx;
      }
      .u-popup-cancel-btn {
        color: #999;
        padding: 0 30rpx;
        height: 90rpx;
        line-height: 90rpx;
      }
      .u-popup-sure-btn {
        color: #008fff;
        padding: 0 30rpx;
        height: 90rpx;
        line-height: 90rpx;
      }
    }
    .select-time-display {
      height: 100rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 34rpx;
      .u-time-label {
        color: #ccc;
        height: 60rpx;
        line-height: 60rpx;
        border-bottom: 1px solid #ccc;
        text-align: center;
        padding: 0 10rpx;
        margin: 0 40rpx;
      }
    }
    .picker-sheet {
      height: 310rpx;
      .mpvue-picker-view {
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 1);
        .item {
          text-align: center;
          width: 100%;
          height: 100rpx;
          line-height: 100rpx;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 30rpx;
        }
      }
    }
  }
}
</style>
