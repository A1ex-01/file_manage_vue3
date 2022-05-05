import request from "../utils/request";

// 获取所有已上传文件
function getAllFile(data: any) {
  return request({
    url: "all",
    method: "get",
    data: {
      ...data,
      limit: 1000,
    },
  });
}
function changeFileName(data: any) {
  return request({
    url: "update",
    method: "get",
    data: data,
  });
}
function deleteFile(id: number | string) {
  return request({
    url: "delete?id=" + id,
    method: "delete",
  });
}
export { getAllFile, changeFileName, deleteFile };
