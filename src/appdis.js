
var { ...url } = require('./apiConfig');
var mta = require('./utils/mta_analysis.js')
const yiqiyongUserWechatLogin = url.yiqiyongUserWechatLogin;
const yiqiyongUserCollectUserFormId = url.yiqiyongUserCollectUserFormId;
const yiqiyongUserAuthorizeMobile = url.yiqiyongUserAuthorizeMobile;
const commonHostConfig = require('./env.js');
console.log(commonHostConfig);
App({
    formIdArr: [],
    onLaunch() {

        // "eventID":"500697870",
        mta.App.init({
            "appID": this.globalData.appid,
            "autoReport": true,
            "statParam": true,
            "ignoreParams": [],
        });
        this.networkManage(); //调用监听网络状态的方法
        this.updateManage();
        // Do something initial when launch.
        this.globalData.openid = wx.getStorageSync('yiqiyong_openid');
        // console.log(this.globalData.appid);
        if (this.globalData.openid) {//this.globalData.openid
            wx.checkSession({
                success: () => {
                    // this.toast('已登录过', 1000)

                    this.get_wxUserInfo();
                },
                fail: () => {
                    // this.toast('登录过期', 1000)

                    // session_key 已经失效，需要重新执行登录流程
                    this.login() // 重新登录
                }
            })
        } else {
            // this.toast('小程序初始化', 1000)
            this.login()
        }
    },
    networkManage: function () {
        var that = this;
        //监听网络状态
        wx.onNetworkStatusChange(function (res) {
            console.log(res);
            if (!res.isConnected) {
                that.toast('网络似乎不太顺畅');
            }
        })
    },

    //---------------------------------------------检测小程序版本更新
    updateManage: function () {
        var that = this;

        var updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调

            if (!res.hasUpdate) {
                // console.log(res)
            }
        })
        // 监听新版本下载成功
        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    console.log(res);
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    } else {
                        that.updateManage();
                    }
                }
            })
        })
        // 监听新版本下载失败1
        updateManager.onUpdateFailed(function () {
            wx.showModal({
                title: '提示',
                content: '新版本更新失败，是否重试？',
                confirmText: '重试',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            });
        })
    },//--------end
    num_start_end: 0,
    onShow(options) {
        // wx.showModal({
        //   title: '提示',
        //   content: `${options.scene}`,
        //   success (res) {
        //     if (res.confirm) {
        //       console.log('用户点击确定')
        //     } else if (res.cancel) {
        //       console.log('用户点击取消')
        //     }
        //   }
        // })  
        if (options.scene == 1047 || options.scene == 1124 || options.scene == 1089 || options.scene == 1038 || options.scene == 1011) {
            wx.setStorage({
                key: 'yiqiyong_official_account',
                data: true,
            })
        } else {
            wx.setStorage({
                key: 'yiqiyong_official_account',
                data: false,
            })
        }
        // Do something when show.
    },
    pay(param, success, fail) {
        console.log(param)
        // console.log();
        // success && success();
        // return;
        //appid=wxc570c9e19dedd4d0
        //openid=oMvfT5CdXM-oJJ-fK0yq9MqRIbpE
        //openid=oMvfT5CdXM-oJJ-fK0yq9MqRIbpE
        wx.requestPayment({
            // appid: param.appid,
            timeStamp: param.timeStamp,
            nonceStr: param.nonceStr,
            package: param.package,
            signType: param.signType,
            paySign: param.sign,
            success: (res) => {
                console.log(res)
                wx.showToast({
                    title: '支付成功',
                })
                success && success(res);
            },
            fail: (res) => {
                console.log(res)
                if (res.errMsg == 'requestPayment:fail cancel') {
                    this.toast('已取消支付')
                    wx.setStorage({
                        key: 'yiqiyong_orderTypeId',
                        data: 1,
                    })
                } else {
                    this.toast('支付错误')
                    wx.setStorage({
                        key: 'yiqiyong_orderTypeId',
                        data: 1,
                    })
                }
                fail && fail(res);
                // this.toast('支付错误：' + (res.err_desc || res.errMsg))
            }
        })
    },
    wxlogincode: '',
    login(page) {
        // console.log('login');
        // 登录
        wx.login({
            success: res => {
                // console.log(res);
                if (res.code) {
                    this.wxlogincode = res.code;

                    // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.userInfo" 这个 scope
                    wx.getSetting({
                        success: (setres) => {
                            console.log(setres);
                            // console.log(setres.authSetting['scope.userInfo']);
                            if (!setres.authSetting['scope.userInfo']) {
                                // console.log(this.wxlogincode);
                                // this.toast('微信未授权-60')                
                                // wx.reLaunch({//关闭所有页面打开到某个页面
                                //   url: '/pages/newMember/newMember',
                                // })
                            } else {
                                // this.toast('微信已授权-140',5000)
                                this.get_wxUserInfo(page);
                            }
                        },
                        fail: (err) => {
                            this.toast('授权列表获取失败' + err.errMsg)
                            console.log(err);
                        }
                    })
                }
            }
        })
    },
    getencrypteddata(page, paramsData) {
        console.log(this.wxlogincode);
        if (!this.wxlogincode) {
            //没有信息重新去授权
            this.login(); return;
        }
        wx.checkSession({
            success: () => {
                //获取微信用户信息
                wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                        // console.log(res);
                        // 可以将 res 发送给后台解码出 unionId
                        // console.log('userInfo', JSON.parse(JSON.stringify(res.userInfo)));

                        if (res.userInfo) {
                            for (var key in res.userInfo) {
                                this.globalData.userInfo[key] = res.userInfo[key] ? res.userInfo[key] : this.globalData.userInfo[key];
                            }
                        }
                        // console.log('userInfo', JSON.parse(JSON.stringify(this.globalData.userInfo)));   

                        var param;
                        // console.log(appinfo.miniProgram.appId);
                        // 发送 wx_login_code 到后台换取 openId, sessionKey, unionId
                        var userData = res;
                        const appinfo = wx.getAccountInfoSync();
                        // console.log(appinfo);
                        param = {
                            code: paramsData.code, //wxcode
                            appId: paramsData.appId, //appid
                            encryptedData: paramsData.encryptedData,
                            iv: paramsData.iv,
                            session_id: paramsData.session_id,
                        };
                        // console.log(param);  
                        //拿到了授权信息发给后台换取openId, sessionKey, unionId
                        this.userAuthorizeMobile(paramsData, page, appinfo, yiqiyongUserAuthorizeMobile)



                    },
                    fail: (err) => {

                    }
                })
            },
            fail: () => {
                // session_key 已经失效，需要重新执行登录流程
                this.login('home') // 重新登录
            }
        })
    },
    userAuthorizeMobile(paramsData, page, appinfo, urlsData, closeHide) {
        var self = this;
        this.ajax(urlsData, paramsData, (res) => {
            console.log(urlsData + '--返回数据：', res);

            if (this.is_success(res)) {
                if (res.result.session_id != '') {
                    if (this.checkLoginReadyCallback) {
                        wx.login({
                            success(resCode) {
                                if (resCode.code) {
                                    // console.log(res);
                                    self.wxlogincode = resCode.code;
                                    res.result.code = self.wxlogincode;
                                    res.result.appId = appinfo.miniProgram.appId;
                                    self.checkLoginReadyCallback(res);
                                } else {
                                    console.log('登录失败！' + res.errMsg)
                                }
                            }
                        })
                    }
                    return;
                } else {
                    if (this.wxlogincode) {
                        let data = res.result;//拿到token
                        let baseic = res.result.users;
                        // console.log('获取微信openid成功');
                        this.globalData.openid = baseic.openId
                        //把openId存起来
                        wx.setStorage({
                            key: 'yiqiyong_openid',
                            data: this.globalData.openid,
                        })
                        this.globalData.appid = data.appid
                        wx.setStorage({
                            key: 'yiqiyong_appid',
                            data: this.globalData.appid,
                        })
                        //把unionid存起来
                        this.globalData.unionid = baseic.unionId
                        wx.setStorage({
                            key: 'yiqiyong_unionid',
                            data: this.globalData.unionid,
                        })
                        // wx.setStorage({
                        //   key: 'yiqiyong_homeTypeId',
                        //   data: 0,
                        // })   
                        wx.setStorage({
                            key: 'yiqiyong_orderTypeId',
                            data: 1,
                        })
                        //把token存起来
                        this.globalData.token = data.token;
                        wx.setStorage({
                            key: 'yiqiyong_token',
                            data: this.globalData.token,
                        })
                        let userInfo = {
                            mobile: baseic.mobile,
                            nickName: baseic.nickname,
                            avatarUrl: baseic.userHead,
                        }
                        var resUserInfo = userInfo;
                        if (resUserInfo) {
                            for (var key in resUserInfo) {
                                this.globalData.userInfo[key] = resUserInfo[key] || resUserInfo[key] === 0 ? resUserInfo[key] : this.globalData.userInfo[key];
                            }
                        } else {
                            var userinfo = wx.getStorageSync('userInfo')
                            if (userinfo) this.globalData.userInfo = wx.getStorageSync('userInfo');
                        }
                        if (typeof (this.globalData.userInfo.mobile) == 'undefined') {
                            this.globalData.userInfo.mobile = "";
                        }
                        // console.log('组合后的账户信息',this.globalData.userInfo);

                        wx.setStorage({
                            key: 'userInfo',
                            data: this.globalData.userInfo,
                        })
                        if (closeHide != undefined) {
                            closeHide(res);
                        }
                        //去哪个页面
                        if (page == 'home') {
                            wx.switchTab({
                                url: '/pages/home/home',
                            })
                        }

                        if (this.userInfoReadyCallback1) {
                            this.userInfoReadyCallback1(res)
                        }
                        var callback = () => {
                            // console.log(4, this.userInfoReadyCallback);
                            if (this.userInfoReadyCallback.length > 0) {
                                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                                // 所以此处加入 callback 以防止这种情况
                                // console.log('userInfoReadyCallback');
                                var userInfoReady = this.userInfoReadyCallback.shift();
                                // console.log(5, userInfoReady);
                                userInfoReady();

                                callback();
                            }
                        };
                        callback();
                        return;
                    }
                }
            } else {
                this.login('home');
            }
        }, (err) => {
            console.log(err);
            // this.toast(err.errMsg)
        }, 'post');
    },
    get_wxUserInfo(page, aa, closeHide) {
        console.log(this.wxlogincode);
        if (!this.wxlogincode) {
            //没有信息重新去授权
            this.login(); return;
        }
        // console.log('get_wxUserInfo');    
        //获取微信用户信息
        wx.checkSession({
            success: () => {
                console.log('没过期了');
                wx.getUserInfo({
                    withCredentials: true,
                    success: res => {
                        // console.log(res);
                        // 可以将 res 发送给后台解码出 unionId
                        // console.log('userInfo', JSON.parse(JSON.stringify(res.userInfo)));
                        wx.showTabBar();
                        if (res.userInfo) {
                            for (var key in res.userInfo) {
                                this.globalData.userInfo[key] = res.userInfo[key] ? res.userInfo[key] : this.globalData.userInfo[key];
                            }
                        }
                        // console.log('userInfo', JSON.parse(JSON.stringify(this.globalData.userInfo)));   

                        var param;
                        // console.log(appinfo.miniProgram.appId);
                        // 发送 wx_login_code 到后台换取 openId, sessionKey, unionId
                        var userData = res;
                        const appinfo = wx.getAccountInfoSync();
                        // console.log(appinfo);
                        param = {
                            code: this.wxlogincode, //wxcode
                            appId: appinfo.miniProgram.appId, //appid
                            encryptedData: userData.encryptedData,
                            iv: userData.iv
                        };

                        // console.log(param); 

                        //拿到了授权信息发给后台换取openId, sessionKey, unionId
                        if (closeHide == undefined || closeHide == '') {
                            this.userAuthorizeMobile(param, page, appinfo, yiqiyongUserWechatLogin)
                        } else {
                            this.userAuthorizeMobile(param, page, appinfo, yiqiyongUserWechatLogin, closeHide)
                        }

                    },
                    fail: (err) => {
                        // console.log(err);
                        this.toast('您已拒绝授权')
                        var pages = getCurrentPages();
                        console.log(pages);
                        pages[0].hideModalInfo();

                        wx.hideLoading();
                    }
                })
            },
            fail: () => {
                // session_key 已经失效，需要重新执行登录流程
                this.login('home') // 重新登录
            }
        })
    },
    is_phone(obj) {
        return obj.code == 310;
    },
    is_success(obj) {
        // console.log(obj+"-----------------------");
        return obj.code == 0;
    },
    ajax(url, param, success, error, method) {
        if (!param.appid) { param.appid = wx.getAccountInfoSync().miniProgram.appId; }
        if (this.globalData.unionid) {
            // console.log(wx.getStorageSync('yiqiyong_unionid'));
            // param.unionid = this.globalData.unionid;
            param.unionid = wx.getStorageSync('yiqiyong_unionid');
        }
        if (this.globalData.token) {
            // param.token = this.globalData.token;
            param.token = wx.getStorageSync('yiqiyong_token');
        }
        // param.userId=145;
        console.log(param);
        var header = {};
        if (method == 'post') { header = { 'content-type': 'application/x-www-form-urlencoded' }; }
        wx.request({
            url: url,
            data: param,
            header: header,
            method: method || 'GET',
            success: (res) => {
                wx.hideLoading();
                wx.hideToast();
                console.log(res);
                if (res.statusCode == 200 && res.data && res.data.code != null) {
                    success && success(res.data);
                    if (res.data.code != 0 && res.data.msg) {
                        this.toast(res.data.msg || '错误!')
                        if (res.data.code == '305') {
                            var pages = getCurrentPages() //获取加载的页面
                            var currentPage = pages[0] //获取当前页面的对象
                            if (currentPage.route != 'pages/home/home' || currentPage.route != 'pages/newCars/newCars' || currentPage.route == 'pages/newMember/newMember') {
                                wx.navigateBack({
                                    delta: 1
                                })
                                currentPage.getAuthLogin();
                            }

                        } else if (res.data.code == '321') {
                            var pages = getCurrentPages() //获取加载的页面
                            var currentPage = pages[0] //获取当前页面的对象
                            if (currentPage.route != 'pages/home/home' || currentPage.route != 'pages/newCars/newCars' || currentPage.route == 'pages/newMember/newMember') {
                                wx.navigateBack({
                                    delta: 1
                                })
                                currentPage.getAuthLogin();
                            }
                            wx.clearStorage();
                            return;
                        }
                    }
                } else {
                    var tips = '';
                    if (res.statusCode != 200) { tips = `服务器繁忙...`; }
                    else if (res.data) { tips = 'error: ' + JSON.stringify(res.data); }
                    else { tips = 'error: interface program'; }
                    // console.log(tips);
                    if (res.data) {
                        this.toast(tips);
                    }

                    // console.log(res);
                    error && error({ errMsg: tips });
                }
            },
            fail: (err) => {
                console.log(err);
                wx.hideLoading();
                wx.hideToast();
                if (error) error(err);
                else this.toast('连接失败' + err.errMsg)
            }
        })
    },

    toast(msg, time) {
        if (msg) {
            console.log(msg);
            setTimeout(() => {
                wx.showToast({
                    icon: 'none',
                    title: msg,
                })
            }, time || 0);
        }
    },
    userCollectUserFormId(formIdArrlist) {
        let formIdArr = JSON.parse(JSON.stringify(formIdArrlist))
        let params = {
            formId: formIdArr.join(",")
        };
        this.ajax(
            yiqiyongUserCollectUserFormId,
            params,
            res => {
                console.log(res);
                if (this.is_success(res)) {
                    this.formIdArr = [];
                    this.toast(res.msg);
                }
            },
            err => {
                console.log(err);
            },
            'post'
        )
    },
    onHide() {
        if (this.formIdArr.length <= 20 && this.formIdArr.length > 0) {
            let formIdArr = JSON.parse(JSON.stringify(this.formIdArr))
            let params = {
                formId: formIdArr.join(",")
            };
            this.ajax(
                yiqiyongUserCollectUserFormId,
                params,
                res => {
                    console.log(res);
                    if (this.is_success(res)) {
                        this.formIdArr = [];
                        this.toast(res.msg);
                    }
                },
                err => {
                    console.log(err);
                },
                'post'
            )
        }
        // console.log(this.formIdArr);
        // console.log('我应酬了');
        // Do something when hide.

    },
    onError() {
        // 当小程序发生脚本错误，或者 api 调用失败时，会触发 onError 并带上错误信息
    },
    onPageNotFound() {
        // 当要打开的页面并不存在时，会回调这个监听器
    },
    userInfoReadyCallback: [],
    globalData: {
        storeInfo: wx.getStorageSync('yiqiyong_storeinfo'),
        appid: wx.getStorageSync('yiqiyong_appid'),
        apiUrl: commonHostConfig.hostConfig.host,
        pageSize: 10,//分页接口每页返回数据条数--与后端统一
        page: 1,
        openid: wx.getStorageSync('yiqiyong_openid'),
        token: wx.getStorageSync('yiqiyong_token'),
        unionid: wx.getStorageSync('yiqiyong_unionid'),
        userInfo: {},
        shop_qrcode: {},
        isPacart: true,
        imageSrc: commonHostConfig.urlImage.url,
        UploadImageSrc: commonHostConfig.urlImageUploader.url,
    }
});
