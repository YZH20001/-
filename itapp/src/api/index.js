import jsonp from 'jsonp'
// 获取天气-百度api
export const reqWeather = (city) => {
  return new Promise((resolve, reject) => {
    const getData = (city) => {
      const url = `https://api.map.baidu.com/telematics/v3/weather?location=${city}&output=json&ak=3p49MVra6urFRGOT9s8UBWr2`
      jsonp(url, {}, (err, data) => {
        if (data && data.status === 'success') {
          resolve(data.results[0].weather_data[0],data.results[0].currentCity)
          console.log(data.results[0].weather_data[0])
        } else {
          if (data) {
            message.error(data.status)
          } else {
            message.error('请求出错，请检查网络是否正常！')
          }
        }
      })
    }
    getData(city)
  })
}

// 定位
export const reqAddress = () => {
  return new Promise((resolve, reject) => {
    jsonp('https://api.map.baidu.com/location/ip?ak=PFlNd9vKhGalbukR6ZIlFKzKvFsutPWV', (err, data) => {
      if (data && data.status === 0) {
        resolve(data.content)
        console.log(data.content)
      } else {
        message.error('请求定位接口失败')
        reject('请求定位接口失败')
      }
    })
  })
}