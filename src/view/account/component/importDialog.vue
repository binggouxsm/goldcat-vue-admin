<template>
  <el-dialog title="账单上传" :visible.sync="dialogOpen" v-loading="loading">
    <el-form ref="recordFileForm"   label-width="100px">
      <el-form-item label="账单文件：">
        <el-upload ref="recordUpload" drag auto-upload action="/fileInfo"

                   :limit="1"
                   :before-upload="beforeUpload"
                   :on-success="uploadSuccess">
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>

        </el-upload>
        <span v-if="file"><i class="el-icon-document"></i>  {{ file.name }}</span>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="importRecord">导入</el-button>
      <el-button @click="dialogOpen=false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script>
  import request from '@/utils/request'

  export default {
    name: "importDialog",
    props:{
      account: Object,
      dialogOpen: Boolean,
    },
    data(){
      return {
        file: null,
        loading:false
      }
    },
    methods:{
      importRecord(){
        request({
          url:'/record/import',
          method: 'post',
          data:{
            accountId: this.account.accountId,
            ...this.file
          }
        }).then((res) =>{
          this.$message({
            message: '提交成功',
            type: 'success'
          })
          this.loading = false
        })

      },
      beforeUpload(){
        this.loading = true
        return true
      },
      uploadSuccess(res, file, fileList){
        if (res.code != 20000){
          this.$message({
            message: '上传失败',
            type: 'error'
          })
          return
        }

        this.file = { fileId: res.data.fileId, name: res.data.name}
        this.$refs.recordUpload.clearFiles()
        this.loading = false
      },

    }
  }
</script>

<style scoped>

</style>
