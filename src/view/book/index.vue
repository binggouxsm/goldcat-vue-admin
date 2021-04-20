<template>
  <div class="app-container">
    <el-row>
      <el-col :span="8" v-for="book in accountBook">
        <el-card>
          <div slot="header">{{ book.name }}</div>
          <el-button type="text" @click="toAccount(book.bookId)">进入</el-button>
        </el-card>
      </el-col>


    </el-row>


  </div>



</template>

<script>
  import request from '@/utils/request'

  export default {
    name: "bookList",
    data(){
      return {
        accountBook: []
      }
    },
    created(){
      request({
        url: 'accountBook'
      }).then((data) =>this.accountBook = data)
    },
    methods:{
      toAccount(bookId){
        this.$router.push('/account/'+bookId+'/accType/0')
      }
    }
  }
</script>

<style scoped>

</style>
