# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *Ch01) Component*
<details>
<summary>접기/펼치기</summary>
<br>

HTML과 Javascript만으로 하드코딩할때의 DOM은 헤더 푸터와 같이 동일한 영역임에도 계속 랜더링되는 문제가 있다.  
페이지가 이동할때마다 해당 구역을 다시 렌더링하기 때문에 시간도 오래걸리고 용량도 많이 차지한다.  
React와 Vue가 가상돔을 만들어 사용한 이유가 바로 그것이다.  
가상적으로 불러와서 렌더링 시간과 용량을 줄이는 이점을 가진다.  
하지만 Svelte는 가상돔 없이 제작하는 프레임워크이다.  
그러나 컴포넌트를 사용한다.  
예를들어 일반적인 HTML에서 헤더영역의 경우 모든 페이지마다 헤더 영역을 하드코딩 해야하므로  
헤더에 있는 글자 하나만 변경하려 해도 모든 페이지의 글자를 변경해야한다.  
이러한 비효율적인 작업을 위해 컴포넌트를 사용한다.  

피그마라는 그래픽 프로그램에서도 컴포넌트를 사용한다.
반복되는 디자인 요소를 컴포넌트화 한 후 원하는 영역들에 해당 컴포넌트를 배치한다.  
이후 컴포넌트를 수정하면 모든 인스턴스가 일괄적으로 수정된다.  
React, Vue, Svelte에서도 위와같은 특성이 컴포넌트를 사용하는 주된 목적이다

### 1) 컴포넌트를 사용하는 이유
1. 분류를 통한 관리의 효율성
2. 재사용을 통한 개발의 효율성

### 2) Svelte 컴포넌트 구조
- 스크립트 영역
- 마크업 영역
- 스타일 영역
세개의 영역으로 나뉘며 각 영역들의 순서는 관계없고, 3개 영역 모두 없어도 오류는 발생하지 않는다.
```svelte
/* 스크립트 영역 */
<script></script>

/* 마크업 영역 */

/* 스타일 영역 */
<style></style>
```  

### 3) 하위 컴포넌트 불러오기
컴포넌트는 재사용을 위해 사용되며 다른 컴포넌트를 내 컴포넌트로 불러 재사용한다.  
참조하는 컴포넌트는 상위 컴포넌트이고, 참조 되는 컴포넌트는 하위 컴포넌트이다.  
상위 컴포넌트는 부모 컴포넌트라고 부르며 하위 컴포넌트는 자식 컴포넌트라고 부른다.  
상위 컴포넌트 내 하위 컴포넌트 끼리는 형제 컴포넌트라고 부른다.  
```svelte
/* 스크립트 영역 */
<script>
  import 컴포넌트명 from './컴포넌트 파일 경로/컴포넌트.svelte'
</script>

/* 마크업 영역 */
<컴포넌트명/>
<컴포넌트명><div>자손</div></컴포넌트명>
```  
위와 같이 스크립트 영역에서 ESM(ES6 Module 시스템)의 import 구문을 사용하여 불러온 뒤 마크업 영역에 태그로 선언한다.  
- 순수 컴포넌트만 사용
  ```svelte
  <컴포넌트명/>
  ```
- 자식 DOM을 포함하는 경우
  ```svelte
  <컴포넌트명>자손</컴포넌트명>
  ```

## 스벨트 기본구조
- public/index.html
- src/main.js
- src/App.svelte
### `src/main.js`
Svelte 프레임워크의 진입점(Entry Point)이다.  
전역으로 css와 라이브러리 등록 및 초기화, 개발/운영 분기 등의 작업을 설정하며, 최초 스벨트 컴포넌트를 불러와 인스턴스화 한 후 렌더링 되도록 설정한다.  

실제 코드를 보면 App.svelte 컴포넌트를 인스턴스화 한 후 index.html의 body영역에 렌더링한다.
```js
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;
```
App 컴포넌트를 인스턴스화 할때 컴포넌트 프로퍼티 객체를 파라미터로 전달한다.  
#### 컴포넌트 프로퍼티 구성
- target : 마운트 위치미여 이곳에 App 컴포넌트가 실제 렌더링 될 dom 위치를 작성한다.  
- props : App.svelte 컴포넌트에 prop을 전달한다.  

### `src/App.svelte`
최상위 컴포넌트이며, 해당 컴포넌트에서 main.js로 모든 데이터를 전달한다.  
실제 자바스크립트는 svelte파일을 읽을 수 없기 때문이다.  

## 예제) 컴포넌트 구성 및 배치

![alt text](image.png)

### 컴포넌트 구성 
#### src/App.svelte
- src/MainPage.svelte
- src/ProductPage.svelte
```svelte
<script>
	import MainPage from "./MainPage.svelte";
	import ProductPage from "./ProductPage.svelte";
</script>

<MainPage/>
<hr>
<ProductPage/>
```

##### MainPage.svelte
- Header.svelte
- Main.svelte
- Footer.svelte
```svelte
<script>
  import Header from "./Header.svelte";
  import Footer from "./Footer.svelte";
  import Main from "./Main.svelte";
</script>
<Header/>
<Main/>
<Footer/>
```

##### ProductPage.svelte
- Header.svelte
- Product.svelte
- Footer.svelte

###### Main.svelte
```svelte
<h1>메인 영역</h1>
```
###### Product.svelte
```svelte
<h5>제품 영역</h5>
```

##### 공통 레이아웃
###### Header.svelte
```svelte
<h1>헤더 영역</h1>
```
###### Footer.svelte
```svelte
<h1>푸터 영역</h1>
```

</details>
<br>

# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *[Ch04) Event](../Ch04_Event/README.md)*
# *[Ch05) Props](../Ch05_Props/README.md)*
# *[Ch06) IfBlock](../Ch06_IfBlock/README.md)*
# *[Ch07) EachBlock](../Ch07_EachBlock/README.md)*
# *[Ch08) Bind01 - input (value, checked, group)](../Ch08_Bind01/README.md)*
# *[Ch09) Bind02 - select (multiple), textarea, media](../Ch09_Bind02/README.md)*
# *[Ch10) Bind03 - this, component, dimension](../Ch10_Bind03/README.md)*
# *[Ch11) Slot - 기본문법, Fallback, named, props, fragment, $$Slots](../Ch11_Slot/README.md)*
# *[Ch12) LifeCycle01: Hook - onMount, onDestroy, beforeUpdate, afterUpdate](../Ch12_LifeCycle01_Hook/README.md)*
# *[Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick](../Ch13_LifeCycle02/README.md)*
# *[Ch14) PropDrilling과 ContextAPI](../Ch14_ContextAPI/README.md)*
# *[Ch15) Store](../Ch15_Store/README.md)*
# *[Ch16) CustomStore와 bind, ContextAPI 결합](../Ch16_CustomStore/README.md)*
# *[Ch17) CssClass](../Ch17_CssClass/README.md)*
# *[Ch18) Rollup 기반 Sass 적용](../Ch18_rollup-sass/README.md)*
# *[Ch19) Transition](../Ch19_Transition/README.md)*
# *[Ch20) Animation](../Ch20_Animation/README.md)*
# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch22_Action/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
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
