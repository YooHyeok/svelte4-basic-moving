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
# *Ch16) Custom Store와 bind, ConetxtAPI 결합*
<details>
<summary>접기/펼치기</summary>
<br>

Store 모듈 개발시 subscribe를 갖는 객체를 만들면 커스텀 스토어가 된다.  

외부에서 store를 제어하지 않고 모듈 내에서 기능별로 함수를 미리 구현하여 상태 변경을 통제함으로써 캡슐화, 상태 일관성 보장, 유지보수성 향상, 재사용성 증가 등의 장점을 갖는다.  

```js
import { 스토어 } from "svelte/store"

const createXX스토어 = () => {
  const { subscribe, /* update, set */ } = 스토어(초기값)

  const storeUtil = () => {
    /* store 값 초기화 등 외부 접근 유틸 함수 */
    console.log("storeUtil 동작")
  }
  return {
    subscribe,
    /* update, set, */
    storeUtil
  }
}

export const xx스토어 = createXX스토어();
```
위와같이 함수를 subscribe를 필수속성으로 갖는 객체를 반환해야만 한다.  

```svelte
<script>
  import { xx스토어 } from "./store/custom"
</script>
<p>{ $xx스토어 }</p>
<button on:click={xx스토어.storeUtil}>스토어 유틸 동작</button>
```

### store bind
store도 마크업 영역에서 bind문법을 통해 바인딩이 가능하다.  
단, 내부적으로 set을 통해 초기화하기 때문에 set이 존재하는 writable 스토어만 가능하다.  

```js
import { writable } from "svelte/store"

export const store = writable(초기값)
```
```svelte
<script>
  import { store } from "./store/custom"
</script>
<p>{ $store }</p>
<input type="text" bind:value={$store} />
```

#### 커스텀 스토어에서의 set 반환
커스텀 스토어를 작성할 때 `bind:value={$store}` 형태의 양방향 바인딩을 사용하려면 반드시 `set`을 반환해야 한다.  
`$store`에 값을 할당하면 내부적으로 `store.set(값)`이 호출되기 때문이다.  
`subscribe`만 반환하면 값을 읽을 수는 있지만 쓰기가 불가능하여 `set is not a function` 에러가 발생한다.  

| 반환값 | `$store` 읽기 | `$store` 쓰기 (`bind` 등) |
|--------|--------------|--------------------------|
| `subscribe`만 | ⭕ | ❌ (`set is not a function`) |
| `subscribe` + `set` | ⭕ | ⭕ |

```js
import { writable } from 'svelte/store';
const { subscribe, set } = writable('')
export const exStore = {
  subscribe,  // $exStore 읽기용
  set,         // $exStore 쓰기용 (bind 사용 시 필수)
}
```
```svelte
<script>
  import { exStore } from './store/index.js'
</script>
<!-- set이 반환되어 있으므로 양방향 바인딩 가능 -->
<input bind:value={$exStore} />
```

`$`키워드는 `.svelte` 파일에서만 사용 가능하며, `.js` 파일에서는 `store.set(값)` 또는 커스텀 메서드를 통해 값을 변경해야 한다.  

이때 초기값은 무조건 primitive 타입이어야 한다.  
만약 객체타입으로 초기값을 지정한 후 특정 속성에 도트연산으로 접근하여 bind할 경우 내부적으로 set이 호출되면서 전체 객체가 교체되어 다른 속성이 존재한다면 접근한 속성 외 다른 속성은 모두 사라지게 된다.  
```js
import { writable } from "svelte/store"

export const store = writable({a: '', b: ''})
```
```svelte
<script>
  import { store } from "./store/custom"
</script>
<p>{ $store }</p>
<input type="text" bind:value={$store.a} /> <!-- 메롱 입력 -->
```
아래와 같이 b 속성이 삭제된다.
```json
{
  "a": "메롱 입력"
}
```

##### Readable store의 set을 반환한다면?
아래와 같이 Custom store를 통해 subscribe와 set을 함께 넘긴다면 가능하다.  
내부 콜백함수의 매개변수로 받는 set 함수를 store 내 지역변수에 초기화 한 후 store 객체 내부 속성으로 할당하는 방식이다.  
(writable이 있기 때문에 실무에서 추천되는 방식은 아니다.)
```js
import { readable } from "svelte/store";

const createStore = () => {
  const initValue = ''
  let set
  const { subscribe } = readable(initValue, (_set) => {
    set = _set;
    /* 클린업 */
    return () => set(initValue)
  });
  return {
    subscribe,
    set: (v) => set(v)
  }
}

export const store = createStore();
```

### Context API + Store 결합으로 Context API의 반응성 보완
앞서 Ch14 챕터에서 Context API는 반응성이 없다.  
컴포넌트가 초기화될 때 setContext() 함수를 통해 한번 만 값을 세팅하기 때문에 let 반응성 변수를 context로 넘기면 이후에 값이 변경되더라도 하위 컴포넌트가 리랜더링 되지 않는다.  
따라서 기본적으로는 반응성이 필요없는 변하지 않는 설정값 공유용 데이터만 가능한 기능에서 사용할 수 있다.  

그러나 Context API에 writable 같은 Store를 담은 후 자식 컴포넌트에서 꺼낸다면, 반응성을 유지할 수 있다.  
사실 Store는 그 자체만으로 전역 상태 관리가 가능하기 때문에 억지스러울 수 있으나, 상태 스코프(범위) 격리 측면에서 봤을때 정석 패턴으로 볼수도 있다.  

일반 Store의 경우 앱 전체에서 공유되는 완전한 전역(Global)이 되지만, Context와 Store를 결합할 경우 특정 부모-자식 컴포넌트 내에서만 공유되는 지역(Scoped)적인 상태를 만들 수 있다.  
만약 Context를 쓰지 않고 전역 Store만 쓰게 되면, 같은 컴포넌트를 화면에 여러 번 재사용 할 때 상태가 서로 충돌될 수 있다.  
(특히 Svelte Kit등을 이용한 SSR 환경에서는 사용자 간 상태가 공유되어 버리는 치명적 문제가 발생할 수 있다.)  

- 최상위 컴포넌트
  ```svelte
  <script>
    import { writable } from 'svelte/store'
    import { setContext } from "svelte";
    import ContextFather from "./ContextFather.svelte";

    // let num = 1;
    let num = writable(1);
    setContext("num", num)
  </script>

  <div>
    <h4>Grand 구역</h4>
    <button on:click={() => $num++}>1씩 증가</button>
    <p>기본 숫자 : {$num}</p>
    <hr />
    <ContextFather />
  </div>
  ```

- 1Depth 하위 컴포넌트
  ```svelte
  <script>
    import ContextChild from "./ContextChild.svelte";
  </script>

  <div>
    <h2>Father 구역</h2>
    <hr />
    <ContextChild />
  </div>
  ```
- 2Depth 하위 컴포넌트
  ```svelte
  <script>
    import { getContext } from "svelte";
    let num = getContext("num");
    // $:square = num * num
    $:square = $num * $num
  </script>

  <div>
      <h3>Child 구역</h3>
      <p>제곱 숫자 : {$num}</p>
      <p>제곱 숫자 : {square}</p>
  </div>
  ```

</details>
<br>

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
