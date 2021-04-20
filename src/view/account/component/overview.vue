<template>
  <div style="padding: 10px 20px;">
    <el-row class="summary">
      <el-col :span="5" class="item">
        <p class="item-name">余额</p>
        <p class="item-num"><Money :value="summary.balanceSum"/></p>
      </el-col>
      <el-col :span="5" class="item">
        <p class="item-name">流入</p>
        <p class="item-num font-color-red"><Money :value="summary.inSum"/></p>
      </el-col>
      <el-col :span="5" class="item">
        <p class="item-name">流出</p>
        <p class="item-num font-color-green"><Money :value="summary.outSum"/></p>
      </el-col>
      <el-col :span="5" class="item">
        <p class="item-name">转账</p>
        <p class="item-num font-color-yellow"><Money :value="summary.transferSum"/></p>
      </el-col>
      <el-col :span="3">
        <el-button type="primary" @click="newAccount">新增账户</el-button>
      </el-col>

    </el-row>


    <el-dialog title="账户详情" :visible.sync="dialogOpen">
      <el-form ref="accountForm" :model="currAccount" :rules="accountRules" label-width="100px">
        <el-form-item label="账户名称：" prop="name">
          <el-input  v-model="currAccount.name"></el-input>
        </el-form-item>
        <el-form-item label="账户号：" prop="accountNo">
          <el-input v-model="currAccount.accountNo"></el-input>
        </el-form-item>
        <el-form-item label="币种：" prop="currency">
          <el-select  v-model="currAccount.currency">
            <el-option v-for="(value, key) in currencyDict" :label="value[1]" :value="value[0]"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="余额：" prop="balance">
          <el-input v-model="currAccount.balance"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="saveAccount">保存</el-button>
        <el-button @click="dialogOpen=false">取消</el-button>
      </div>
    </el-dialog>

    <ImportDialog :account="currAccount" :dialogOpen="importDialogOpen"></ImportDialog>


    <template v-for="(account, index) in accounts">
      <el-card class="acc-info" >
        <div slot="header">
          <span class="acc-name">{{ account.name }}</span><span class="acc-no">{{ account.accountNo }}</span>
        </div>
        <div class="clearfix">
          <div class="acc-oper">
            <el-link icon="el-icon-edit" :underline="false" @click="editAccount(account)">编辑</el-link>
            <el-link icon="el-icon-delete" :underline="false" @click="deleteAccount(account)">删除</el-link>
            <el-link icon="el-icon-upload2" :underline="false" @click="openImportDialog(account)">导入</el-link>
            <el-link icon="el-icon-document-checked" :underline="false" @click="jumpToRecord(account)">账单详情</el-link>
          </div>
          <div class="acc-amt">
            <div class="acc-amt-bal"><span class="acc-curr">{{ account.currency }}</span><Money :value="account.balance"/></div>
            <div class="acc-amt-inout">
              <span>流入</span><Money class="font-color-red" :value="account.monthIn"/>
              <span>流出</span><Money class="font-color-green" :value="account.monthOut"/>
              <span>转账</span><Money class="font-color-yellow" :value="account.monthTransfer"/></div>
          </div>
        </div>
      </el-card>
    </template>


  </div>

</template>

<script>
  import request from '@/utils/request'
  import { mapGetters } from 'vuex'
  import ImportDialog from './importDialog'

  export default {
    name: "overview",
    props: {
      accountType:Object,
      bookId: String
    },
    components:{
      ImportDialog
    },
    data(){
      return {
        accounts: [],
        currAccount: {},
        dialogOpen: false,
        accountRules:{
          name: [this.$vRules.required, this.$vRules.checkBitLen(4,180)],
          accountNo:[this.$vRules.digits, this.$vRules.checkLen(1,100)],
          currency: [this.$vRules.required],
          balance:[this.$vRules.number]
        },
        importDialogOpen: false,

      }
    },
    computed:{
      ...mapGetters({
        code: 'dict/code'
      }),
      currencyDict(){
        return this.code('CURRENCY')
      },
      summary(){
        let balanceSum=0,inSum=0,outSum=0,transferSum=0
        this.accounts.forEach((acc) =>{
          balanceSum+= acc.balance
          inSum+=acc.monthIn
          outSum+=acc.monthOut
          transferSum+=acc.monthTransfer
        })
        return {balanceSum,inSum,outSum,transferSum}
      }

    },
    created(){
      this.refresh()
    },
    methods:{
      refresh(){
        request({
          url: 'account/query',
          method: 'post',
          data:{bookId: this.bookId, type: this.accountType.typeId}
        }).then(data => {
          this.accounts = data
        })
      },
      newAccount(){
        this.currAccount = { type: this.accountType.typeId, bookId: this.bookId }
        this.dialogOpen = true
      },
      editAccount(account){
        this.currAccount = {...account}
        this.dialogOpen = true
      },
      deleteAccount(account){
        this.$confirm("是否确定删除？").then(()=>{
          request({
            url:'account',
            method: 'delete',
            data: account
          }).then((res)=>{
            this.$message({
              message: '提交成功',
              type: 'success'
            });
            this.refresh()
          })
        })
      },
      saveAccount(){
        console.log(this.$refs.accountForm.validate)
        this.$refs.accountForm.validate((valid) =>{
          if(valid){
            this.dialogOpen = false
            request({
              url: 'account',
              method: 'post',
              data: this.currAccount
            }).then((res) =>{
              this.$message({
                message: '提交成功',
                type: 'success'
              });
              this.refresh()
            })
          }else {
            return false
          }
        })
      },
      openImportDialog(account){
        this.currAccount = {...account}
        this.importDialogOpen = true
      },
      jumpToRecord(account){

      }
    }
  }
</script>

<style lang="scss" scoped>
.summary{
  padding-bottom: 10px;

  .item{
    padding: 10px 35px;
    border-right: 1px solid #eaeaec;

    &:nth-last-child(2){
      border: none;
    }

    .item-name{
      font-size: 12px;
      color: #aaa;
    }

    .item-num{
      font-size: 26px;
      margin-top: 8px;
    }
  }
}

.acc-info {
  margin-bottom: 15px;

  .acc-name{
    display: inline-block;
    font-weight: bold;
    font-size: 18px;
    color: #312f2c;
    width: 100px;
  }

  .acc-no{
    font-size: 12px;
    color: #aaa;
  }

  .acc-curr{
    font-size: 12px;
    color: #aaa;
  }

  .acc-oper{
    float: left;
    padding-top: 37px;
    a{
      padding-right: 10px;
    }
  }

  .acc-amt{
    float: right;
    text-align: right;

    .acc-amt-bal{
      color: #312f2c;
      font-size: 28px;
    }

    .acc-amt-inout{
      font-size: 12px;
      color: #aaa;
    }
    span{
      padding-left: 10px;
    }
  }

}
</style>
