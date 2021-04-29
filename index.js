class Promise{
  //定义三个Promise内部状态：等待、完成、拒绝
  static PENDING = 'pending'
  static FUFILLED = 'fufilled'
  static REJECTED = 'rejected'
  
  //构造函数 里面是一个执行器 执行器会在类被实例化的时候自动调用
  constructor (exector){ 
    //初始化状态
    this.status = Promise.PENDING
    //管理处理后的状态
    this.value = null
    //声明一个callbacks回调数组, 放置为被立马执行的方法
    this.callBacks = []
    try {
      //执行器接收两个参数 resolve和reject 
      exector(this.resolve.bind(this), this.reject.bind(this))
    } catch (error) {
      this.reject(error)
    }
  }
  //异步任务顺利执行且有返回值时,会调用resolve函数
  resolve(value){
    if(this.status===Promise.PENDING){
      //保存需要resole的数据
      this.value = value
      //状态改为fufilled，不能再次改变
      this.status = Promise.FUFILLED
      //pending状态的宏任务，实现链式异步调用
      setTimeout(() => {
        this.callBacks.map(callBack => {
          callBack.onfufilled(this.value)
        })
      });
    }
  }
  //执行失败且返回错误信息(通常是一个错误对象) 会调用reject函数
  reject(reason){
    if(this.status===Promise.PENDING){
      //保存需要reject失败的信息
      this.value = reason
      //状态改为rejected，不能再次改变
      this.status = Promise.REJECTED
      //pending状态的宏任务，实现链式异步调用
      setTimeout(() => {
        this.callBacks.map(callBack => {
          callBack.onrejected(this.value)
        })
      });
    }
  }
  //链式调用then方法
  then(onfufilled,onrejected){
    //如果onfufilled,onrejected 不是函数就不做操作
    if(typeof onfufilled !== 'function'){onfufilled = () => {}}
    if(typeof onrejected !== 'function'){onrejected = () => {}}
    //链式回调,所以then方法也返回一个Promise
    return new Promise((resolve,reject)=>{
      //如果状态是fufiled,就执行resolve方法
      if(this.status === Promise.FUFILLED){
        //用异步方法将fufilled方法放入宏队列
        setTimeout(() => {
          try {
            onfufilled(this.value)
          } catch (error) {
            onrejected(error)
          }
        }, 0);
      }else if(this.status === Promise.REJECTED){
        setTimeout(() => {
          try {
            onrejected(this.value)
          } catch (error) {
            onrejected(error)
          }
        }, 0);
      }else if(this.status === Promise.PENDING){
        //当状态是pending时,在类中声明一个callBacks函数,放置为中立马执行的方法
        this.callBacks.push({
          onfufilled:value=>{
            try {
              onfufilled(value)
            } catch (error) {
              onrejected(error)
            }
          },
          onrejected:reason=>{
            try {
              onrejected(reason)
            } catch (error) {
              onrejected(error)
            }
          }
        })
      }
    })
  }
  all(promises){
    //all方法也是链式调用,所以也返回Promise
    return new Promise((resolve,reject) => {
      if(!Array.isArray(promises)){
        //需要对传入的参数进行数据类型判断, 如果不是数组类型直接reject抛出提示信息
        return reject('传入参数必须是数组格式!')
      }
      let resAll = []
      let count = 0
      const promiseLength = promises.length
      promises.forEach((promise, index) => {
      // 遍历数组中的每一个promise对象, 调用其then方法, 获取其中resolve或者reject的数据
      // 利用Promise的静态方法resolve检测参数都是Promise类型
        promise.then(res => {
          resAll[index] = res
          count++
          if(count===promiseLength)resolve(resAll)
        })
      });
    })
  }
  race(promises) {
    return new Promise((resolve,reject) =>{
    // 这里需要对传入的参数进行一下类型的判断
        if(!Array.isArray(promises)){
           return reject(new Error('参数必须是一个数组类型!'))
        }
        let hasValue = false
        let hasError = false
        promises.forEach(promise =>{
          console.log(hasValue,hasError);
          // 这里需要用Promise.resolve处理一下, 防止当前遍历对象不是promise类型
          promise.then(data=>{
              !hasValue && !hasError && resolve(data)
              hasValue = true
            }, err=>{
              !hasValue && !hasError && reject(err)
              hasError = true
            })
        })
    })
  }
}
Promise.all = function(promises){
  //all方法也是链式调用,所以也返回Promise
  return new Promise((resolve,reject) => {
    if(!Array.isArray(promises)){
      //需要对传入的参数进行数据类型判断, 如果不是数组类型直接reject抛出提示信息
      return reject('传入参数必须是数组格式!')
    }
    let resAll = []
    let count = 0
    const promiseLength = promises.length
    promises.forEach((promise, index) => {
    // 遍历数组中的每一个promise对象, 调用其then方法, 获取其中resolve或者reject的数据
    // 利用Promise的静态方法resolve检测参数都是Promise类型
      promise.then(res => {
        resAll[index] = res
        count++
        if(count===promiseLength)resolve(resAll)
      })
    });
  })
}
const getPList = () => {
  let arrP = []
  for(let i=0; i< 10; i++) {
    arrP[i] = new Promise((resolve, reject) => {
      let [v, t] = [Math.random(), Math.random() * 1000]
      setTimeout(() => {
        v > 0.1 ? resolve(v) : reject(v)
      }, t)
    })
  }
  return arrP
}

new Promise((resolve,reject)=>{
  let [val, time] = [Math.random(), Math.random() * 1000]
  setTimeout(() => {
    val>0.2?resolve(val):reject(val)
  }, time)
}).then(res=>{
  console.log("then",res);
})
// Promise.all(getPList()).then(
//   data => console.log('promise.all 测试:'+ data),
//   err => console.log('promise.all 测试:'+ err)
// )
