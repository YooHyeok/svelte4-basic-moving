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
# *[Ch22) Action](../Ch22_Action/README.md)*
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
(link action을 적용한 a태그에는 외부 url을 지정하여 이동이 불가능하다.)  


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
<br>

## URL 파라미터
주소 뒤에 작성하는 문자열을 말한다.
URL 파라미터를 이용하면 수십 개에서 수천 개의 상세페이지를 손쉽게 만들어 낼 수 있다.  

```svelte
<Route path="/경로/:파라미터명" component={컴포넌트} />
```
위와같이 라우트에 먼저 어떤 이름의 파라미터를 받을지 지정하고, 주소창에 해당 경로와 파라미터명 위치에 값을 지정하거나   

혹은 아래와 같이 Link를 이용하여 UI를 통해 전달할수도 있다.  
```svelte
<Link path="/경로/:파라미터명">이동</Link>
<a use:link href="/경로/:파라미터명">이동</a>
```

라우트에 등록한 컴포넌트내에서 export let을 통해 path에 지정한 파라미터명을 변수로 선언하여 파라미터를 받을 수 있게된다.  
```svelte
<script>
  export let 파라미터명; // 라우트 url 파라미터
</script>
```


## URL 쿼리스트링(QueryString)
쿼리스트링(QueryString)이란 사용자가 입력한 데이터를 전달하는 방법 중 하나이다.  
URL 주소에 미리 협의된 데이터를 파라미터로 넘기는 것을 의미한다.  
`최종url?파라미터=값` 형태로 최종 url의 끝에 물음표(?)를 작성하고, 그 뒤에 파라미터=값 형태로 파라미터이름과 값을 담아 전달한다.  
2개 이상의 파라미터의 경우 & 기호로 구분하여 `최종url?파라미터1=값&파라미터2=값`형태로 작성한다.

- 유투브 쿼리스트링 예
  `https://www.youtube.com/embed/iDjQSdN_ig8?autoplay=1&mute=1`  

자바스크립트에서도 URL의 쿼리스트링을 활용하여 데이터를 전달하고, 특정 동작을 제어할 수 있다.  
하지만 svelte-routing에서는 URL에서 쿼리스트링을 추출하는 기능이 따로 없다.  
URL에서 쿼리스트링을 쉽게 추출하고 처리할 수 있는 라이브러리를 설치하고 사용해야한다.  

### query-string 의존성 설치
```bash
npm install query-string
```

