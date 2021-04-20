<template>
  <div class="app-container acc-container">
    <el-tabs type="card" v-model="typeId">
      <el-tab-pane label="概览" :name="'0'">概览</el-tab-pane>
      <template v-for="accountType in accountTypes">
        <el-tab-pane :label="accountType.name" :name="accountType.typeId+''">
        <Overview :accountType="accountType" :bookId="bookId"/>
        </el-tab-pane>
      </template>
    </el-tabs>
  </div>

</template>

<script>
  import request from '@/utils/request'


  import Overview from './component/overview'

  export default {
    name: "index",
    components:{Overview},
    data(){
      return {
        accountTypes: [],
        bookId: this.$route.params.bookId,
        typeId: this.$route.params.typeId,
      }
    },
    created(){
      request({
        url: '/type/ACCOUNT_TYPE',
      }).then((data) =>{
        this.accountTypes = data
      })
    },
    methods:{

    }
  }
</script>

<style>
  .acc-container .el-tabs .el-tabs__item.is-active {
    background-color: #FFFFFF;
  }
</style>
