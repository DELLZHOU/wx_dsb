var upload = require('./OSS-Upload/uploadFile.js');
var {...url} = require('../apiConfig');
const yiqiyongCarCanvasCallback = url.yiqiyongCarCanvasCallback;
const {
  isUndefined,
  isDefined,
  isString,
  isObject,
  isFunction,
  getString,
} = require('./base.js');

const ajax = (
  url,
  {
    data,
    method = 'GET',
    header = {},
    success = () => {},
    fail = () => {},
    complete = () => {},
    failToast = true,
    modalLoading = '',
    navBarLoading = false,
    showLog = true
  }
) => {
  // 第三方登录态
  const session_3rd = updataStorageData('session_3rd');
  // 构造请求体
  const request = {
    url,
    method: ['GET', 'POST'].indexOf(method) > -1 ? method : 'GET',
    header: Object.assign({ SESSION: session_3rd }, header),
    data: Object.assign({}, data)
  };

  showLog && console.table && console.table(request); // eslint-disable-line

  modalLoading && wx.showLoading({ title: getString(modalLoading) });
  navBarLoading && wx.showNavigationBarLoading();

  wx.request(
    Object.assign(request, {
      success: ({ data, statusCode }) => {
        modalLoading && wx.hideLoading();

        showLog && console.log && console.log('[AJAX SUCCESS]', statusCode, typeof data === 'object' ? data : data.toString().substring(0, 100)); // eslint-disable-line

        // 状态码正常 & 确认有数据
        if (data && +data.code === 0 && data.data) {
          isFunction(success) && success(Object.assign({ statusCode }, data));
          return;
        }

        // 非正常业务码处理（如登录态失效等）
        if (data && +data.code === 12000010) {
          // 
        }

        // 其他情况，执行错误回调
        failToast &&
          wx.showToast({ title: data.message || '获取数据出错', icon: 'none' });
        isFunction(fail) && fail(Object.assign({ statusCode }, data));
      },
      fail: ({ error, errorMessage }) => {
        modalLoading && wx.hideLoading();
        showLog && console.log && console.log('[AJAX FAIL]', error, errorMessage); // eslint-disable-line
        failToast && wx.showToast({ title: errorMessage || '获取数据出错', icon: 'none' });
        isFunction(fail) && fail({ error, errorMessage });
      },
      complete: () => {
        navBarLoading && wx.hideNavigationBarLoading();
        isFunction(complete) && complete();
      }
    })
  );
};

const app = getApp();

const updataGlobalData = (key, value) => {
  const globalData = app.globalData;
  // 校验 globalData
  if (!globalData) {
    return console.error('[$updateGlobalData] globalData Not Find!'); // eslint-disable-line
  }
  // 校验: 操作字段
  if (!isString(key) || key === '') {
    return console.error('[$updateGlobalData] key 不能为空!'); // eslint-disable-line
  }
  // 取出已有信息
  const data = globalData[key] || {};
  // 更新缓存
  if (value && isObject(value) && isObject(data)) {
    // Object合并第一层
    globalData[key] = Object.assign({}, data, value);
  } else if (isDefined(value)) {
    // 其他非undefined数据直接覆盖
    globalData[key] = value;
  }
  return globalData[key];
};

const updataStorageData = (key, value) => {
  try {
    if (!isString(key) || key === '') {
      return console.error('[$updateStorageData] key 不能为空!'); // eslint-disable-line
    }
    let data = wx.getStorageSync(key);
    // 只有key情况下，直接返回data
    if (isUndefined(value)) return data;
    // Object合并
    if (isObject(value) && isObject(data)) {
      let info = Object.assign({}, data, value);
      wx.setStorageSync(key, info);
      return info;
    }
    // 其他数据直接覆盖
    wx.setStorageSync(key, value);
    return value;
  } catch (e) {
    console.error(`[ERROR]: ${value ? 'UPDATE' : 'GET'} Storage ${key} : `, e.stack); // eslint-disable-line
  }
};
const formatSeconds = (value) => {

      var theTime = parseInt(value);// 秒
      var middle= 0;// 分
      var hour= 0;// 小时
  
      if(theTime > 60) {
          middle= parseInt(theTime/60);
          theTime = parseInt(theTime%60);
          if(middle> 60) {
              hour= parseInt(middle/60);
              middle= parseInt(middle%60);
          }
      }
      var result = ""+parseInt(theTime)+"秒";
      if(middle > 0) {
          result = ""+parseInt(middle)+"分"+result;
      }
      if(hour> 0) {
          result = ""+parseInt(hour)+"小时"+result;
      }
      return result;
  }

