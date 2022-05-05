<template>
  <div class="home">
    <div class="title">
      <img src="../assets/img/Logo.png" alt="" />
      <span>file_manage</span>
      <div class="exit_btn">
        <el-button type="danger" @click="exit">exit</el-button>
      </div>
    </div>
    <div class="alert">
      <el-alert
        show-icon
        title="当你上传的文件名重复时，你的名字将会覆盖该文件的上传者名。"
        type="warning"
        :closable="false"
      >
      </el-alert>
    </div>
    <div class="updateBtn">
      <el-button type="primary" @click="dialogVisible = true"
        >上传文件</el-button
      >
    </div>
    <div class="fileshow" v-if="fileList">
      <el-table
        :data="tableList"
        style="width: 100%"
        border
        :default-sort="{ prop: 'createDate', order: 'descending' }"
      >
        <el-table-column
          fixed
          type="index"
          :index="indexMethod"
          label="序号"
          width="80"
        ></el-table-column>
        <el-table-column prop="author" label="上传者" width="180">
        </el-table-column>
        <el-table-column prop="filename" label="文件名" width="400">
        </el-table-column>
        <el-table-column
          prop="createDate"
          label="创建时间"
          width="250"
          sortable
        >
          <template #default="scope">{{
            filterDate(scope.row.createDate)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" prop="id">
          <template #default="scope">
            <el-button type="primary" :icon="EditPen" @click="edit(scope.row)"
              >编辑</el-button
            >
            <el-button
              type="danger"
              :icon="Delete"
              @click="delFile(scope.row.id)"
              v-if="status"
              >删除</el-button
            >
            <el-button
              type="warning"
              :icon="Download"
              @click="downClick(scope.row.filename)"
              >下载</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination" v-if="fileList">
      <el-pagination
        @current-change="handleCurrentChange"
        :page-size="5"
        layout="prev, pager, next, jumper"
        :total="fileList.count"
        background
      >
      </el-pagination>
    </div>
    <el-dialog title="上传文件" v-model="dialogVisible" modal>
      <div
        class="authorname"
        style="width: 300px; display: flex; margin-bottom: 20px"
      >
        <span style="flex-shrink: 0; font-size: 16px; line-height: 34px"
          >上传者：</span
        ><el-input placeholder="请输入内容" v-model="updator"></el-input>
      </div>
      <el-upload
        class="upload-demo"
        drag
        :action="addr"
        :auto-upload="false"
        :on-success="successCall"
        :on-error="errorCall"
        ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip
          ><div class="el-upload__tip">上传文件不超过1GB</div></template
        >
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            @click="
              dialogVisible = false;
              updator = '';
              uploadRef?.clearFiles();
            "
            >取 消</el-button
          >
          <el-button type="primary" @click="uploadFile">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-dialog title="修改文件" v-model="changeFileRec" :modal="true">
      <div
        class="authorname"
        style="width: 300px; display: flex; margin-bottom: 20px"
      >
        <span style="flex-shrink: 0; font-size: 16px; line-height: 34px"
          >文件名：</span
        ><el-input
          placeholder="请输入内容"
          v-model="updateFileInfo.filename"
        ></el-input>
      </div>
      <div
        class="authorname"
        style="width: 300px; display: flex; margin-bottom: 20px"
      >
        <span style="flex-shrink: 0; font-size: 16px; line-height: 34px"
          >上传者：</span
        ><el-input
          placeholder="请输入内容"
          v-model="updateFileInfo.author"
        ></el-input>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            @click="
              changeFileRec = false;
              updateFileInfo.filename = updateFileInfo.author = '';
            "
            >取 消</el-button
          >
          <el-button type="primary" @click="updateFile">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { getAllFile, changeFileName, deleteFile } from "../api/home";
import {
  ElMessage,
  ElInput,
  ElForm,
  ElFormItem,
  ElButton,
  ElDialog,
  ElUpload,
  ElAlert,
  ElTable,
  ElTableColumn,
  ElPagination,
  ElMessageBox,
  ElIcon,
} from "element-plus";
import type { UploadProps, UploadUserFile } from "element-plus";
import moment from "moment";
import { delCookie, getCookie } from "../utils/cookie";
import {
  EditPen,
  Delete,
  Download,
  UploadFilled,
} from "@element-plus/icons-vue";
import { ref, computed } from "@vue/reactivity";
import { useRouter } from "vue-router";
import _ from "lodash";
// 页码
const page = ref(1);
// 上传文件dialog状态
const dialogVisible = ref(false);
// 上传者名字
const updator = ref<string>("");
// 修改文件dialog状态
const changeFileRec = ref(false);
// 更新文件信息
const updateFileInfo = ref<any>({
  id: null,
  filename: null,
  author: null,
});
// 文件列表
const fileList = ref<any>(null);
// 通过页码锁定当前数据
const tableList = computed(() => {
  let list = _.cloneDeep(fileList.value.rows);
  for (const key of list) {
    filterDate(key.createDate);
  }
  list = _.orderBy(list, ["createDate"], ["desc"]);
  return list.slice(
    (page.value - 1) * 5,
    page.value * 5 >= fileList.value.rows.length
      ? fileList.value?.rows.length
      : page.value * 5
  );
});
// 初始化获取文件列表
const getFile = async () => {
  const data = await getAllFile({
    page: 1,
  });
  if (data.data.code === 200) {
    fileList.value = data.data.data;
    ElMessage.success("获取文件列表成功");
  } else {
    ElMessage.error("获取文件列表失败");
  }
};
getFile();

