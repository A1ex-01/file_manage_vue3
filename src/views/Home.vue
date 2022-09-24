<template>
  <div class="home">
    <div class="title">
      <img src="../assets/img/Logo.png" alt="" />
      <span>file_manage</span>
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
      <el-table :data="fileList" style="width: 100%" border>
        <el-table-column
          fixed
          type="index"
          :index="indexMethod"
          label="序号"
          width="80"
        ></el-table-column>
        <el-table-column prop="name" label="标题" width="200">
        </el-table-column>
        <el-table-column prop="filename" label="文件名" width="400">
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="250" sortable>
          <template #default="scope">{{
            filterDate(scope.row.createdAt)
          }}</template>
        </el-table-column>
        <el-table-column label="操作" prop="id">
          <template #default="scope">
            <el-link
              :href="'http://localhost:8001/file/' + scope.row.id"
              type="warning"
              underline
              >下载</el-link
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination" v-if="fileList">
      <el-pagination
        @current-change="pageChange"
        :page-size="limit"
        layout="prev, pager, next, jumper"
        :total="count"
        background
      >
      </el-pagination>
    </div>
    <el-dialog title="上传文件" v-model="dialogVisible" modal>
      <el-row style="margin: 20px 0">
        <el-col :span="2" class="col-s">
          <span>标题:</span>
        </el-col>
        <el-col :span="10">
          <el-input v-model="authorInfo.name" placeholder="请输入标题" />
        </el-col>
      </el-row>
      <el-upload
        class="upload-demo"
        drag
        :auto-upload="false"
        :on-success="successCall"
        :on-error="errorCall"
        :on-change="onChange"
        :limit="1"
        :file-list="fl"
        ref="uploadRef"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          Drop file here or <em>click to upload</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">上传文件不超过4MB</div></template
        >
      </el-upload>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            @click="
              dialogVisible = false;
              uploadRef?.clearFiles();
            "
            >取 消</el-button
          >
          <el-button type="primary" @click="uploadFile">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts" setup>
import { getAllFile } from "../api/home";
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
  ElRow,
  ElCol,
  ElLink,
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
import { reactive } from "vue";
import { useRouter } from "vue-router";
import _ from "lodash";
import { limitShift } from "@floating-ui/core";
import { uploadFileApi } from "../api/home";
// 页码
const page = ref(1);
const limit = ref(5);

const fl = ref([]);

// 文件列表
const fileList = ref<any>(null);
const count = ref();

// 初始化获取文件列表
const getFile = async () => {
  const data = await getAllFile({
    offset: (page.value - 1) * limit.value,
  });
  if (data.code === 200) {
    fileList.value = data.data.rows;
    count.value = data.data.count;
    ElMessage.success("获取文件列表成功");
  } else {
    ElMessage.error("获取文件列表失败");
  }
};
await getFile();

// 页面改变
const pageChange = (index: number) => {
  page.value = index;
  getFile();
};

// 格式化时间
const filterDate = (val: any) => moment(val).format("YYYY MM DD HH:mm:ss");

// 上传文件dialog状态
const dialogVisible = ref(false);

// 上传者信息
const authorInfo = reactive({
  name: "",
  file: "",
});
// 转换下载连接
const getUrl = (val: string | number) =>
  `http://121.40.172.208/uploadapi/static/upload/${val}`;

// 列表序号
const indexMethod = (index: number) => ++index;
// uploadRef
const uploadRef = ref();
// 上传文件
const uploadFile = async () => {
  if (!authorInfo.name || !authorInfo.file) {
    ElMessage({
      message: "上传者或文件不能为空",
      type: "warning",
    });
  } else {
    // 提交并重置表格
    const { code, data } = await uploadFileApi(authorInfo);
    if (code === 200) {
      authorInfo.name = "";
      authorInfo.file = "";
      dialogVisible.value = false;
      // 立即清楚文件会导致上传时无法检测该文件
      await getFile();
      setTimeout(() => {
        uploadRef.value!.clearFiles();
        fl.value = [];
      }, 500);
      ElMessage({ type: "success", message: "上传成功" });
    } else {
      ElMessage({ type: "warning", message: data });
      authorInfo.file = "";
      console.log(uploadRef.value);
      uploadRef.value!.clearFiles();
      fl.value = [];
    }
  }
};
// 更新文件
// const updateFile = async () => {
//   if (updateFileInfo.value.filename && updateFileInfo.value.author) {
//     await changeFileName({
//       ...updateFileInfo.value,
//       filename: updateFileInfo.value.filename + ".docx",
//     });
//     updateFileInfo.value.id = null;
//     updateFileInfo.value.filename = null;
//     updateFileInfo.value.author = null;
//     changeFileRec.value = false;
//     await getFile();
//     ElMessage({
//       message: "修改文件成功",
//       type: "success",
//     });
//   } else {
//     ElMessage({
//       message: "文件名或上传者名不能为空",
//       type: "warning",
//     });
//   }
// };
// 删除文件
// const delFile = (id: string) => {
//   ElMessageBox.confirm("此操作将永久删除该文件, 是否继续?", "提示", {
//     confirmButtonText: "确定",
//     cancelButtonText: "取消",
//     type: "warning",
//   })
//     .then(async () => {
//       await deleteFile(id);
//       getFile();
//       ElMessage({
//         type: "success",
//         message: "删除成功!",
//       });
//     })
//     .catch(() => {
//       ElMessage({
//         type: "info",
//         message: "已取消删除",
//       });
//     });
// };

// 上传成功回调
const successCall = async () => {
  await getFile();
  ElMessage({
    message: "上传文件成功",
    type: "success",
  });
};

// 点击上传文件后
const onChange = (file: any, files: any) => {
  !authorInfo.file && (authorInfo.file = file.raw);
};

// 上传失败回调
const errorCall = () => {
  ElMessage({
    message: "上传文件失败",
    type: "error",
  });
};
// 下载文件
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
.col-s {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