/*时间只剩年月日*/
 const timedat = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  let h = date.getHours() + ':';
  let m = date.getMinutes() + ':';
  let s = date.getSeconds();
  return Y+M+D;
}  
const timedatGuang = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + "";
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + "";
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  return Y+M+D;
}
const timedatIos = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  let h = date.getHours() + ':';
  let m = date.getMinutes() + ':';
  let s = date.getSeconds();
  return Y+M+D;
} 
const timedatIosYuan = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  let h = date.getHours() < 10 ? '0'+(date.getHours())+ ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10? '0'+(date.getMinutes()) : date.getMinutes();
  let s = date.getSeconds();
  return Y+M+D+" "+h+m;
}
const timedatIosYRtIME = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) + '月' : date.getMonth()+1 + '月');
  let D = date.getDate() < 10 ? '0'+(date.getDate()) + '日': + date.getDate() + '日';
  let h = date.getHours() < 10 ? '0'+(date.getHours())+ ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10? '0'+(date.getMinutes()) : date.getMinutes();
  let s = date.getSeconds();
  return M+D+" "+h+m;
} 
const timedatIosYuanWeeks = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';

  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
  let M1 = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);

  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';

  let h = date.getHours() < 10 ? '0'+(date.getHours())+ ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10? '0'+(date.getMinutes()) : date.getMinutes();
  let s = date.getSeconds();
  var weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];  
  var myDate = new Date(Date.parse(Y+M+D));  
  return M1+"月"+D+"日"+" "+weekDay[myDate.getDay()]+" "+h+m;
} 
const timedatIosSfm = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  let h = date.getHours() < 10 ? '0'+(date.getHours())+ ':' : date.getHours() + ':';
  let m = date.getMinutes() < 10? '0'+(date.getMinutes())+ ':' : date.getMinutes() + ':';
  let s = date.getSeconds() < 10? '0'+(date.getSeconds()) : date.getSeconds();
  return Y+M+D+" "+h+m+s;
}  
const timedatIosSf = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '/';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '/';
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
 
  let m = date.getMinutes() < 10? '0'+(date.getMinutes())+ ':' : date.getMinutes() + ':';
  let s = date.getSeconds() < 10? '0'+(date.getSeconds()) : date.getSeconds();
  let mm = date.getMinutes();
  var hh = date.getHours();
  if(mm > 45){
    hh = hh + 1;
  }
  var h = hh < 10 ? '0'+(hh)+ ':' : hh + ':';
  var str1 = "";
  if(mm == 0){
    str1 = "00";
  }else if(mm <= 15 && mm >0){
    str1 = '15';
  }else if(mm > 15 && mm <= 30){
    str1 = '30';
  }else if(mm > 30 && mm <= 45){
    str1 = '45';
  }else if(mm > 45){
    str1 = '00';
  }
  
  return Y+M+D+" "+h+str1;
} 
const timedatIosSfyr = (res,type) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear();
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
  let D = date.getDate() < 10 ? '0' + (date.getDate()) : + date.getDate() + '';

  let m = date.getMinutes() < 10 ? '0' + (date.getMinutes()) + ':' : date.getMinutes() + ':';
  let s = date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds();
  let mm = date.getMinutes();
  var hh = date.getHours();
  if (mm > 45) {
    hh = hh + 1;
  }
  var h = hh < 10 ? '0' + (hh) + ':' : hh + ':';
  var str1 = "";
  if (mm == 0) {
    str1 = "00";
  } else if (mm <= 15 && mm > 0) {
    str1 = '15';
  } else if (mm > 15 && mm <= 30) {
    str1 = '30';
  } else if (mm > 30 && mm <= 45) {
    str1 = '45';
  } else if (mm > 45) {
    str1 = '00';
  }
  var dateStr = Y + "-" + M + "-" + D;
  var myDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
  var weekDay = ["星期天", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  var weekDayNumber = "";
  var todaysDate = new Date();
  // var isToday = '';
  if (myDate.setHours(0, 0, 0, 0) == todaysDate.setHours(0, 0, 0, 0)) {
    weekDayNumber = '今天';
  } else {
    weekDayNumber = weekDay[myDate.getDay()];
  }
  // return Y + M + D + " " + h + str1;
  if (type == 1){
    return M + '月' + D + '日';
  }else if(type == 2){
    return weekDayNumber + " " + h + str1;
  }
  
}
const timedatIosDange = (res) => {   //res 为传入的时间戳   例：1509091800000
  let date = new Date(res);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '';
  let M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1);
  let D = date.getDate() < 10 ? '0'+(date.getDate()): + date.getDate() + '';
  let h = date.getHours() < 10 ? '0'+(date.getHours())+ '' : date.getHours() + '';
  let m = date.getMinutes() < 10? '0'+(date.getMinutes())+ '' : date.getMinutes() + '';
  let s = date.getSeconds() < 10? '0'+(date.getSeconds()) : date.getSeconds();
  return [Y,M,D,h,m,s];
} 
const formatDate = (date,fmt) => {
  if(/(y+)/.test(fmt)){  
    fmt = fmt.replace(RegExp.$1, (date.getFullYear()+'').substr(4-RegExp.$1.length));  
  }  
  let o = {
    'M+':date.getMonth()+1,
    'd+':date.getDate(),
    'h+':date.getHours(),
    'm+':date.getMinutes(),
    's+':date.getSeconds()
  }
  for (const k in o) {
    let str = o[k]+''; 
    if(new RegExp(`(${k})`).test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1)?str:padLeftZero(str)); 
    }
  }
  return fmt
}
const padLeftZero = (str) => {
  return ('00'+str).substr(str.length);
}
/**
 * 将小程序的API封装成支持Promise的API
 * @params fn {Function} 小程序原始API，如wx.login
 */
