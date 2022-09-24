import request from "../utils/request";

// 获取所有已上传文件
function getAllFile(data: any) {
  return request({
    url: "/file",
    method: "get",
    data,
  });
}

function uploadFileApi(data: any) {
  return request({ url: "/file", method: "post", data, postType: "file" });
}
export { getAllFile, uploadFileApi };
