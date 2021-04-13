<template>
  <span>{{ formatValue }}</span>
</template>

<script>
  import { formatNumber } from '@/utils/money'
  export default {
    name: "Money",
    props: {
      value: {
        type: Number,
        default: 0
      },
      decimal:{
        type: Number,
        default: 2
      },
    },
    computed:{
      formatValue: function(){
        return formatNumber(this.value, this.decimal)
      }
    }

  }
</script>

<style scoped>

</style>