const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }

      obj.fail = function (res) {
        reject(res)
      }

      fn(obj)
    })
  }
}
// 计算两个时间差 dateBegin 开始时间
const timeFn = (dateBegin,dateEnd) => {
  //如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
  var dateDiff = dateEnd - dateBegin;//时间差的毫秒数
  var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000));//计算出相差天数
  var leave1=dateDiff%(24*3600*1000)  //计算天数后剩余的毫秒数
  var hours=Math.floor(leave1/(3600*1000))//计算出小时数
  //计算相差分钟数
  var leave2=leave1%(3600*1000)  //计算小时数后剩余的毫秒数
  var minutes=Math.floor(leave2/(60*1000))//计算相差分钟数
  //计算相差秒数
  var leave3=leave2%(60*1000)   //计算分钟数后剩余的毫秒数
  var seconds=Math.round(leave3/1000)
  var leave4=leave3%(60*1000)   //计算分钟数后剩余的毫秒数
  var minseconds=Math.round(leave4/1000)
  // var timeFn = "耗时："+dayDiff+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒"+minseconds+"毫秒";
  var timeFn = dayDiff+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒";
  return timeFn;
}

const CompareDate = (t1,t2) =>
{
    var t11=t1.split(":");
    var t21=t2.split(":");
    var sj1 = parseInt(t11[0])*12 + t11[1];
    var sj2 = parseInt(t21[0])*12 + t21[1]
    if (sj1 > sj2) 
    {            
        return false;    
    } 
    return true; 

}



