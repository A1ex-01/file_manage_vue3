import axios from "axios";
// 创建axios实例
const ins = axios.create({
  timeout: 20000, // 超时取消
  baseURL: "api/",
});
// axios拦截器
ins.interceptors.request.use(
  (config) => {
    // 携带数据请求的配置
    // config.headers.common['Authorization'] = getCookie('token');
    return config;
  },
  (error) => {
    ("error");
    return Promise.reject(error);
  }
);

// 封装数据请求
export default function request(config: any): any {
  if (!config) {
    alert("不能传入空值");
    return;
  }
  const { url, method = "GET", data, postType = "json" } = config;
  if (!url) {
    alert("url必须传入");
    return;
  }
  switch (method.toUpperCase()) {
    case "GET":
      return ins.get(url, { params: data });
    case "POST":
      if (postType == "json") {
        return ins.post(url, data);
      }
      // if (postType == "form"){
      //     ins.post(url,qs.stringify(data));
      //     return
      // }
      if (postType == "file") {
        // FormData 参数转换
        const params = new FormData();
        for (let key in data) {
          params.append(key, data[key]);
        }
        return ins.post(url, params);
      }
      return;
    case "PUT":
      return ins.put(url, data);
    case "DELETE":
      return ins.delete(url, { data });
    default:
      return ins(config);
  }
}
