# 网页中显示pdf

## embed实现
- 优点：自带“打印”，“搜索”，“翻页”等功能，强大且实现方便。
- 缺点：不同浏览器的pdf工具样式不一，且无法满足个性化需求，比如：禁止打印，下载等。

## PDF.js实现
PDF.js是基于HTML5技术构建的，用于展示可移植文档格式的文件(PDF)，它可以在现代浏览器中使用且无需安装任何第三方插件。    
官网：https://mozilla.github.io/pdf.js/getting_started/    

### 引入
我们并不想污染我们的index.html并且希望可以对每一个引用的框架有统一的版本管理。于是，我们搜寻到一个包：pdfjs-dist。    
``` yarn add pdfjs-dist```

在需要使用PDF.js的文件中如下引用:  
```
import PDFJS from 'pdfjs-dist';
PDFJS.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry.js')
```
这两个文件包含了获取、解析和展示PDF文档的方法，但是解析和渲染PDF需要较长的时间，可能会阻塞其它JS代码的运行。    
为解决该问题，pdf.js依赖了HTML5引入的Web Workers——通过从主线程中移除大量CPU操作（如解析和渲染）来提升性能。    
PDF.js的API都会返回一个Promise，使得我们可以优雅的处理异步操作。    

### 使用
- 先要有一个容器，比如：  
```<div id="pdf-canvas" style={{ width: '100%', textAlign: 'center' }}></div>```

- 获取pdf数据流并***转换为url***进行渲染，类似：
```
// 将返回的流数据转换为url
  const getObjectURL = (data) => {
    let url = null
    if (window.createObjectURL !== undefined) {
      // basic
      try {
        url = window.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      } catch (err) {
        console.log(err)
      }
    } else if (window.webkitURL !== undefined) {
      // webkit or chrome
      try {
        url = window.webkitURL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      } catch (err) {
        console.log(err)
      }
    } else if (window.URL !== undefined) {
      // mozilla(firefox)
      try {
        url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
      } catch (err) {
        console.log(err)
      }
    }
    return url
  }
  
const getPdfBlob = async (reportFileId) => {
    try {
      const res = await httpDownloadAttachments({ fileId: reportFileId })
      const pdf = await PDFJS.getDocument(getObjectURL(res.data)).promise
      for (let i = 0; i < pdf.numPages; i++) {
        pdf.getPage(i + 1).then((page) => {
          const devicePixelRatio = window.devicePixelRatio
          // 展示比例1.5 * 显示设备的物理像素分辨率与CSS像素分辨率之比
          // 根据展示比例返回PDf文档的页面尺寸
          const viewport = page.getViewport({ scale: 1.5 * devicePixelRatio })
          const pdfContainer = document.getElementById('pdf-canvas')
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          }
          pdfContainer.appendChild(canvas)
          page.render(renderContext)
        })
      }
    } catch {
      console.log('获取显示pdf失败')
    }
  }
```

- getDocument()：用于异步获取PDf文档，发送多个Ajax请求以块的形式下载文档。    
 它返回一个Promise，该Promise的成功回调传递一个对象，该对象包含PDF文档的信息，该回调中的代码将在完成PDf文档获取时执行。
- getPage()：用于获取PDF文档中的各个页面。
- getViewport()：针对提供的展示比例，返回PDf文档的页面尺寸。
- render()：渲染PDF。

### pdf文本复制

- 使用Text-Layers渲染
PDF.js支持在使用Canvas渲染的PDF页面上渲染文本图层。    
然而，这个功能需要用到额外的两个文件：text_layer_builder.js和text_layer_builder.css。我们可以在GitHub的repo中获取到。

具体的没再试，不搬了，直接放参考链接：
https://segmentfault.com/a/1190000016963084
