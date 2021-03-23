<template>
  <div class="app-container">
    <el-tabs>
      <el-tab-pane label="概览">概览</el-tab-pane>
      <template v-for="accountType in accountTypes">
        <el-tab-pane :label="accountType.name">
        <Overview :accountType="accountType"/>
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

<style scoped>

</style>
