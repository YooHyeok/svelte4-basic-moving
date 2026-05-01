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
# *Ch14) PropDrilling과 ContextAPI*
<details>
<summary>접기/펼치기</summary>
<br>

## PropDrilling과 ContextAPI

### PropDrilling


### 예제) 손자 컴포넌트에 Props 전달
- PropsGrand
  ```svelte
  <script>
    import PropsFather from "./PropsFather.svelte";
    let num = 1;
  </script>

  <div>
      <h4>Grand 구역</h4>
      <button on:click={() => num++}>1씩 증가</button>
      <p>기본 숫자 : {num}</p>
      <hr />
      <PropsFather {num} />
  </div>
  ```
- PropsFather
  ```svelte
  <script>
    import PropsChild from "./PropsChild.svelte";
    export let num
  </script>

  <div>
      <h2>Father 구역</h2>
      <hr />
      <PropsChild {num} />
  </div>
  ```
- PropsChild
  ```svelte
  <script>
    export let num; // 반응성 유지 O
    $:square = num * num
  </script>

  <div>
      <h3>Child 구역</h3>
      <p>제곱 숫자 : {square}</p>
  </div>
  ```

### ContextAPI
컴포넌트의 깊이가 깊은 경우 중간을 거치지 않고 바로 원하는 하위 컴포넌트까지 값을 공유할 수 있는 기능이다.  
의존성 주입(DI) 개념으로 사용한다.  
상태변수를 context에 저장하는 setContext는 컴포넌트 초기화 시점에만 호출 가능하다.
때문에 svelte 4까지는 let 상태변수의 반응성 유지가 되지 않는다.  
반응성이 필요없는 변하지 않는 설정값 공유용 데이터만 가능한 기능에서 사용할 수 있다.  

### 예제) ContextAPI 손자 컴포넌트에 Provide
```svelte
<script>
  import { setContext } from "svelte";
  import PropsFather from "./PropsFather.svelte";
  let state = {num : 1};
  setContext("state", state)
</script>

<div>
  <h4>Grand 구역</h4>
  <button on:click={() => state = {...state, num: state.num + 1}}>1씩 증가</button>
  <button on:click={() => state.num++}>1씩 증가</button>
  <p>기본 숫자 : {state.num}</p>
  <hr />
  <PropsFather />
</div>
```

- Child
  ```svelte
  <script>
    import { getContext } from "svelte";
    let state = getContext("state");
    $:square = state.num * state.num  // 반응성 유지 X
  </script>

  <div>
      <h3>Child 구역</h3>
      <p>제곱 숫자1 : {state.num}</p> <!-- 반응성 유지 X -->
      <p>제곱 숫자2 : {square}</p>
  </div>
  ```

#### 왜 반응성 유지가 되지 않을까
vue의 provide/inject, react의 conetxtAPI는 모두 반응성이 유지된다.  
그러나 svelte는 반응성이 유지되지 않는다.  

react는 리렌더링 매커니즘으로 값이 변경되면 컴포넌트 전체가 다시 랜더링 되기 때문에 반응성이 유지된다.  
(컴포넌트 전체 리랜더링→이전상태 가상돔과 비교 후 변경된 `<Provider/>` 부분만 변경)
vue의 반응형 변수는 내부적으로 객체로 관리되기 때문에 객체 참조에 의해 반응성이 유지된다.  
(리랜더링 되지 않고 proxy에 대한 변경만 감지 않음)
react와 vue는 모두 런타임 환경에서 변경을 체크한 후 가상돔과 비교한다
반면 svelte는 컴파일 시점에 let 상태에 대한 변경 감지 코드를 미리 적용해둔다.  
다.  

| 프레임워크 | 반응성 감지 | DOM 업데이트 방식 | 런타임 비용 |
|--|--|--|--|
| React | 재렌더링 | Virtual DOM diff | 높음 |
| Vue 2 | Object.defineProperty | Virtual DOM diff | 중간 |
| Vue 3 | Proxy | Virtual DOM diff | 중간 |
| Svelte | 컴파일러 | 직접 DOM 수정 | 낮음 |

앞서 말했듯, setConetxt는 컴포너트 초기화 시점에만 호출할 수 있으며, svelte는  리랜더링 개념이 아니고, let 반응성 변수도 proxy가 아니므로 반응성이 유지될 수 없게 된다.  

svelte5의 룬($)문법을 사용하면 conetextAPI의 반응성을 유지시킬 수 있다.  
(vue의 proxy와 유사한 개념)

</details>
<br>

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
