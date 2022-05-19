
## 实现 Promise.resolve

实现 resolve 静态方法有三个要点:

-  传参为一个 Promise, 则直接返回它。
-  传参为一个 thenable 对象，返回的 Promise 会跟随这个对象，`采用它的最终状态`作为`自己的状态`。
-  其他情况，直接返回以该值为成功状态的promise对象。

具体实现如下:

```javascript
Promise.resolve = (param) => {
  if(param instanceof Promise) return param;
  return new Promise((resolve, reject) => {
    if(param && param.then && typeof param.then === 'function') {
      // param 状态变为成功会调用resolve，将新 Promise 的状态变为成功，反之亦然
      param.then(resolve, reject);
    }else {
      resolve(param);
    }
  })
}
```


## 实现 Promise.reject

Promise.reject 中传入的参数会作为一个 reason 原封不动地往下传, 实现如下:

```javascript
Promise.reject = function (reason) {
    return new Promise((resolve, reject) => {
        reject(reason);
    });
}
```


## 实现 Promise.prototype.finally

无论当前 Promise 是成功还是失败，调用`finally`之后都会执行 finally 中传入的函数，并且将值原封不动的往下传。

```javascript
Promise.prototype.finally = function(callback) {
  this.then(value => {
    return Promise.resolve(callback()).then(() => {
      return value;
    })
  }, error => {
    return Promise.resolve(callback()).then(() => {
      throw error;
    })
  })
}
```

# 参考文章
[三元博客](https://sanyuan0704.top/)