const getCanvasDealImage = ( arrCarsList,self,callback,cunType) => {
  // let self = this;
  
  console.log(arrCarsList)
  console.log('=====================================================');
  arrCarsList.forEach((val,inumIndex) => {
    
    //判断是否有spot
    if(val.car_face){
      if(val.car_face.coordinate && val.car_face.coordinate != ''){
        wx.showLoading({ title: '加载中',mask: true })
        let spotObjImage = val.car_face;
        var postImage = "";
        if(cunType == 0){
          postImage = `${app.globalData.UploadImageSrc}${val.car_id}/${spotObjImage.imageName}`;
          // ?x-oss-process=image/resize,m_lfit,h_${wx.getSystemInfoSync().screenHeight},w_${wx.getSystemInfoSync().screenWidth}
        }else if(cunType == 3 || cunType == 4){
          postImage = `${app.globalData.UploadImageSrc}${spotObjImage.car_id}/${spotObjImage.imageName}`;          
          // ?x-oss-process=image/resize,m_lfit,h_${wx.getSystemInfoSync().screenHeight},w_${wx.getSystemInfoSync().screenWidth}
        }
        var logoImage = `${app.globalData.UploadImageSrc}logo/${spotObjImage.logo}`;
        var point = JSON.parse(spotObjImage.coordinate);
        var scalWidth = parseInt(spotObjImage.w);
        var canvasName = "";
        if(cunType == 0){
          canvasName = `myCanvas${val.car_id}`;
        }else if(cunType == 3){
          canvasName = `myCanvas${spotObjImage.car_id}`;
        }else if(cunType == 4){
          canvasName = `myCanvas${spotObjImage.id}`;
        }
        // console.log(1111111111);
        const ctx = wx.createCanvasContext(canvasName);
        console.log(canvasName);
        console.log(postImage);
        console.log(logoImage);
        wx.downloadFile({
          url: postImage, //海报
          // url: 
          success: function(res) {
            let post = res.tempFilePath;
            console.log(post);
            wx.downloadFile({
              url: logoImage,
              success: function(res) {
                console.log(res);
                let logo = res.tempFilePath;
                
                wx.getImageInfo({
                  src: post,
                  success: function(res){
                    console.log(res);
                    const scalNumber = scalWidth/wx.getSystemInfoSync().screenWidth;
                    point.forEach((v,i) => {
                      v.x = parseInt(v.x/scalNumber);
                      v.y = parseInt(v.y/scalNumber);
                    });
                    const sel_dots = point; 
                    console.log(sel_dots);                 
                    var ratioPost = 2;
                    var maxHeight = 260;
                    var savedots = [];
                    var imgRatio = 1, count = 1;
                    var dots = [];
                    var dotscopy, idots;                  
                    let w = res.width
                    let h = res.height;
                    // while (w > 500 || h > 500){
                    //   //比例取整
                    //   w = Math.trunc(res.width / ratioPost)
                    //   h = Math.trunc(res.height / ratioPost)
                    //   ratioPost++;
                    // }  

                    var zoomRatio = 1;
                    if (w >= wx.getSystemInfoSync().screenWidth) {
                      zoomRatio = w / wx.getSystemInfoSync().screenWidth
                      // this.$msg_success(`您选择的图片大小是${w}x${h}，已等比缩放为${(w / this.zoomRatio).toFixed(0)}x${(h / this.zoomRatio).toFixed(0)}`)
                      w = parseInt((w / zoomRatio).toFixed(0))
                      h = parseInt((h / zoomRatio).toFixed(0))
                    }                           
                    console.log(ratioPost);
                    self.setData({
                      w: w,
                      h: h
                    })      
                    ctx.drawImage(post, 0, 0, w, h);            
                    wx.getImageInfo({
                      src: logo,
                      success: function(res){
                        console.log(res)
                        var ratioLogo = 2;
                        var img_w = res.width
                        var img_h = res.height;    
                        //比例取整
                        // img_w = Math.trunc(res.width / ratioLogo)
                        // img_h = Math.trunc(res.height / ratioLogo)
                        // ratioLogo++; 
      
                        if (img_h > maxHeight) {
                          imgRatio = maxHeight / img_h;
                          img_h = maxHeight;
                          img_w *= imgRatio;
                        }                 
      
                        var left = (w - img_w) / 2;
                        var top = (h - img_h) / 2; 
                        // console.log(left);
                        res.width = img_w;
                        res.height = img_h;
      
                        dots = [
                          { x: left, y: top },
                          { x: left + img_w, y: top },
                          { x: left + img_w, y: top + img_h },
                          { x: left, y: top + img_h },
                        ];
                        // console.log(dots);
                        //保存一份不变的拷贝
                        dotscopy = [
                          { x: left, y: top },
                          { x: left + img_w, y: top },
                          { x: left + img_w, y: top + img_h },
                          { x: left, y: top + img_h },
                        ];
      
                      //获得所有初始点坐标
                        idots = rectsplit(count, dotscopy[0], dotscopy[1], dotscopy[2], dotscopy[3]);  
      
                        var ndots = rectsplit(count, dots[0], dots[1], dots[2], dots[3]);
                        console.log(count);
                        savedots = ndots
                        console.log(sel_dots);
                        ndots = sel_dots//暂时封闭
                        
                        sel_dots.forEach(function (d, i) {
                          //获取平行四边形的四个点
                          var dot1 = ndots[i];
                          var dot2 = ndots[i + 1];
                          var dot3 = ndots[i + count + 2];
                          var dot4 = ndots[i + count + 1];
                          // console.log(i + count + 2);
                          //获取初始平行四边形的四个点
                          var idot1 = idots[i];
                          var idot2 = idots[i + 1];
                          var idot3 = idots[i + count + 2];
                          var idot4 = idots[i + count + 1];
                          
                          if (dot2 && dot3 && i % (count + 1) < count) {
                            console.log(dot1);
                            //绘制三角形的下半部分
                            renderImage(idot3, dot3, idot2, dot2, idot4, dot4, idot1);
              
                            //绘制三角形的上半部分
                            renderImage(idot1, dot1, idot2, dot2, idot4, dot4, idot1);
                          }
                        });                      
                        function renderImage(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3, vertex) {
                          console.log(_arg_1.x);
                          console.log(_arg_2);
                          console.log(_arg_3);
                          ctx.save();
                
                          //根据变换后的坐标创建剪切区域
                          ctx.beginPath();
                          ctx.moveTo(_arg_1.x, _arg_1.y);
                          ctx.lineTo(_arg_2.x, _arg_2.y);
                          ctx.lineTo(_arg_3.x, _arg_3.y);
                          ctx.closePath();
                          // ctx.setStrokeStyle('red')
                          // ctx.stroke()
                          // ctx.draw()
                          // 
                          // ctx.clip();
                
                          //传入变换前后的点坐标，计算变换矩阵
                          var result = getMatrix.apply(this, arguments);
                          console.log(result);
                          //变形
                          ctx.transform(result.a, result.b, result.c, result.d, result.e, result.f);
                
                          var w = img_w/ count;
                          var h = img_h / count;
                          
                          ctx.drawImage(
                            logo,
                            (vertex.x - idots[0].x) / imgRatio - 1,
                            (vertex.y - idots[0].y) / imgRatio - 1,
                            w / imgRatio + 2,
                            h / imgRatio + 2,
                            vertex.x - 1,
                            vertex.y - 1,
                            w + 2,
                            h + 2
                          );              
                          ctx.restore();
                        }
                        // ctx.drawImage(logo, 0, 0, img_w, img_h);
                        // console.log(idots);                    
                        // ctx.fillStyle = "#fff";
                        // -1
                        // logs.js:268 -1
                        // logs.js:269 47
                        // logs.js:270 18
                        // logs.js:271 64
                        // logs.js:272 48.5
                        // logs.js:273 47
                        // logs.js:274 18
                        // ctx.fillRect(117.5, 136, 41, 41);
          
                        // ctx.drawImage(logo, -1, -1, 47, 18,30,48,60,20);
                       
                        function rectsplit(n, a, b, c, d) {
                          // ad 向量方向 n 等分
                          var ad_x = (d.x - a.x) / n;
                          var ad_y = (d.y - a.y) / n;
                          // bc 向量方向 n 等分
                          var bc_x = (c.x - b.x) / n;
                          var bc_y = (c.y - b.y) / n;
                
                          var ndots = [];
                          var x1, y1, x2, y2, ab_x, ab_y;
                
                          //左边点递增，右边点递增，获取每一次递增后的新的向量，继续 n 等分，从而获取所有点坐标
                          for (var i = 0; i <= n; i++) {
                            //获得 ad 向量 n 等分后的坐标
                            x1 = a.x + ad_x * i;
                            y1 = a.y + ad_y * i;
                            //获得 bc 向量 n 等分后的坐标
                            x2 = b.x + bc_x * i;
                            y2 = b.y + bc_y * i;
                
                            for (var j = 0; j <= n; j++) {
                              // ab 向量为：[x2 - x1 , y2 - y1]，所以 n 等分后的增量为除于 n
                              ab_x = (x2 - x1) / n;
                              ab_y = (y2 - y1) / n;
                
                              ndots.push({
                                x: x1 + ab_x * j,
                                y: y1 + ab_y * j,
                              });
                            }
                          }
                
                          return ndots;
                        }
      
      
                        function getMatrix(arg_1, _arg_1, arg_2, _arg_2, arg_3, _arg_3) {
                          //传入x值解第一个方程 即  X = ax + cy + e 求ace
                          //传入的四个参数，对应三元一次方程：ax+by+cz=d的四个参数：a、b、c、d，跟矩阵方程对比c为1
                          var arr1 = [arg_1.x, arg_1.y, 1, _arg_1.x];
                          var arr2 = [arg_2.x, arg_2.y, 1, _arg_2.x];
                          var arr3 = [arg_3.x, arg_3.y, 1, _arg_3.x];
                
                          var result = equation(arr1, arr2, arr3);
                
                          //传入y值解第二个方程 即  Y = bx + dy + f 求 bdf
                          arr1[3] = _arg_1.y;
                          arr2[3] = _arg_2.y;
                          arr3[3] = _arg_3.y;
                
                          var result2 = equation(arr1, arr2, arr3);
                
                          //获得a、c、e
                          var a = result.x;
                          var c = result.y;
                          var e = result.z;
                
                          //获得b、d、f
                          var b = result2.x;
                          var d = result2.y;
                          var f = result2.z;
                
                          return {
                            a: a,
                            b: b,
                            c: c,
                            d: d,
                            e: e,
                            f: f
                          };
                        }
      
                        function equation(arr1, arr2, arr3) {
                          var a1 = +arr1[0];
                          var b1 = +arr1[1];
                          var c1 = +arr1[2];
                          var d1 = +arr1[3];
                
                          var a2 = +arr2[0];
                          var b2 = +arr2[1];
                          var c2 = +arr2[2];
                          var d2 = +arr2[3];
                
                          var a3 = +arr3[0];
                          var b3 = +arr3[1];
                          var c3 = +arr3[2];
                          var d3 = +arr3[3];
                
                          //分离计算单元
                          var m1 = c1 - (b1 * c2 / b2);
                          var m2 = c2 - (b2 * c3 / b3);
                          var m3 = d2 - (b2 * d3 / b3);
                          var m4 = a2 - (b2 * a3 / b3);
                          var m5 = d1 - (b1 * d2 / b2);
                          var m6 = a1 - (b1 * a2 / b2);
                
                          //计算xyz 
                          var x = ((m1 / m2) * m3 - m5) / ((m1 / m2) * m4 - m6);
                          var z = (m3 - m4 * x) / m2;
                          var y = (d1 - a1 * x - c1 * z) / b1;
                
                          return {
                            x: x,
                            y: y,
                            z: z
                          }
                        }      
                        console.log("lalallalalallalal");
                        ctx.draw(true, function (e) {
                          console.log('draw callback')
                          setTimeout(() => {
                          wx.canvasToTempFilePath({
                            x: 0,
                            y: 0,
                            width: w,
                            height: h,
                            destWidth: w * wx.getSystemInfoSync().pixelRatio,
                            destHeight: h * wx.getSystemInfoSync().pixelRatio,                          
                            quality: 1,
                            canvasId: canvasName,
                            success: function(respon) {
                              // console.log(respon);
                              wx.hideLoading()
                              let arrsCars = []; 
                              let temp_path = respon.tempFilePath;
                              // var objOther = [];
                              if(cunType == 0){
                                var objOther = [{
                                  imageName: val.car_face.imageName,
                                  cars_id: val.car_id,
                                  url: temp_path,
                                  upload_percent: 0,
                                  path_server: '',
                                  path_name: '',
                                }];
                              }else if(cunType == 3){
                                var objOther3 = [{
                                  imageName: val.car_face.imageName,                                  
                                  cars_id: spotObjImage.car_id,
                                  url: temp_path,
                                  position: val.position,
                                  upload_percent: 0,
                                  path_server: '',
                                  path_name: '',                                  
                                }];                                                               
                              }else if(cunType == 4){
                                var objOther4 = [{
                                  imageName: val.car_face.imageName,    
                                  id: spotObjImage.id,
                                  url: temp_path,
                                  position: val.position,
                                  upload_percent: 0,
                                  path_server: '',
                                  path_name: '',                                     
                                }];                                   
                              }
                              // self.setData({
                              //   newImage: temp_path,
                              // })
                              if(cunType == 0){
                                console.log(inumIndex);
                                self.data.otherDealArr = self.data.otherDealArr.concat(objOther)
                                console.log(self.data.otherDealArr);
                                let arr1 = self.data.otherDealArr;
                                let arrs = quArr(arr1);                                
                                if(inumIndex == (arrCarsList.length - 1)){
                                  

                                  console.log(arrs);
                                  //支持多图上传1
                                  for (var i = 0; i < arrs.length; i++) {
                                    //显示消息提示框
                                    wx.showLoading({
                                      title: '加载中...',
                                      mask: true
                                    })
                                    if(arrs[i].upload_percent == 0){
                                      upload.uploadFileMoreCanvas(i,arrs,arrs[i].url,arrs[i].imageName,`cv_${val.car_face.store_id}_`,
                                      function(result){
                                        console.log(result);
                                        // console.log(app);
                                        let imageNameAjAx = result.map((ajaxNameVal,ajaxNameIndex) => {
                                          return `cv_${val.car_face.store_id}_${ajaxNameVal.imageName}`;
                                        } )
                                        let params = {
                                          imageName: imageNameAjAx.join(",")
                                        }
                                        // console.log(params);
                                        // console.log(yiqiyongCarCanvasCallback);
                                        app.ajax(
                                          yiqiyongCarCanvasCallback,
                                          params,
                                          res => {
                                            console.log(res)
                                            if(app.is_success(res)){
                                              // app
                                            }
                                          },
                                          err => {
                                            console.log(err);
                                          },
                                          'post'
                                        )
                                        callback(result); 
                                        wx.hideLoading() 
                                      },function(result){
                                        console.log("======上传失败======", result);
                                        wx.hideLoading()  
                                      })
                                    }
                                  }                                   
                                }
                              
                              }else if(cunType == 3){
                                self.data.otherDealArr1 = self.data.otherDealArr1.concat(objOther3)
                                console.log(self.data.otherDealArr1);
                                let arr1 = self.data.otherDealArr1;
                                let arrs = quArr(arr1);                                
                                if(inumIndex == (arrCarsList.length - 1)){
                                  

                                  console.log(arrs);
                                  //支持多图上传1
                                  for (let i = 0; i < arrs.length; i++) {
                                    //显示消息提示框
                                    wx.showLoading({
                                      title: '加载中...',
                                      mask: true
                                    })
                                    if(arrs[i].upload_percent == 0){
                                      upload.uploadFileMoreCanvas(i,arrs,arrs[i].url,arrs[i].imageName,`cv_${val.car_face.store_id}_`,
                                      function(result){
                                        console.log(result);
                                        // console.log(app);
                                        let imageNameAjAx = result.map((ajaxNameVal,ajaxNameIndex) => {
                                          return `cv_${val.car_face.store_id}_${ajaxNameVal.imageName}`;
                                        } )
                                        let params = {
                                          imageName: imageNameAjAx.join(",")
                                        }
                                        // console.log(params);
                                        // console.log(yiqiyongCarCanvasCallback);
                                        app.ajax(
                                          yiqiyongCarCanvasCallback,
                                          params,
                                          res => {
                                            console.log(res)
                                            if(app.is_success(res)){
                                              // app
                                              
                                            }
                                          },
                                          err => {
                                            console.log(err);
                                          },
                                          'post'
                                        )
                                        callback(result); 
                                        wx.hideLoading() 
                                      },function(result){
                                        console.log("======上传失败======", result);
                                        wx.hideLoading()  
                                      })
                                    }
                                  }                                   
                                }






                                 
                              }else if(cunType == 4){
                                self.data.otherDealArr2 = self.data.otherDealArr2.concat(objOther4)
                                // callback(self.data.otherDealArr2);                                 

                                let arr1 = self.data.otherDealArr2;
                                let arrs = quArr1(arr1);                                
                                if(inumIndex == (arrCarsList.length - 1)){
                                  

                                  console.log(arrs);
                                  //支持多图上传1
                                  for (let i = 0; i < arrs.length; i++) {
                                    //显示消息提示框
                                    wx.showLoading({
                                      title: '加载中...',
                                      mask: true
                                    })
                                    if(arrs[i].upload_percent == 0){
                                      upload.uploadFileMoreCanvas(i,arrs,arrs[i].url,arrs[i].imageName,`cv_${val.car_face.store_id}_`,
                                      function(result){
                                        console.log(result);
                                        // console.log(app);
                                        let imageNameAjAx = result.map((ajaxNameVal,ajaxNameIndex) => {
                                          return `cv_${val.car_face.store_id}_${ajaxNameVal.imageName}`;
                                        } )
                                        let params = {
                                          imageName: imageNameAjAx.join(",")
                                        }
                                        // console.log(params);
                                        // console.log(yiqiyongCarCanvasCallback);
                                        app.ajax(
                                          yiqiyongCarCanvasCallback,
                                          params,
                                          res => {
                                            console.log(res)
                                            if(app.is_success(res)){
                                              // app
                                              
                                            }
                                          },
                                          err => {
                                            console.log(err);
                                          },
                                          'post'
                                        )
                                        callback(result); 
                                        wx.hideLoading() 
                                      },function(result){
                                        console.log("======上传失败======", result);
                                        wx.hideLoading()  
                                      })
                                    }
                                  }                                   
                                }



                              }
                              
                              // let fileSystemManager = wx.getFileSystemManager();
                              // fileSystemManager.readFile({
                              //   filePath: temp_path,
                              //   encoding: 'base64',
                              //   success: (data)=>{
                              //     // console.log(month);
                              //     // console.log(data)
                                  
                              //     let base64 = 'data:image/png;base64,'+data.data;
                              //     self.setData({
                              //       url: base64
                              //     })     
                              //   }
                              // })                             
                              // ctx.setFillStyle('white')
                              // self.setData({
                              //   logo: respon.tempFilePath,
                              //   posterShow: true
                              // })
                            },
                            fail: function(res) {
                              wx.showToast({
                                title: 'canvasToTempFilePath---fail',
                                icon: 'none'
                              })
                            }
                          });  
                          },500)
                      
                        })                        
                        
      
                      }
                    })
           
                  }
                })          
              }
            })
          },
          fail: function(res) {
            console.log(res);
            wx.hideLoading();
            wx.showToast({
              title: '下载失败,请重新生成',
              icon: 'none'
            })
          }         
        })        
        
  
      }
    }

  })
  // console.log(self.data.otherDealArr);
  // callback(self.data.otherDealArr);
}