// 请求连接
const addr = computed(
  () => `http://121.40.172.208/uploadapi/upload?author=${updator.value}`
);
// 权限状态
const status = ref(getCookie("status") == "true ");
// 格式化时间
const filterDate = (val: any) => moment(val).format("YYYY MM DD HH:mm:ss");
// 转换下载连接
const getUrl = (val: string | number) =>
  `http://121.40.172.208/uploadapi/static/upload/${val}`;
// 退出登录
const router = useRouter();
const exit = () => {
  delCookie("status");
  router.push({ name: "Login" });
};
// 列表序号
const indexMethod = (index: number) => ++index;
// uploadRef
const uploadRef = ref<InstanceType<typeof ElUpload>>();
// 上传文件
const uploadFile = () => {
  if (!updator.value) {
    ElMessage({
      message: "上传者不能为空",
      type: "warning",
    });
  } else {
    // 提交并重置表格
    uploadRef.value?.submit();
    updator.value = "";
    dialogVisible.value = false;
    // 立即清楚文件会导致上传时无法检测该文件
    setTimeout(() => {
      uploadRef.value?.clearFiles();
    }, 500);
  }
};
// 编辑
const edit = (item: any) => {
  updateFileInfo.value.id = item.id;
  updateFileInfo.value.filename = item.filename.split(".")[0];
  updateFileInfo.value.author = item.author;
  changeFileRec.value = true;
};
// 更新文件
const updateFile = async () => {
  if (updateFileInfo.value.filename && updateFileInfo.value.author) {
    await changeFileName({
      ...updateFileInfo.value,
      filename: updateFileInfo.value.filename + ".docx",
    });
    updateFileInfo.value.id = null;
    updateFileInfo.value.filename = null;
    updateFileInfo.value.author = null;
    changeFileRec.value = false;
    await getFile();
    ElMessage({
      message: "修改文件成功",
      type: "success",
    });
  } else {
    ElMessage({
      message: "文件名或上传者名不能为空",
      type: "warning",
    });
  }
};
// 删除文件
const delFile = (id: string) => {
  ElMessageBox.confirm("此操作将永久删除该文件, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      await deleteFile(id);
      getFile();
      ElMessage({
        type: "success",
        message: "删除成功!",
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消删除",
      });
    });
};
// 页面改变
const handleCurrentChange = (index: number) => {
  page.value = index;
  // getFile();
};
// 上传成功回调
const successCall = async () => {
  await getFile();
  ElMessage({
    message: "上传文件成功",
    type: "success",
  });
};
// 上传失败回调
const errorCall = () => {
  ElMessage({
    message: "上传文件失败",
    type: "error",
  });
};
// 下载文件
const downClick = (val: string | number) => {
  window.location.href = getUrl(val);
};
</script>
<style lang="scss" scoped>
@import "../assets/style/var.scss";
.home {
  background-color: white;
  .pagination {
    width: 100%;
    padding: 10px 140px;
    box-sizing: border-box;
  }
  .alert {
    padding: 0px 140px;
    padding-top: 8px;
  }
  .fileshow,
  .updateBtn {
    width: 100%;
    padding: 20px 140px;
    box-sizing: border-box;
  }
  .title {
    height: 65px;
    padding-left: 40px;
    box-sizing: border-box;
    background-color: $base-color;
    position: relative;
    display: flex;
    align-items: center;
    > img {
      width: 42px;
      height: 42px;
      margin-right: 12px;
    }
    > .exit_btn {
      position: absolute;
      right: 140px;
      top: 0;
      height: 65px;
      display: flex;
      align-items: center;
    }
    > i {
      font-size: 32px;
      color: rgb(6, 168, 245);
      margin-right: 12px;
      vertical-align: sub;
    }
    > span {
      font-size: 24px;
      color: white;
      line-height: 65px;
    }
  }
}
</style>
