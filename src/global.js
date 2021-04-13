import Money from '@/components/Money'
import vRules from '@/utils/validate'

const install = function(Vue){
  // 注册全局组件
  Vue.component(Money.name, Money);

  // 注册全局变量和函数
  Vue.prototype.$vRules = vRules

}

export default {
  install,
}
