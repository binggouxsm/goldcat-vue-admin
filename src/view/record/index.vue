<template>
  <div class="app-container">
    <div >
      <el-form :inline="true" :model="queryForm" size="small">
        <el-form-item label="账户：">
          <el-input  placeholder="审批人"></el-input>
        </el-form-item>
        <el-form-item label="账单时间：">
          <el-select>
            <el-option>投资账户</el-option>
            <el-option>投资账户</el-option>
            <el-option>投资账户</el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" >查询</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>




</template>

<script>
  export default {
    name: "recordList",
    data(){
      return {
        queryForm:{}
      }
    }
  }
</script>

<style scoped>

</style>