**[query-string npm 공식 사이트](https://www.npmjs.com/package/query-string)**

### query-string 추출 문법
```svelte
<script>
let parsed = queryString.parse(window.location.search)
</script>
```
#### 유투브 쿼리스트링 예의 parsed 결과값
```json
{ "autoplay": 1, "mute": 1}
```

```svelte
<Link to=""></Link>

```

</details>
<br>

# *[Ch27) HttpAwaitBlock](../Ch27_HttpAwaitBlock/README.md)*
# *부록) Key Block*
<details>
<summary>접기/펼치기</summary>
<br>

## Key Block이란?
`{#key}` 블록은 표현식 값이 변경될 때 블록 내부의 마크업과 컴포넌트를 **파괴하고 재생성**하는 기능이다.  
주로 트랜지션을 다시 실행시키거나, 특정 값에 종속된 컴포넌트를 강제로 다시 초기화하고 싶을 때 사용한다.  

Vue의 경우 `:key` 속성을 변경하여 컴포넌트를 강제로 재마운트하는 패턴과 동일한 개념이다.  
```vue
<script setup>
  import Counter from './Counter.vue'
  import { ref } from 'vue'
  const resetKey = ref(0)
  const reset = () => resetKey.value++
</script>
<template>
  <button @click="reset">초기화</button>
  <Counter :key="resetKey" />
</template>
```

React 또한 컴포넌트의 `key` prop을 변경하면 React가 해당 컴포넌트를 unmount/mount 처리한다.  
```jsx
import { useState } from 'react'
import Counter from './Counter'

function App() {
  const [resetKey, setResetKey] = useState(0)
  return (
    <>
      <button onClick={() => setResetKey(k => k + 1)}>초기화</button>
      <Counter key={resetKey} />
    </>
  )
}
```

Svelte는 이를 마크업 영역에서 블록 형태로 제공한다는 점이 다르다.  

```svelte
{#key 표현식}
  <!-- 표현식이 변경될 때마다 파괴 후 재생성되는 마크업 -->
{/key}
```

표현식 값이 바뀌면 블록 내부의 DOM과 컴포넌트가 새로 생성되며, `onMount` 등 라이프사이클 훅도 다시 실행된다.  

## 사용 시나리오

### 1) 트랜지션 재실행
일반적으로 트랜지션은 요소가 DOM에 추가되거나 제거될 때만 실행된다.  
값이 변경되더라도 같은 요소가 유지되면 트랜지션이 다시 실행되지 않는다.  
`{#key}`로 감싸면 값 변경 시 요소가 파괴/재생성되어 진입 트랜지션이 다시 실행된다.  

```svelte
<script>
  import { fade } from 'svelte/transition'
  let count = 0
</script>

<button on:click={() => count++}>증가</button>
{#key count}
  <div in:fade={{duration: 500}}>현재 값: {count}</div>
{/key}
```

버튼 클릭 시마다 `count` 값이 변경되면서 fade 트랜지션이 매번 재실행된다.  

### 2) 컴포넌트 강제 재초기화
자식 컴포넌트의 내부 상태를 초기 상태로 되돌리고 싶을 때 사용할 수 있다.  
컴포넌트가 새로 생성되므로 내부의 `let` 변수들이 초기값으로 재설정된다.  

```svelte
<script>
  import Counter from './Counter.svelte'
  let resetKey = 0
  const reset = () => resetKey++
</script>

<button on:click={reset}>초기화</button>
{#key resetKey}
  <Counter />
{/key}
```

`Counter` 컴포넌트 내부에 어떤 상태가 있더라도 버튼 클릭 시 새로 생성되어 모든 내부 상태가 초기화된다.  

### 3) 외부 라이브러리 인스턴스 재생성
차트 라이브러리나 지도 라이브러리처럼 외부 인스턴스를 사용하는 컴포넌트의 경우, 데이터가 변경되어도 자체적으로 갱신되지 않는 경우가 있다.  
이 때 `{#key}`로 감싸 데이터 변경 시 컴포넌트를 재생성하면 인스턴스도 함께 새로 만들어진다.  

```svelte
<script>
  import Chart from './Chart.svelte'
  export let chartData
</script>

{#key chartData}
  <Chart data={chartData} />
{/key}
```

## 주의사항
`{#key}`는 블록 내부를 통째로 파괴/재생성하기 때문에 비용이 큰 작업이다.  
단순 값 동기화에는 적합하지 않으며, 반응성이 필요한 경우 `$:` 반응성 구문을 우선 고려해야 한다.  

```svelte
<!-- 잘못된 사용: 단순 값 변경에 key block 사용 -->
{#key user}
  <p>{user.name}</p>  <!-- $: 으로도 충분히 갱신됨 -->
{/key}

<!-- 올바른 사용: 트랜지션, 외부 인스턴스, 강제 재초기화 등 -->
{#key user.id}
  <Profile {user} />  <!-- user 변경 시 Profile을 새로 생성 -->
{/key}
```

## 다른 프레임워크와의 비교

| 프레임워크 | 문법 | 동작 |
|-----------|------|------|
| Svelte | `{#key 값}...{/key}` | 마크업 영역의 블록을 파괴/재생성 |
| Vue | `<Component :key="값"/>` | 컴포넌트 props로 key 전달 시 재마운트 |
| React | `<Component key={값}/>` | 컴포넌트 props로 key 전달 시 unmount/mount |

Vue와 React는 컴포넌트 단위로만 가능하지만, Svelte의 `{#key}`는 **컴포넌트가 아닌 마크업 영역에도 적용 가능**하다는 차이가 있다.  

</details>
<br>
