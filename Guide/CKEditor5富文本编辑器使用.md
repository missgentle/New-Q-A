# CKEditor5富文本编辑器使用

Github: https://github.com/ckeditor/ckeditor5
官网：https://ckeditor.com/ckeditor-5/
文档：https://ckeditor.com/docs/ckeditor5/latest/index.html

## 引入
```yarn add @ckeditor/ckeditor5-react @ckeditor/ckeditor5-build-classic```
CKEditor5有好几种模式（好像有经典，文档，悬浮啥的），具体可以看官文示例 https://ckeditor.com/docs/ckeditor5/latest/examples/index.html    
我们项目中只使用过经典（classic）模式，根据所需模式应该是要yarn不同的包

## 使用
```
import { CKEditor } from '@ckeditor/ckeditor5-react' //主包
import ClassicEditor from '@ckeditor/ckeditor5-build-classic' //经典模式包
import viewToPlainText from '@ckeditor/ckeditor5-clipboard/src/utils/viewtoplaintext' //读写库
import '@ckeditor/ckeditor5-build-classic/build/translations/zh-cn.js' //汉化包
import RichtextUpload from './richtext-upload-hooks' // 自定义的上传图片加载器 后面说 
```

```
// 基本的配置参数
const CKEditorConfig = {
  placeholder: '请输入',
  language: 'zh-cn', // 汉化
  toolbar: [
    'heading',
    '|',
    'bold',
    'italic',
    'link',
    'bulletedList',
    'numberedList',
    '|',
    'uploadImage',
    'undo',
    'redo',
    '|',
    'blockQuote',
    'insertTable',
  ],
}
```
工具栏有什么小工具，工具排序，工具间的竖线分隔都是可配置的    
以上都是默认会有的插件，还有更多插件需要yarn额外的包然后import，具体可以参考官文    
https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/installing-plugins.html    
以上的默认插件大部分都是直接能用的，只有uploadImage上传图片需要做一些额外工作，后面说    

```
// 富文本框上传图片适配器
const MyCustomUploadAdapterPlugin = (editor) => {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return RichtextUpload(loader)
  }
} 

const handleEditorChange = (editor) => {
    const contentHtml = editor?.getData() //html
    const contentText = viewToPlainText(editor?.editing?.view?.document?.getRoot()) //纯文本
    // 粗略的限制下长度
    if (contentHtml?.length > 1000 || contentText?.length > 500) {
      setContentTooLong(true)
    } else {
      setContentTooLong(false)
    }
  }

<CKEditor
   editor={ClassicEditor}
   data={contentHtml || ''}
   onReady={(editor) => {
      setEditor(editor) // 保存editor对象方便后面读写操作
   }}
   onChange={(event, editor) => {
      handleEditorChange(editor)
   }}
    config={{
      extraPlugins: [MyCustomUploadAdapterPlugin], // 自定义上传图片适配器
      link: { addTargetToExternalLinks: true }, // 添加的链接新窗口打开 别问我哪找的 就这里找的 https://ckeditor.com/docs/ckeditor5/latest/api/module_link_link-LinkConfig.html
      ...CKEditorConfig,
   }}
/>
```
对CKEditor5外观不满意的话，样式可以直接覆盖他的class    
配置参数特别多，用的时候去官网找吧，反正就我这个英语水平是觉得不太好找    
上传图片适配有多种解决方案，更简便的方式是使用CKEditor5提供的适配器，但要求后台接口的返回的数据结构啥的要对应按他的要求，看文档吧    
https://ckeditor.com/docs/ckeditor5/latest/features/images/image-upload/image-upload.html    
但咱们后台接口一般哪有那么正正好好的 所以可能更多时候还是要自己写这里的 RichtextUpload：    
richtext-upload-hooks.ts
```
import { httpUploadWithDetail } from '@/service/http_request'
import { message } from 'antd'

export default (loader) => {
  const upload = () => {
    return loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const formData = new FormData()
          formData.append('file', file)
          httpUploadWithDetail(formData, onUploadProgress).then((res) => {
            if (res?.code === 0) {
              resolve({
                default: res.result.path, // 这个default是CKEditor5规定的必须这个字段名
              })
              message.success('上传成功')
              return
            }
            reject(message.error('上传失败'))
          })
        }),
    )
  }

  const abort = () => {
    console.log('暂不支持取消上传')
  }

// 上传进度
  const onUploadProgress = (evt) => {
    if (evt.lengthComputable) {
      loader.uploadTotal = evt.total // 这个loader.uploadTotal也是规定的
      loader.uploaded = evt.loaded // 这个loader.uploaded也是规定的
    } 
  }

  return {
    upload,
    abort,
  }
}

```
## 从后台取回保存的富文本显示
```
const detailPro = useMemo(() => {
   // 图片大小处理&加link
   const detailWithImgLink = contentHtml?.replace(/<img([^>]+src=[\'\"]?([^\'\"]+)[\'\"]?[^>]*[>|\/><\/img>])/gi, '<a href="$2" target="_blank"><img style="display:block;width:430px" $1</a>')
      return (
        <div dangerouslySetInnerHTML={{ __html: detailWithImgLink || '/' }}></div>
      )
}, [contentHtml])
```

