/*
 * @Author: 刘鲍 
 * @Date: 2019-09-04 19:33:23 
 * @Last Modified by: 刘鲍
 * @Last Modified time: 2019-09-05 14:32:45
 */

import axios from 'axios';
import router from '../router/index'

var instance = axios.create();

// 添加请求拦截器
instance.interceptors.request.use(function (config) {
    
    let notTokenUrl=['/api/login','/api/registry'];
    // 在发送请求之前做些什么
    return notTokenUrl.includes(config.url)?config:{
        ...config,
        headers:{
            ...config.headers,
            token:window.localStorage.getItem('token')
        }
    }
  }, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  });

// 添加响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
  }, function (error) {
    // 对响应错误做点什么
    let {status}=error.response;
    if(status<500){
        switch(status){
            case 422:alert("参数有误")
                     break;
            case 401:alert("没有权限");
                     router.push('/login')
                     break;
            default:break;
        }
    }else{
        alert("服务器端错误")
    }
    return Promise.reject(error);
});

export default {
    post(url,data){
        return instance.post(url,data)
    },
    get(url,data){
        return instance.get(url,{params:data})
    }
}