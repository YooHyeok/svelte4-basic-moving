# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *[Ch04) Event](../Ch04_Event/README.md)*
# *[Ch05) Props](../Ch05_Props/README.md)*
# *[Ch06) IfBlock](../Ch06_IfBlock/README.md)*
# *[Ch07) EachBlock](../Ch07_EachBlock/README.md)*
# *[Ch08) Bind01 - input (value, checked, group)](../Ch08_Bind01/README.md)*
# *[Ch08) Bind01 - input (value, checked, group)](../Ch08_Bind01/README.md)*
# *[Ch09) Bind02 - select (multiple), textarea, media](../Ch09_Bind02/README.md)*
# *[Ch10) Bind03 - this, component, dimension](../Ch10_Bind03/README.md)*
# *[Ch11) Slot - 기본문법, Fallback, named, props, fragment, $$Slots](../Ch11_Slot/README.md)*
# *[Ch12) LifeCycle01: Hook - onMount, onDestroy, beforeUpdate, afterUpdate](../Ch12_LifeCycle01_Hook/README.md)*
# *[Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick](../Ch13_LifeCycle02/README.md)*
# *[Ch14) PropDrilling과 ContextAPI](../Ch14_ContextAPI/README.md)*
# *[Ch15) Store](../Ch15_Store/README.md)*
# *[Ch16) Custom Store와 bind, ConetxtAPI 결합](../Ch16_CustomStore/README.md)*
# *[Ch17) CssClass](../Ch17_CssClass/README.md)*
# *[Ch18) Rollup 기반 Sass 적용](../Ch18_rollup-sass/README.md)*
# *[Ch19) Transition](../Ch19_Transition/README.md)*
# *[Ch20) Animation](../Ch20_Animation/README.md)*
# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# Ch26) Router
<details>
<summary>접기/펼치기</summary>
<br>

## 디펜던시 설치
```bash
npm install svelte-routing
```

https://www.npmjs.com/package/svelte-routing


## 기본 사용 문법
```svelte
<script>
  import { Router, Link, Route } from "svelte-routing"
  export let url = ''; // props 내려받음
</script>

<고정 컴포넌트 처리 />
<Router {url}>
  <Link to="바뀔경로">링크 텍스트</Link>
  <Route path="지정할경로" component={컴포넌트명} />
</Router>
<고정 컴포넌트 처리 />
```

- Router: 페이지 변환이 있는 컴포넌트들을 담아주는 부모 컴포넌트, url 속성 처리
- Link: 페이지 이동을 시켜주는 컴포넌트로 a(anchor)태그와 유사하며, to 속성에 이동될 경로를 작성.  
- Route: 페이지 변환이 있는 각각 자손 컴포넌트를 담는 컴포넌트이며, path 속성에는 지정할 경로, component 속성에 랜더링할 컴포넌트를 지정
- url: script 영역에 선언된 export let 변수로 라우터가 제공하는 props이며, ssr에서 현재 url을 적용할 때 사용한다.

### 예제) 기본 라우팅
- RouteComponent
  ```svelte
  <div>
    <h1>라우팅에 의해 렌더링 될 컴포넌트 입니다</h1>
  </div>
  ```

- Layout
  ```svelte
  <script>
    import { Router, Route } from "svelte-routing"
    import SideBar from "./SideBar.svelte"
    import RouteComponent from "./RouteComponent.svelte"

    <SideBar />
    <Router {url}>
      <Route path="/route" component={RouteComponent} />
    </Router>
  </script>
  ```

- SideBar
  Link를 관리하는 컴포넌트를 구현한다.  
  ```svelte
  <script>
    import { Router, Link } from "svelte-routing";
  </script>
  <section>
    <ul>
      <li><Router><Link to="/">Home</Link></Router></li>
      <li><Router><Link to="*">NotFound</Link></Router></li>
    </ul>
  </section>
  ```

위 예제처럼 Link 태그는 Router 태그 내에 선언해야한다.  
Link 태그를 관리하는 SideBar 컴포넌트와 Route 태그를 관리하는 Layout 컴포넌트 처럼 해당 태그들을 각각 다른 컴포넌트에서 관리될 경우 Link 태그를 Router 태그로 랩핑 하지 않는다면 SideBar 컴포넌트는 Layout 컴포넌트의 Router 태그 내에 선언되어야 한다.

`<Router><Link></Link><Router>`는 실제 a(anchor) 태그로 렌더링된다.

### Link Action 방식
svelte-routing은 Router>Link 태그로 구성하지 않고, link와 links 라는 action을 통해 일반 태그로도 관리가 가능하다.  
아래 예제는 a(anchor) 태그에 action을 활용하여 `use:link` 혹은 `use:links`를 설정하여 동일한 기능을 사용할 수 있다.  

link의 경우 단일 태그에 적용하며, links의 경우 그룹화 된 부모 태그에 선언하여 사용한다.  

#### use:link
- SideBar
  ```svelte
  <script>
    import { Router, link } from "svelte-routing";
  </script>
  <section>
    <ul>
      <li><a use:link href="/">Home</a></li>
      <li><a use:link href="*">NotFound</a></li>
    </ul>
  </section>
  ```

#### use:links
- SideBar
  ```svelte
  <script>
    import { Router, links } from "svelte-routing";
  </script>
  <section>
    <ul use:links>
      <ul>
      <li><a use:link href="/">Home</a></li>
      <li><a use:link href="*">NotFound</a></li>
    </ul>
    </ul>
  </section>
  ```

</details>
<br>