const quArr1 = (arr) => {
  var result = [];
  var obj = {};
  for(var i =0; i<arr.length; i++){
     if(!obj[arr[i].id]){
        result.push(arr[i]);
        obj[arr[i].id] = true;
     }
  }
  return result;
}


const quArr = (arr) => {
  var result = [];
  var obj = {};
  for(var i =0; i<arr.length; i++){
     if(!obj[arr[i].cars_id]){
        result.push(arr[i]);
        obj[arr[i].cars_id] = true;
     }
  }
  return result;
}



const datedifference = (sDate1, sDate2) => {    //sDate1和sDate2是2006-12-18格式  
  var dateSpan,
      tempDate,
      iDays;
  sDate1 = Date.parse(sDate1);
  sDate2 = Date.parse(sDate2);
  dateSpan = sDate2 - sDate1;
  dateSpan = Math.abs(dateSpan);
  iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
  return iDays
}


function withData(param){
  return param < 10 ? '0' + param : '' + param;
}
function getLoopArray(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withData(i));
  }
  return array;
}
function getMonthDay(year,month){
  var flag = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0), array = null;
 
  switch (month) {
    case '01':
    case '03':
    case '05':
    case '07':
    case '08':
    case '10':
    case '12':
      array = getLoopArray(1, 31)
      break;
    case '04':
    case '06':
    case '09':
    case '11':
      array = getLoopArray(1, 30)
      break;
    case '02':
      array = flag ? getLoopArray(1, 29) : getLoopArray(1, 28)
      break;
    default:
      array = '月份格式不正确，请重新输入！'
  }
  return array;
}
function getNewDateArry(){
  // 当前时间的处理
  var newDate = new Date();
  var year = withData(newDate.getFullYear()),
      mont = withData(newDate.getMonth() + 1),
      date = withData(newDate.getDate()),
      hour = withData(newDate.getHours()),
      minu = withData(newDate.getMinutes()),
      seco = withData(newDate.getSeconds());
 
  return [year, mont, date, hour, minu, seco];
}
function dateTimePicker(startYear,endYear,date) {
  // 返回默认显示的数组和联动数组的声明
  var dateTime = [], dateTimeArray = [[],[],[],[],[],[]];
  var start = startYear || 1978;
  var end = endYear || 2100;
  // 默认开始显示数据
  var defaultDate = date ? [...date.split(' ')[0].split('-'), ...date.split(' ')[1].split(':')] : getNewDateArry();
  // 处理联动列表数据
  /*年月日 时分秒*/ 
  dateTimeArray[0] = getLoopArray(start,end);
  dateTimeArray[1] = getLoopArray(1, 12);
  dateTimeArray[2] = getMonthDay(defaultDate[0], defaultDate[1]);
  dateTimeArray[3] = getLoopArray(0, 23);
  dateTimeArray[4] = getLoopArray(0, 59);
  dateTimeArray[5] = getLoopArray(0, 59);
 
  dateTimeArray.forEach((current,index) => {
    dateTime.push(current.indexOf(defaultDate[index]));
  });
 
  return {
    dateTimeArray: dateTimeArray,
    dateTime: dateTime
  }

}




module.exports = {
  ajax,
  app,
  updataGlobalData,
  updataStorageData,
  timedat,
  formatDate,
  wxPromisify,
  timedatIos,
  datedifference,
  timedatIosSfm,
  timedatIosDange,
  dateTimePicker,
  getMonthDay,
  getCanvasDealImage,
  timedatIosSf,
  timedatIosSfyr,
  timedatIosYuan,
  timedatGuang,
  timedatIosYuanWeeks,
  timeFn,
  formatSeconds,
  CompareDate,
  timedatIosYRtIME
};
