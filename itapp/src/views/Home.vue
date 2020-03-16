<template>
  <el-container style="height:100vh">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt />
        <span>商城后台管理系统</span>
      </div>
      <el-button type="primary" @click="screen">{{fullscreen?'还原':'全屏'}}</el-button>
      <div class="userinfo">
        <span>欢迎您，{{this.user}}</span>
      </div>
      <div></div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单区 -->
        <el-menu
          router
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          :default-active="$route.path"
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <div class="time">
          <span>{{date}}</span>
          <span>{{currentCity}}</span>
          <span style="padding: 17px;">{{this.weather}}</span>
          <span>
            <img :src="imgUrl" />
          </span>
        </div>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Cookies from 'js-cookie'
import jsonp from 'jsonp'
// //天气接口
// import { reqWeather, reqAddress } from '../api/index'
export default {
  data() {
    return {
      // 菜单列表
      menulist: [],
      iconObj: {
        '125': 'iconfont icon-icon_user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //菜单展开
      isCollapse: false,
      //默认不全屏
      fullscreen: false,
      // 时间
      date: new Date(),
      //天气
      weather: '',
      imgUrl: '',
      currentCity: ''
    }
  },
  methods: {
    screen() {
      let element = document.documentElement
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen()
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen()
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen()
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen()
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen()
        }
      }
      this.fullscreen = !this.fullscreen
    },
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenuList() {
      const { data } = await this.$http.get('menus')
      if (data.meta.status === 200) {
        this.menulist = data.data
      } else {
        this.$message({
          type: 'error',
          message: data.meta.msg
        })
      }
    },
    //点击按钮，却换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    }
  },
  // 生命周期函数
  created() {
    this.getMenuList()
    this.user = Cookies.get('username')
    //获取天气
    this.$jsonp(
      'https://api.map.baidu.com/telematics/v3/weather?location=曲靖&output=json&ak=3p49MVra6urFRGOT9s8UBWr2',
      { callbackName: 'getJson' }
    )
      .then(data => {
        console.log(data.results[0].currentCity)
        this.weather = data.results[0].weather_data[0].weather
        this.imgUrl = data.results[0].weather_data[0].dayPictureUrl
        this.currentCity = data.results[0].currentCity
      })
      .catch(err => {
        console.log('err')
        console.log(err)
      })
  },
  //时间
  mounted() {
    let _this = this // 声明一个变量指向Vue实例this，保证作用域一致
    this.timer = setInterval(() => {
      _this.date = new Date() // 修改数据date
    }, 1000)
  },
  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer) // 在Vue实例销毁前，清除我们的定时器
    }
  }
}
</script>

<style lang="less" scoped>
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.userinfo {
  margin-right: -931px;
}
img {
  width: 50px;
  height: 50px;
}
.el-aside {
  background-color: #333744;
}
.el-menu {
  border-right: none;
}
.el-main {
  background-color: #eaedf1;
}

.iconfont {
  margin-right: 10px;
}

.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.time {
  background: #fff;
  height: 54px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  span:nth-child(1){
    flex: 1;
  }
}
</style>