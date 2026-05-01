# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *[Ch04) Event](../Ch04_Event/README.md)*
# *Ch05) Props export let*
<details>
<summary>접기/펼치기</summary>
<br>

## Props란?
Props란 Properties의 줄인말로 React와 Vue에서 사용하는 단어이다.  
Svelte에서는 Props라는 단어를 공식적으로 사용하지 않지만 동일한 기능을 갖는 export let 문법이 있다.  
부모 컴포넌트에서 자식 컴포넌트에 전댈하주는 값으로 읽기 전용 데이터이다.  
컴포넌트는 상하관계 구성되기 때문에 데이터 전달을 부모에서 자식 방향으로 수직적으로 처리한다.  

## 01) export let 기본 문법
### 부모 컴포넌트
`<자식컴포넌트 prop명={전달값}>` 혹은 `<자식컴포넌트 prop명="전달값">` 형태로 사용한다.  
넘기려는 값이 변수나 객체가 아닌 원시타입 값 그 자체일 경우 쌍따옴표로 감싸 넘길수도 있다.  
하지만 숫자 타입을 기입할 경우 vsc에서는 숫자형으로 보이지만 실제 넘겨지는 타입은 string 타입이다.  
변수 자체를 넘길경우엔 중괄호 내에 입력해야만 하고,

```svelte
<script>
  import Child from './child.svelte'
  let obj = {value:"값"}
</script>
<Child prop={"바보"}/>
<Child prop="메롱"/>
<Child prop="13"/>
<Child prop="false"/>
<Child prop={obj}/>
<Child prop={{value:"값"}}/>
```
### 자식 컴포넌트
자식 컴포넌트의 script 태그 내 `export let prop명` 으로 전달받는다.  
```svelte
<script>
  export let prop
  console.log("prop = ", prop)  
</script>
<p>prop: {prop}</p>
```

## 02) default 값
react에서는 일반 변수의 매개변수에 기본값을 설정하는것과 동일한 형태로 `(prop = "기본값")` 과 같이 기본값을 설정할 수 있다.  
vue에서는 추가로 읽기전용, 필수여부, 기본값, 타입 모두를 설정할 수 있다.  
svelte에서는 기본적으로 기본값 설정만 지원하며, 일반적으로 변수에 값을 할당하는 형태로 `export let prop = "기본값"` 과 같이 선언한다.  

### 자식 컴포넌트
```svelte
<script>
  export let prop = "기본값"
  console.log("prop = ", prop)  
</script>
<p>prop: {prop}</p>
```

## 03) Props 값 변경
자식 컴포넌트는 전달되는 값을 변경할 수 없다.  
값을 변경하기 위해서는 오직 부모 컴포넌트에서만 변경이 가능하며, 이는 state 상태변수를 props로 전달하는 유형에만 해당한다.  

1) state 변경 함수 Props 전달
2) createEventDispatcher

### state 변경 함수 Props 전달
Svelte에서는 React나 Vue 처럼 Props로 함수를 전달할 수 있다.  
부모 컴포넌트에서 state 값을 조작하는 함수를 선언한 뒤, 자식 컴포넌트 태그의 속성을 통해 전달하고 자식 컴포넌트에서 `export let`으로 해당 함수를 할당하여 전달받을 수 있다.  
#### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  let age01 = 20;
  const onPlus = () => age01++
  const onMinus = () => age01--
</script>
<div>
  <Child name={'김철수'} age={age01} hobby={'축구하기'} onPlus={onPlus} onMinus={onMinus}/>  
</div>
```
#### 자식 컴트넌트
```svelte
<script>
  export let age = 20;
</script>

<h3>나이: {age}</h3>
<hr>
<button on:click={onPlus}>나이증가 +</button>
<button on:click={onMinus}>나이감소 -</button>
```
### event drivent: createEventDispatcher
Vue에서 지원하는 Emit 기능과 유사한 이벤트 기반 통신 방식이다.

부모 컴포넌트에서 자식 컴포넌트 태그에 `on:이벤트명={함수명}` 형태로 커스텀 이벤트와 핸들러 함수를 등록해준다.  
자식 컴포넌트에서는 svelte 패키지로부터 createEventDispatcher를 import문을 사용하여 불러온 뒤  
`const dispatch = createEventDispatcher()` 형태로 선언과 동시에 함수 호출을 통해 할당하고,  
할당된 변수 dispatch를 `dispatch('이벤트명', 전달값)`함수 호출 문법을 통해 첫번째 매개변수로 이벤트명을, 두번째 매개변수로 payload 값을 넘긴다.  
자식 컴포넌트에서는 핸들러 함수에서 payload 값을 핸들러 함수 매개변수의 detail 속성으로 접근할 수 있게 된다.  

#### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  let age01 = 20;
  const operation = (event) => age01 = event.detail.age
</script>
<div>
  <Child name={'김철수'} age={age01} hobby={'축구하기'} on:plus={operation} on:minus={operation}/>
</div>
```
#### 자식 컴트넌트
```svelte
<script>
  import { createEventDispatcher } from "svelte";
  export let age = 20;
  const dispatch = createEventDispatcher();
  const onPlus = () => dispatch('plus', {age: age+1})
  const onMinus = () => dispatch('minus', {age: age-1})
</script>

<h3>나이: {age}</h3>
<hr>
<button on:click={onPlus}>나이증가 +</button>
<button on:click={onMinus}>나이감소 -</button>
```

## 04) spread

```js
const people {
  name: '김철수',
  age: 20,
  hobby: '축구하기'
}
```
위와같은 형태의 객체를 spread 문법을 통해 props로 전달하면, 
자식 컴포넌트에서는 객체 형태로 한번에 받지 않고, 각 속성을 `export let 속성` 형태로 할당받게 된다.  
```svelte
<script>
  export let name;
  export let age;
  export let hobby;
</script>

<h3>이름: {name}</h3>
<h3>나이: {age}</h3>
<h3>취미: {hobby}</h3>
<hr>
```

### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  const allData01 = {
    name: '김철수',
    age: 20,
    hobby: '축구하기'
  }
  const allData02 = {
    name: '김영희',
    age: 21,
    hobby: '넷플릭스보기'
  }
</script>
<div>
  <Child {...allData01}/>
  <Child {...allData02}/>
</div>
```
### 자식 컴포넌트
```svelte
<script>
  export let name;
  export let age;
  export let hobby;
</script>

<h3>이름: {name}</h3>
<h3>나이: {age}</h3>
<h3>취미: {hobby}</h3>
<hr>
```
</details>
<br>

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
