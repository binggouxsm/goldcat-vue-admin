const Mock = require('mockjs')

const list = []
const count = 100

for (let i = 0; i < count; i++) {
  list.push(Mock.mock({
    id: i,
    'processType|1': ['0','1','2','3'] , // ['入库','出库','交易','质押']
    taskStartTime: '@datetime',
    'nodeName|1': ['仓库审核中','海关审核中','银行审核中'],
    owner: '@cname',
    ownerOrg: 'XX大豆商',
    "declareNo|1-10000": 10000,
    "bondedNo|1-10000": 10000,
    "warehouseNo|1-10000": 10000,
    pledgeeOrg: 'XX银行',
    "pledgeTerm|1-3": 3,
    "amount|1-10000000.1-10": 10000.00,
    currency: '人民币',
    "contractNo|1-10000": 10000,
    "guaranteeNo|1-10000": 10000,
    "cancelContractNo|1-10000": 10000,
    buyer:'XX大豆商',
    seller:'XX大豆商',
    buyerBank: 'XX银行',
    sellerBank: 'XX银行',
    "buyerTradeNo|1-10000": 10000,
    "sellerTradeNo|1-10000": 10000,
  }))
}

const receipts = []

for (let i = 0; i < 3; i++) {
  receipts.push(Mock.mock({
    "id|1-10000": 10000,
    "receiptNo|1-10000": 10000,
    name:'XX货物',
    'size|1': ['大型','中型','小型'],
    "quantity|1-10000": 10000,
    "ownQuantity|1-10000": 10000,
    "fronzeQuantity|1-10000": 10000,
    'unit|1': ['个','公斤'],
    "netweight|1-10000000.1-10": 10000.00,
    "grossweight|1-10000000.1-10": 10000.00
  }))
}

const taskList = [
  {taskNode:'草拟', actor: '熊磊', actorOrg:'XX大豆商',taskStartTime: '2020-11-20 19:21:37',audit:'通过',auditNotes:'同意'},
  {taskNode:'仓库审核', actor: '张三', actorOrg:'XX仓库',taskStartTime: '2020-11-22 19:21:37',audit:'通过',auditNotes:'货物到位，与描述一致'},
  {taskNode:'海关审核', actor: '李四', actorOrg:'青岛海关',taskStartTime: '2020-11-24 19:21:37',audit:'不通过',auditNotes:'货物与报关单不一致'},
]

module.exports = [
  {
    url: '/order/query',
    type: 'post',
    response: config => {
      let { processType, owner, currentPageNo = 1, pageSize = 15 } = config.body
      let filterList = list.filter(item => {
        if (processType && item.processType !== processType) return false
        if (owner && item.owner.indexOf(owner) < 0) return false
        return true
      })
      let pageList = filterList.filter((item, index) => index < pageSize * currentPageNo && index >= pageSize * (currentPageNo - 1))
      return {
        code: 20000,
        data: {
          pageTotal: filterList.length,
          dataList: pageList,
          currentPageNo: currentPageNo,
          pageSize: pageSize
        }
      }
    }
  },
  {
    url: '/order/detail',
    type: 'post',
    response: config => {
      let { orderId, processType } = config.body
      let obj = list[parseInt(orderId)]
      return {
        code: 20000,
        data: {
          ...obj,
          receipts
        }
      }
    }
  },
  {
    url: '/order/task',
    type: 'post',
    response: config => {
      let { orderId, processType } = config.body
      return {
        code: 20000,
        data: taskList
      }
    }
  },
  {
    url: '/receipt/query',
    type: 'post',
    response: config => {

      return {
        code: 20000,
        data: {
          pageTotal: receipts.length,
          dataList: receipts,
          currentPageNo: 1,
          pageSize: 15
        }
      }
    }
  }
]
