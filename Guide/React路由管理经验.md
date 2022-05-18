# React路由配置经验整理

- 2022-05-10

 
# 目录
- 1	前端路由原理	    
- 1.1	Hash	    
- 1.2	History	    
- 2	React 中的路由	    
- 3	react-router-dom V5	    
- 3.1	```<Route>```	    
- 3.2	```<BrowserRouter> / <HashRouter>```	    
- 3.3	```<Link> / <NavLink>```	    
- 3.4	```<Redirect>```	    
- 3.5	```<Switch>```	    
- 3.6	withRouter	    
- 3.7	Hooks	    
- 3.8	react-router-config	    
- 4	react-router-dom V6	    
- 4.1	<Route>	    
- 4.2	使用 useNavigate 代替 useHistory	    
- 4.3	使用 useRoutes 代替 react-router-config	    
- 5	项目中的路由管理	    
- 5.1	权限路由数据处理	    
- 5.2	菜单组件	    
- 5.3	重定向	    
- 5.4	权限控制	    
- 参考	    



 
## 1.	前端路由原理
前端路由有两种实现方式 即 URL 的 hash 和 H5 的 history
### 1.1	Hash
URL 的 hash 也就是锚点(#), 本质上是改变 window.location 的 href 属性
我们可以通过直接赋值 location.hash 来改变 href, 但是页面不发生刷新
hash 的优势就是兼容性更好，在老版 IE 中都可以运行，但是缺陷是有一个# 显得不像一个真实的路径
### 1.2	History
history 接口是 HTML5 新增的, 它有六种模式改变 URL 而不刷新页面
replaceState：替换原来的路径
pushState：使用新的路径
popState：路径的回退
go：向前或向后改变路径
forward：向前改变路径
back：向后改变路径

简单演示几个方法：
```
<div id="app">
  <a href="/home">home</a>
  <a href="/about">about</a>
  <div class="router-view"></div>
</div>

<script>
  // 1.获取router-view
  const routerViewEl = document.querySelector('.router-view');

  // 2.监听所有的a元素
  const aEls = document.getElementsByTagName('a');
  for (let aEl of aEls) {
    aEl.addEventListener('click', (e) => {
      e.preventDefault();
      const href = aEl.getAttribute('href');
      console.log(href);
      history.pushState({}, '', href);
      historyChange();
    });
  }

  // 3.执行设置页面操作
  function historyChange() {
    switch (location.pathname) {
      case '/home':
        routerViewEl.innerHTML = 'home';
        break;
      case '/about':
        routerViewEl.innerHTML = 'about';
        break;
      default:
        routerViewEl.innerHTML = 'default';
    }
  }
</script>
```
虽然history看起来是一个正常的url 但是如果部署到服务器上的话 还需要做额外的配置
比如 /home/article 这个路径对服务器来说可能根本没有对应的目录 需要做nginx配置

但大多时候前端会自己做重定向，所以后端可以只做整体配置访问整个前端的入口文件即可
遇到多入口情况，分别指定不同入口即可

## 2.	React 中的路由

- React Router 的版本从 4 开始，路由不再集中在一个包中进行管理了
- react-router 是 router 的核心部分代码
- react-router-dom 是用于浏览器的
- react-router-native 是用于原生应用的

安装时 我们只需安装 react-router-dom 即可
react-router-dom 会自动帮助我们安装 react-router 的依赖

## 3.	react-router-dom V5
### 3.1	<Route>
相当于一个路由的占位符 当路由匹配成功时 会展示对应的组件
有三种渲染方式：
- ```<Route component>```
- ```<Route render>```
- ```<Route children>```

分别举个例子：
```
  <Router>
      <Link to="/home">home</Link>
      <Link to="/user">user</Link>
      <Link to="/child">child</Link>

      {/* 匹配成功时 渲染组件Home */}
      <Route component={Home} path="/home" />

      {/* 匹配成功时 执行render方法 */}
      <Route render={() => <h1>hello nanshu</h1>} path="/user" />

      {/* 匹配成功时 match为路由信息 可通过match来动态渲染 */}
      <Route
        children={({ match }) => (match ? <h1>Yep</h1> : <h1>Ops</h1>)}
        path="/child"
      />
    </Router>
```
此外 Route 的属性还有：
- path: string｜string[] 可以匹配一个 url 也可以匹配多个 url
- exact 精确匹配（针对路由层级）例如 /one和 /one/ 不匹配
- strict 严格匹配（针对路由结尾的/）例如 /one/ 和 /one/two匹配
- sensitive: boolean  设false则忽略路由的大小写

### 3.2	```<BrowserRouter> / <HashRouter>```
前者基于 history 实现 后者基于 hash 实现

### 3.3	```<Link> / <NavLink>```
最终都会被渲染成 a 标签
区别是 NavLink 组件有两个属性 activeStyle 和 activeClassName 可以控制选中时的样式

### 3.4	<Redirect>
重定向

### 3.5	<Switch>
只渲染第一个匹配到的路由
所以如果路由有包含关系则需要注意顺序，或者使用exact精确匹配：
 ```
    <Router>
      <Switch>
        <Route component={Home} path="/" exact />
        <Route component={About} path="/about" />
        <Route component={NoMatch} />
      </Switch>
    </Router>
```
### 3.6	withRouter
一个高阶函数 可以为那些不受 react-router 路由控制的组件注入 history/match/location 三个路由属性 必须作为 HashRouter / BrowserRouter 的子组件使用
```
import { withRouter, BrowserRouter as Router } from 'react-router-dom';

function Home(props: any) {
  // 获取不到路由信息
  console.log('home :>> ', props);
  return <h1>Home</h1>;
}

const Article = withRouter((props: any) => {
  // 可以获取到路由信息
  console.log('article :>> ', props);
  return <h1>Article</h1>;
});

export default function article() {
  return (
    <Router>
      <Home />
      <Article />
    </Router>
  );
}
```
### 3.7	Hooks
useParams / useLocation / useRouteMatch / useHistory

### 3.8	react-router-config
统一的管理我们的路由信息 这个包和V5绑定
```
import { renderRoutes } from 'react-router-config';
        
...
        
<Router>
   <Link to="/">home</Link>
   <Link to="/about">about</Link>
   {renderRoutes(routes)}
</Router>
```
## 4.	react-router-dom V6
V6有一些破坏性的改动 目前正在致力于做V5的向前兼容 
在项目中 目前还是使用稳定的v5版本
这里列举一些比较常用的 且有变化的改动

### 4.1	<Route>
```<Route path="/users" component={Users} />```
```<Route path="users/*" element={<Users />} />```

### 4.2	使用 useNavigate 代替 useHistory
```history.push("/home");```
```navigate("/home");```

### 4.3	使用 useRoutes 代替 react-router-config
```
  useRoutes([
    { path: "/", element: <Home /> },
    { path: "dashboard", element: <Dashboard /> },
    {
      path: "invoices",
      element: <Invoices />,
      // 嵌套子路由
      children: [
        { path: ":id", element: <Invoice /> },
        { path: "sent", element: <SentInvoices /> },
      ],
    },
    // 404
    { path: "*", element: <NotFound /> },
  ]);
```
## 5.	项目中的路由管理
系统区分不同用户角色时，项目中的路由可能会有两种划分，一种与角色权限无关，例如官网路由，一种与角色权限相关，例如工作台路由。与角色无关的或较简单的角色相关路由可由前端自行管理生成菜单，而与角色相关的较复杂的权限路由则一般需要从后台获取，经过前端处理生成对应的菜单。
### 5.1	权限路由数据处理
后端返回的权限路由常见的数据结构有两种，一种是树形对象；另一种是对象数组，使用类似pid的字段标识菜单的父子关系。如果后端返回的是树形对象，前端可直接用于渲染菜单。如果后端返回的是对象数组则需要前端先将其处理为树形对象，然后再传给菜单组件进行渲染。比如XX项目中，后端使用UAP做用户体系，后端不处理的话返回的结构即对象数组。则需要类似如下代码段进行结构转化：
```
// 获取菜单列表(平行结构 => 树状结构)
export const getMenuList = (list: any[], parentId?: string) => {
  return list
    .filter((item: any) => (parentId ? item.parentId === parentId : !item?.parentId))
    .map((item: any) => {
      return {
        name: item?.name,
        value: item?.url,
        children: getMenuList(list, item?.id),
        include: getIncludeRoute(item?.url) || [],
        newPage: isNeedNewPage(item?.url),
        disabled: isDisabled(item?.url),
      }
    })
}
```
其中children是自己菜单，include是该菜单下包含的非菜单项的子页面路由，newPage区分是否需要新标签页打开。
### 5.2	菜单组件
目前开发的最多只涉及二级菜单，所以目前项目的菜单组件都只支持到二级菜单，虽然XX项目中遇到了三级，但被拆分为顶部菜单和二级的侧边栏菜单两部分进行渲染，也不是真正意义的三级。

### 5.3	重定向
为了避免用户在浏览器中输入缺省的路由而出现空白页面，除了后端会做nginx配置，前端也会做相应的重定向处理，保证用户访问正常

### 5.4	权限控制
为了避免用户直接在浏览器中输入路由访问无权限的页面，除了后端会做接口权限，前端也需要在项目入口文件中加一些逻辑进行权限验证以及退阶重定向的处理。



 
## 参考
React 小册 ｜ 路由管理 https://juejin.cn/post/7005013415240400910/
