<template>
  <view>
    <u-popup v-model="isShow" mode="bottom" @change="popChange">
      <view class="super-date-picker-popup-container">
        <view class="popup-title">
          <view class="u-popup-cancel-btn" @click="close">取消</view>
          <view class="u-title">选择时间</view>
          <view class="u-popup-sure-btn" @click="handleSelectSure">确定</view>
        </view>
        <view class="select-time-display">
          <view
            @click="timeChose(0)"
            class="u-time-label"
            :style="{ color: timeIndex == 0 ? '#008fff' : '#666' }"
            >{{ startTimeDisplay }}</view
          >
          ~
          <view
            @click="timeChose(1)"
            class="u-time-label"
            :style="{ color: timeIndex == 1 ? '#008fff' : '#666' }"
            >{{ endTimeDisplay }}</view
          >
        </view>
        <view class="picker-sheet">
          <picker-view
            v-if="visible"
            class="mpvue-picker-view"
            :indicator-style="{ height: '100rpx' }"
            :value.async="curData"
            @change="bindChange"
          >
            <picker-view-column>
              <view class="item" v-for="(item, index) in years" :key="index"
                >{{ item }}年</view
              >
            </picker-view-column>
            <picker-view-column>
              <view class="item" v-for="(item, index) in months" :key="index"
                >{{ item }}月</view
              >
            </picker-view-column>
            <picker-view-column>
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

export default Vue.extend({
  name: "super-date-picker",
  props: {
    isShow: {
      type: Boolean,
      default: false,
    },
    mode: {
      type: String,
      default: "date",
    },
  },
  data() {
    const currentDate = this.getDate({
      format: true,
    });

    return {
      popcash: false,
      startTime: "",
      endTime: "",
      timeSelectActive: 1,
      currentDate: "",
      date: currentDate,
      visible: false,
      timeIndex: 0, // 0表示正在选开始时间 1表示正在选结束时间
      startTimeDisplay: "开始时间", // 当前选择的开始时间显示
      endTimeDisplay: "结束时间", // 当前选择的结束时间显示
      years: Array.from(Array(dayjs().year()), (v, k) => k + 1).slice(1999), // 年份列表 起始年份2000,
      months: Array.from(Array(12), (v, k) => k + 1),
      days: Array.from(Array(31), (v, k) => k + 1),
      year: dayjs().year(),
      month: dayjs().month() + 1,
      day: dayjs().date(),
      curData: [9999, dayjs().month(), dayjs().date()], // 选项的index值组成的数组
    };
  },
  mounted() {
    // 初始值
    this.startTimeDisplay = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    this.endTimeDisplay = dayjs().format("YYYY-MM-DD");
    this.visible = true;
    this.timeChose(0);
  },
  computed: {},
  methods: {
    bindChange(e) {
      // 选项的index值组成的数组
      const val = e.detail.value;
      this.curData = val;
      this.year = this.years[val[0]];
      this.month = this.months[val[1]];
      this.day = this.days[val[2]];

      // 选择不同月份显示的天数不同
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

      // 处理选择今年的情况
      if (this.year == dayjs().year()) {
        // 最多显示到当前月份
        this.months = Array.from(Array(dayjs().month() + 1), (v, k) => k + 1);
        // 如果选择的是当前月份，日最多显示到今天
        if (this.month == dayjs().month() + 1) {
          this.days = Array.from(Array(dayjs().date()), (v, k) => k + 1);
        }
      } else {
        this.months = Array.from(Array(12), (v, k) => k + 1);
      }

      if (this.timeIndex == 0) {
        // 当前选中的开始时间
        this.startTimeDisplay = dayjs()
          .set("year", this.year)
          .set("month", this.month - 1)
          .set("date", this.day)
          .format("YYYY-MM-DD");
      } else {
        // 当前选中的结束时间
        this.endTimeDisplay = dayjs()
          .set("year", this.year)
          .set("month", this.month - 1)
          .set("date", this.day)
          .format("YYYY-MM-DD");
      }
    },
    timeChose(index: number) {
      // 切换选择开始时间/结束时间
      this.timeIndex = index;
      const date = index === 0 ? this.startTimeDisplay : this.endTimeDisplay;
      this.curData = [
        this.years.indexOf(dayjs(date).year()),
        this.months.indexOf(dayjs(date).month() + 1),
        this.days.indexOf(dayjs(date).date()),
      ];
    },
    popChange(e) {
      console.log("----popChange---", e);
      if (!e.show) {
        var obj = {
          isclose: true,
        };
        this.$emit("returnDate", obj);
      }
    },
    show() {
      this.popcash = true;
    },
    close() {
      this.popcash = false;
    },
    dateMinus(date1, date2) {
      var sdate = new Date(date1.replace(/-/g, "/"));
      var now = new Date(date2.replace(/-/g, "/"));
      var days = now.getTime() - sdate.getTime();
      var day = parseInt(days / (1000 * 60 * 60 * 24));
      return day;
    },
    startDateChange(e) {
      this.timeIndex = 0;
      this.startTimeDisplay = e.target.value;
    },
    endDateChange(e) {
      this.timeIndex = 1;
      this.endTimeDisplay = e.target.value;
    },
    getDate(type) {
      const date = new Date();
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();

      if (type === "start") {
        year = year - 50;
      } else if (type === "end") {
        year = year + 2;
      }
      month = month > 9 ? month : "0" + month;
      day = day > 9 ? day : "0" + day;
      return `${year}-${month}-${day}`;
    },
    handleSetActive(active) {
      this.timeSelectActive = active;

      let time;
      if (active === 1) {
        time = this.startTimeDisplay.split("-");
      } else {
        time = this.endTimeDisplay.split("-");
      }

      this.currentDate = new Date(time[0], +time[1] - 1, time[2]);
    },
    timeSelectInput(evt) {
      if (this.timeSelectActive == 1) {
        this.startTimeDisplay = evt.getValues().join("-");
      } else if (this.timeSelectActive == 2) {
        this.endTimeDisplay = evt.getValues().join("-");
      }
    },
    handleSelectSure() {
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
      var start = this.startTimeDisplay.split("-");
      var end = this.endTimeDisplay.split("-");
      var totalDay = 0;
      if (
        new Date(start[0], +start[1] - 1, start[2]) >
        new Date(end[0], +end[1] - 1, end[2])
      ) {
        this.startTime = this.endTimeDisplay;
        this.endTime = this.startTimeDisplay;
        totalDay = this.dateMinus(this.endTimeDisplay, this.startTimeDisplay);
      } else {
        this.startTime = this.startTimeDisplay;
        this.endTime = this.endTimeDisplay;
        totalDay = this.dateMinus(this.startTimeDisplay, this.endTimeDisplay);
      }
      // console.log(this.startTime, this.endTime)

      // if (+totalDay > 31) {
      // 	uni.showToast({
      // 		title: '最多可查询31天内的数据',
      // 		icon: 'none'
      // 	});
      // 	return;
      // }

      var obj = {
        startTime: this.startTime,
        endTime: this.endTime,
        isclose: false,
      };
      this.$emit("returnDate", obj);
      this.close();
    },
  },
});
</script>

<style scoped lang="scss">
.super-date-picker-popup-container {
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
      width: 220rpx;
      height: 60rpx;
      line-height: 60rpx;
      border-bottom: 1px solid #ccc;
      text-align: center;
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
</style>


