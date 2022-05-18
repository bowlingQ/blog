splice 可以说是最受欢迎的数组方法之一，api 灵活，使用方便。现在来梳理一下用法:

- splice(position, count) 表示从 position 索引的位置开始，删除 count 个元素
- splice(position, 0, ele1, ele2, ...) 表示从 position 索引的元素后面插入一系列的元素
- splice(postion, count, ele1, ele2, ...) 表示从 position 索引的位置开始，删除 count 个元素，然后再插入一系列的元素
- 返回值为`被删除元素`组成的`数组`。

接下来我们实现这个方法。

参照 ecma262 草案的规定，详情请[点击](https://tc39.es/ecma262/#sec-array.prototype.splice)。

首先我们梳理一下实现的思路。<br />![1.jpg](../assets/1646098123087-c2d394b4-8652-4547-8409-a95e2ba5c772.jpeg)

## 初步实现

```javascript
Array.prototype.splice = function (startIndex, deleteCount, ...addElements) {
  let argumentsLen = arguments.length
  let array = Object(this)
  let len = array.length
  let deleteArr = new Array(deleteCount)

  // 拷贝删除的元素
  sliceDeleteElements(array, startIndex, deleteCount, deleteArr)
  // 移动删除元素后面的元素
  movePostElements(array, startIndex, len, deleteCount, addElements)
  // 插入新元素
  for (let i = 0; i < addElements.length; i++) {
    array[startIndex + i] = addElements[i]
  }
  array.length = len - deleteCount + addElements.length
  return deleteArr
}
```

先拷贝删除的元素，如下所示:

```javascript
const sliceDeleteElements = (array, startIndex, deleteCount, deleteArr) => {
  for (let i = 0; i < deleteCount; i++) {
    let index = startIndex + i
    if (index in array) {
      let current = array[index]
      deleteArr[i] = current
    }
  }
}
```

然后对删除元素后面的元素进行挪动, 挪动分为三种情况:

1. 添加的元素和删除的元素个数相等
1. 添加的元素个数小于删除的元素
1. 添加的元素个数大于删除的元素

当两者相等时，

```javascript
const movePostElements = (array, startIndex, len, deleteCount, addElements) => {
  if (deleteCount === addElements.length) return
}
```

当添加的元素个数小于删除的元素时, 如图所示:<br />![2.jpg](../assets/1646098130758-40d96baa-56c5-45d6-b9a8-cfd95e111004.jpeg)

```javascript
const movePostElements = (array, startIndex, len, deleteCount, addElements) => {
  //...
  // 如果添加的元素和删除的元素个数不相等，则移动后面的元素
  if (deleteCount > addElements.length) {
    // 删除的元素比新增的元素多，那么后面的元素整体向前挪动
    // 一共需要挪动 len - startIndex - deleteCount 个元素
    for (let i = startIndex + deleteCount; i < len; i++) {
      let fromIndex = i
      // 将要挪动到的目标位置
      let toIndex = i - (deleteCount - addElements.length)
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex]
      } else {
        delete array[toIndex]
      }
    }
    // 注意注意！这里我们把后面的元素向前挪，相当于数组长度减小了，需要删除冗余元素
    // 目前长度为 len + addElements - deleteCount
    for (let i = len - 1; i >= len + addElements.length - deleteCount; i--) {
      delete array[i]
    }
  }
}
```

当添加的元素个数大于删除的元素时, 如图所示:<br />![3.jpg](../assets/1646098135517-16d7f94e-3c93-4370-a7f4-8729793ff03b.jpeg)

```javascript
const movePostElements = (array, startIndex, len, deleteCount, addElements) => {
  //...
  if (deleteCount < addElements.length) {
    // 删除的元素比新增的元素少，那么后面的元素整体向后挪动
    // 思考一下: 这里为什么要从后往前遍历？从前往后会产生什么问题？
    for (let i = len - 1; i >= startIndex + deleteCount; i--) {
      let fromIndex = i
      // 将要挪动到的目标位置
      let toIndex = i + (addElements.length - deleteCount)
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex]
      } else {
        delete array[toIndex]
      }
    }
  }
}
```

## 优化一: 参数的边界情况

当用户传来非法的 startIndex 和 deleteCount 或者负索引的时候，需要我们做出特殊的处理。

```javascript
const computeStartIndex = (startIndex, len) => {
  // 处理索引负数的情况
  if (startIndex < 0) {
    return startIndex + len > 0 ? startIndex + len : 0
  }
  return startIndex >= len ? len : startIndex
}

const computeDeleteCount = (startIndex, len, deleteCount, argumentsLen) => {
  // 删除数目没有传，默认删除startIndex及后面所有的
  if (argumentsLen === 1) return len - startIndex
  // 删除数目过小
  if (deleteCount < 0) return 0
  // 删除数目过大
  if (deleteCount > len - deleteCount) return len - startIndex
  return deleteCount
}

Array.prototype.splice = function (startIndex, deleteCount, ...addElements) {
  //,...
  let deleteArr = new Array(deleteCount)

  // 下面参数的清洗工作
  startIndex = computeStartIndex(startIndex, len)
  deleteCount = computeDeleteCount(startIndex, len, deleteCount, argumentsLen)

  // 拷贝删除的元素
  sliceDeleteElements(array, startIndex, deleteCount, deleteArr)
  //...
}
```

## 优化二: 数组为密封对象或冻结对象

什么是密封对象?

> 密封对象是不可扩展的对象，而且已有成员的[[Configurable]]属性被设置为 false，这意味着不能添加、删除方法和属性。但是属性值是可以修改的。

什么是冻结对象？

> 冻结对象是最严格的防篡改级别，除了包含密封对象的限制外，还不能修改属性值。

接下来，我们来把这两种情况一一排除。

```javascript
// 判断 sealed 对象和 frozen 对象, 即 密封对象 和 冻结对象
if (Object.isSealed(array) && deleteCount !== addElements.length) {
  throw new TypeError('the object is a sealed object!')
} else if (
  Object.isFrozen(array) &&
  (deleteCount > 0 || addElements.length > 0)
) {
  throw new TypeError('the object is a frozen object!')
}
```

好了，现在就写了一个比较完整的 splice，如下:

```javascript
const sliceDeleteElements = (array, startIndex, deleteCount, deleteArr) => {
  for (let i = 0; i < deleteCount; i++) {
    let index = startIndex + i
    if (index in array) {
      let current = array[index]
      deleteArr[i] = current
    }
  }
}

const movePostElements = (array, startIndex, len, deleteCount, addElements) => {
  // 如果添加的元素和删除的元素个数相等，相当于元素的替换，数组长度不变，被删除元素后面的元素不需要挪动
  if (deleteCount === addElements.length) return
  // 如果添加的元素和删除的元素个数不相等，则移动后面的元素
  else if (deleteCount > addElements.length) {
    // 删除的元素比新增的元素多，那么后面的元素整体向前挪动
    // 一共需要挪动 len - startIndex - deleteCount 个元素
    for (let i = startIndex + deleteCount; i < len; i++) {
      let fromIndex = i
      // 将要挪动到的目标位置
      let toIndex = i - (deleteCount - addElements.length)
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex]
      } else {
        delete array[toIndex]
      }
    }
    // 注意注意！这里我们把后面的元素向前挪，相当于数组长度减小了，需要删除冗余元素
    // 目前长度为 len + addElements - deleteCount
    for (let i = len - 1; i >= len + addElements.length - deleteCount; i--) {
      delete array[i]
    }
  } else if (deleteCount < addElements.length) {
    // 删除的元素比新增的元素少，那么后面的元素整体向后挪动
    // 思考一下: 这里为什么要从后往前遍历？从前往后会产生什么问题？
    for (let i = len - 1; i >= startIndex + deleteCount; i--) {
      let fromIndex = i
      // 将要挪动到的目标位置
      let toIndex = i + (addElements.length - deleteCount)
      if (fromIndex in array) {
        array[toIndex] = array[fromIndex]
      } else {
        delete array[toIndex]
      }
    }
  }
}

const computeStartIndex = (startIndex, len) => {
  // 处理索引负数的情况
  if (startIndex < 0) {
    return startIndex + len > 0 ? startIndex + len : 0
  }
  return startIndex >= len ? len : startIndex
}

const computeDeleteCount = (startIndex, len, deleteCount, argumentsLen) => {
  // 删除数目没有传，默认删除startIndex及后面所有的
  if (argumentsLen === 1) return len - startIndex
  // 删除数目过小
  if (deleteCount < 0) return 0
  // 删除数目过大
  if (deleteCount > len - deleteCount) return len - startIndex
  return deleteCount
}

Array.prototype.splice = function (startIndex, deleteCount, ...addElements) {
  let argumentsLen = arguments.length
  let array = Object(this)
  let len = array.length >>> 0
  let deleteArr = new Array(deleteCount)

  startIndex = computeStartIndex(startIndex, len)
  deleteCount = computeDeleteCount(startIndex, len, deleteCount, argumentsLen)

  // 判断 sealed 对象和 frozen 对象, 即 密封对象 和 冻结对象
  if (Object.isSealed(array) && deleteCount !== addElements.length) {
    throw new TypeError('the object is a sealed object!')
  } else if (
    Object.isFrozen(array) &&
    (deleteCount > 0 || addElements.length > 0)
  ) {
    throw new TypeError('the object is a frozen object!')
  }

  // 拷贝删除的元素
  sliceDeleteElements(array, startIndex, deleteCount, deleteArr)
  // 移动删除元素后面的元素
  movePostElements(array, startIndex, len, deleteCount, addElements)

  // 插入新元素
  for (let i = 0; i < addElements.length; i++) {
    array[startIndex + i] = addElements[i]
  }

  array.length = len - deleteCount + addElements.length

  return deleteArr
}
```

以上代码对照[MDN 文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)中的所有测试用例亲测通过。

相关测试代码请前往: [传送门](https://github.com/sanyuan0704/frontend_daily_question/blob/master/test_splice.js)

最后给大家奉上 V8 源码，供大家检查： [V8 数组 splice 源码第 660 行](https://github.com/v8/v8/blob/ad82a40509c5b5b4680d4299c8f08d6c6d31af3c/src/js/array.js#L660)

参考：[三元博客](https://github.com/sanyuan0704/my_blog/blob/master/blog)
