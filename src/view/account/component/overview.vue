<template>
  <div class="app-container">
    <div>概览部分</div>
    <el-button type="primary" @click="newAccount">新增账户</el-button>

    <el-dialog title="账户详情" :visible.sync="dialogOpen">
      <el-form ref="" :model="currAccount" label-width="100px">
        <el-form-item label="账户名称：">
          <el-input  v-model="currAccount.name"></el-input>
        </el-form-item>
        <el-form-item label="币种：">
          <el-select  v-model="currAccount.currency">
            <el-option v-for="currencyItem in currencydict" :label="currencyItem.name" :value="currencyItem.code"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="余额：">
          <el-input v-model="currAccount.balance"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="saveAccount">保存</el-button>
        <el-button @click="dialogOpen=false">取消</el-button>
      </div>
    </el-dialog>

    <template v-for="account in accounts">
      <el-card >
        <div slot="header">
          {{ account.name }}  {{ account.currency }}
        </div>


      </el-card>
    </template>


  </div>

</template>

<script>
  import request from '@/utils/request'
  import { Message } from 'element-ui'
  import qs from 'qs'

  export default {
    name: "overview",
    props: {
      accountType:Object,
    },
    data(){
      return {
        accounts: [],
        currAccount: {},
        dialogOpen: false,
        currencydict:[]
      }
    },
    created(){
      this.$store.dispatch('dict/getCode','CURRENCY').then((data) =>{this.currencydict = data})
    },
    methods:{
      refresh(){

      },
      newAccount(){
        this.currAccount = { type: this.accountType.typeId }
        this.dialogOpen = true
      },
      saveAccount(){

        request({
          url: 'account',
          method: 'post',
          data: this.currAccount
        }).then((res) =>{
          this.$message({
            message: '提交成功',
            type: 'success'
          });
        })
      }
    }
  }
</script>

<style scoped>

</style>
