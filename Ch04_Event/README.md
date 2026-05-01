# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *Ch04) Event*
<details>
<summary>접기/펼치기</summary>
<br>

## 목차
1) 이벤트 문법
2) 인라인 이벤트
3) 핸들러 매개변수
4) 이벤트 수식어


## 01) 이벤트 문법
`<태그 on:이벤트타입명={이벤트함수}></태그>` 형태로 사용한다.  
on 키워드 뒤에 콜론과 이벤트타입명을 지정하고 이벤트 함수를 할당한다.  
이벤트 함수는 사용자가 정의한 익명함수, 일반함수 등을 가리키며, Vue에서는 한줄의 실행코드를 할당할 수 있으나 Svelte는 React처럼 오직 함수만 할당 가능하다.  

### 마우스 좌표 출력 프로그램
```svelte
<script>
  let m = {
    x: 0,
    y: 0,
  }
  const handleMouseMove = e => {
    m.x = e.clientX
    m.y = e.clientY
  }
</script>
<div>
  <div on:mousemove={handleMouseMove}>
    x좌표 : {m.x} <br>
    y좌표 : {m.y}
  </div>
</div>
<style>
  div {
    width: 100%; height: 50%;
    background-color: pink;
  }
</style>
```

## 02) 인라인 핸들러
```svelte
<script>
  let m = {
    x: 0,
    y: 0,
  }
</script>
<div>
  <div on:mousemove={e => m = {x: e.clientX, y: e.clientY}}>
    x좌표 : {m.x} <br>
    y좌표 : {m.y}
  </div>
</div>
<style>
  div {
    width: 100%; height: 50%;
    background-color: pink;
  }
</style>
```
## 03) 핸들러 매개변수
Svelte에서는 핸들러 매개변수를 전달할 때 함수 호출 형태로 직접 할당하면 안된다.  
svelte와 vue 모두 함수 참조 형태로 프레임워크 내부에서 할당된 함수를 객체에 등록하고, 객체 프로퍼티에 접근하여 실제 괄호를 붙혀 실행하게 된다.  
따라서 매개변수를 전달하기 위해서는 함수 호출 형태로 호출해야 하므로 아래와 같이 화살표함수로 한번 wrapping해야 매개변수를 전달할 수 있다.  
```svelte
<script>
  const handleClick = text => alert(`${text}`)
</script>
<div>
  <button on:click={handleClick('1번')}>메롱</button> <!-- 바로 호출됨 -->
  <button on:click={e => handleClick('1번')}>메롱</button>
</div>
<style>
  </style>
```
(괄호를 붙이면 함수를 전달하는 것이 아니라 호출된 실행 결과를 전달하게 됨)

Vue의 경우는 함수 호출형태로도 가능한데, Vue는 내부적으로 컴파일러가 wrapper를 자동으로 생성한다.  
이러한 스타일은 html에서 wrapping 내부적으로 하는 형태와 동일하다.
### html 예제
- 이벤트 할당
  ```html
  <button onclick="handler()">Click</button>
  ```
- 내부 변환
  ```js
  button.onclick = () => handler();
  ```
### Vue 예제
#### 기본 함수 참조 형태
- 이벤트 할당
  ```vue
  <template>
    <button @click="handler">버튼<button>
  </template>
  ```
- 내부 변환
  ```js
  {onClick: handler}
  ```
#### 함수 호출 형태
- 이벤트 할당
  ```vue
  <template>
    <button @click="handler()">버튼<button>
  </template>
  ```
- 내부 변환
  ```js
  {onClick: ($event) => handler()}
  ```

## 04) 이벤트 수식어
event.preventDefault(); event.stopPropagation(); 등 이벤트 제어 메소드를 호출하는 기능을 제공한다.  

`on:이벤트명|수식어={핸들러}` 형태로 사용한다.

vue에서 지원하는 Modifier와 같은 기능이다.
preventDefault를 vue와 svelte 각각에서 적용하는 코드는 아래와 같다. 
- vue 
  ```vue
  <template>
    <button @click.prevent="()=>{}"></button>
  </template>
  ```
- svelte
  ```svelte
  <button on:click|preventDefault="()=>{}"></button>
  ```

`on:이벤트명|수식어|수식어={핸들러}` 형태의 다중 처리도 가능하다. 
- vue
  ```vue
  <template>
    <button @click.stop.prevent="()=>{}"></button>
  </template>
  ```
- svelte
  ```svelte
  <button on:click|stopPropagation|preventDefault="()=>{}"></button>
  ```

### 수식어 종류
- preventDefault: e.preventDefault() 호출
- stopPropagation: e.stopPropagation() 호출
- passive: 터치 혹은 휠 이벤트로 발생하는 스크롤 성능 향상
- capture: 버블링 단계가 아닌 캡처 단계에서 이벤트 핸들러 실행
- once: 이벤트 핸들러를 단 한번만 실행
- self: e.target과 이벤트 핸들러를 정의한 요소가 같을 때 실행

</details>
<br>

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
