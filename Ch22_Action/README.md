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
# Ch22) Action
<details>
<summary>접기/펼치기</summary>
<br>

1. 액션 기본 개념
2. 액션 매개변수
3. update & destroy
4. Action 라이브러리 (Svelte Dnd Actions)

## 01) 액션 기본 사용법
 
Action은 DOM 요소가 DOM에 추적될 때 실행하는 함수를 말한다.  
예를들어 요소가 없는 곳을 클릭했을 때 명령을 주거나, input 요소에 초점을 바로 받게 하고 싶을 때  
또는 기본적으로 제공되는 기능 외에도 HTML 요소에 특별한 동작을 주고 싶을 때  
위와같이 Svelte에서 DOM을 직접적으로 제어해야 하는 경우 Action을 사용하면 개발자가 특별한 동작을 제어할 수 있다.  

DOM 요소에는 `use:` 형태의 지시문을 이용하여 `use:함수명` 형태로 함수 명령을 받는다.  
바인딩 한 함수에는 Action을 지정한 DOM요소를 매개변수로 전달받을 수 있으며, 해당 매개변수를 node라고 통칭한다.  
node에 접근하여 특별한 동작을 주며, 일반 js 문법과 동일하게 요소에대한 속성들을 제공해준다.

```svelte
<script>
  const 액션명 = (node) => {
    // 실행 명령
  }
</script>
<요소 use:액션명 />
```

### 예제 01) 텍스트노드 빨강 적용
```svelte
<script>
  const colorChange = (node) => {
    node.style.color = 'red'
  }
</script>
<div>
  <h3 use:colorChange>제목태그1</h3>
  <h3>제목태그2</h3>
  <h3 use:colorChange>제목태그3</h3>
</div>
```


## 02) 액션 매개변수
`use:함수명={매개변수}` 형태로 작성하여 함수 두번째 매개변수로 특정 값을 매개변수로 전달할 수 있다.  
```svelte
<script>
  const 액션명 = (node, 매개변수) => {
    // 실행 명령
  }
</script>
<요소 use:액션명={매개변수} />
```

### 예제 02) input 포커싱 및 매개변수 값 세팅
```svelte
<script>
  //상태변수 선언
  let isInput01 = false;
  let isInput02 = false;

  //이벤트함수
  const handleClick01 = () => isInput01 = true;
  const handleClick02 = () => isInput02 = true;
  const inputFocus = (node, inputValue) => {
    node.focus() // 포커싱
    node.value = inputValue; // 매개변수 값처리
  }
</script>
<div>
  <button on:click={handleClick01}>첫번째입력요소활성</button>
  {#if isInput01}
  <input type="text" placeholder="첫번째" use:inputFocus={'값처리01'}/>
  {/if}
  <button on:click={handleClick02}>두번째입력요소활성</button>
  {#if isInput02}
  <input type="text" placeholder="두번째" use:inputFocus={'값처리02'}/>
  {/if}
</div>
```

## 03) update & destory
Action의 생명주기 함수로 액션 함수의 return문에 작성한다.

- update: 해당 액션이 사용하는 DOM 요소에서 값이 변경될 때 사용한다
- destroy: 해당 액션이 사용하는 DOM 요소가 사라질 때 작성한다.

```svelte
<script>
  const 액션명 = (node, 매개변수) => {
    // 실행 명령
	return {
	  update: (newValue) => {
	  },
	  destroy: () => {
	  },
  }
</script>
<요소 use:액션명={매개변수} />
```

### 예제03) update/destroy 활용 input 출력값 제어
버튼 클릭 후 input이 활성화 된 상태에서 값이 변경될경우 변경을 감지하여 update 생명주기 함수에 매개변수로 신규값을 전달하고, 초기화시킨다.  
비활성 버튼을 통해 해당 영역을 DOM에서 제거할경우 경우 제거를 감지하여 destory 생명주기 함수를 통해 바인딩한 value값을 초기화한다.  
```svelte
<script>
  //상태변수 선언
  let isInput = false;
  let inputValue = '아직 없음';

  //이벤트함수
  const handleClick = (param) => isInput = param

  //초점액션
  const inputFocus = (node, value) => {
    node.focus();
    node.value = value;
    return {
      // input value속성 값을 감지하여 변경되면 실행
      update: (newValue) => { 
        node.value = newValue;
      },
      destroy: () => {
        inputValue = '없음';
      },
    }
  }
</script>
<div>
  <button on:click={() => handleClick(true)}>활성</button>
  <button on:click={() => handleClick(false)}>비활성</button>
  <hr />
  {#if isInput}
    <input type="text" bind:value={inputValue} use:inputFocus={inputValue} />
  {/if}
  <h3>입력값 : {inputValue}</h3>
</div>
```

## 04) Action 라이브러리 - Svelte Dnd Action
Action을 이용한 함수는 직접 작성할 수도 있지만, 다른 개발자가 만든 라이브러리도 사용 가능하다.  
Svelte Dnd Action는 요소를 드래그 앤 드롭 하는 라이브러리이다.  

```bash
npm install svelte-dnd-action
```

### svelte-dnd-action 커스텀 이벤트 동작 원리

svelte-dnd-action은 Svelte의 Action(`use:`) 내부에서 **CustomEvent**를 dispatch하여 이벤트를 발생시킨다.  
즉, 라이브러리가 직접 DOM 요소에 커스텀 이벤트를 쏘고, Svelte의 `on:이벤트명`으로 수신하는 구조이다.

#### 이벤트 흐름
```
1. use:dndzone 액션이 DOM 요소에 바인딩
2. 사용자가 드래그 시작 → 라이브러리가 el.dispatchEvent(new CustomEvent("consider")) 실행
3. 사용자가 드롭 완료 → 라이브러리가 el.dispatchEvent(new CustomEvent("finalize")) 실행
4. Svelte의 on:consider, on:finalize로 해당 이벤트를 수신
```

#### 라이브러리 내부 코드 (dispatch 부분)
라이브러리 내부에서는 아래와 같이 `dispatchEvent`를 통해 커스텀 이벤트를 발생시킨다.  
`detail` 객체에 변경된 `items` 배열과 `info`를 담아 전달한다.
- node_modules/svelte-dnd-action/dist/index.js
  ```js
  var FINALIZE_EVENT_NAME = "finalize";
  var CONSIDER_EVENT_NAME = "consider";

  function dispatchFinalizeEvent(el, items, info) {
    el.dispatchEvent(new CustomEvent(FINALIZE_EVENT_NAME, {
      detail: { items: items, info: info }
    }));
  }

  function dispatchConsiderEvent(el, items, info) {
    el.dispatchEvent(new CustomEvent(CONSIDER_EVENT_NAME, {
      detail: { items: items, info: info }
    }));
  }
  ```

#### 라이브러리 타입 정의
- node_modules/svelte-dnd-action/dist/index.ts
```ts
export interface DndZoneAttributes<T> {
  "on:consider"?: (e: CustomEvent<DndEvent<T>>) => void;
  "on:finalize"?: (e: CustomEvent<DndEvent<T>>) => void;
}
```

#### 사용자 코드에서 수신
```svelte
<section
  use:dndzone={{items, flipDurationMs}}
  on:consider={handleDndConsider}
  on:finalize={handleDndFinalize}
>
```
- `on:consider` → 드래그 중 항목 순서가 변경될 때마다 호출 (미리보기)
- `on:finalize` → 드롭하여 최종 확정될 때 호출

`e.detail.items`로 변경된 배열을 받아 상태를 업데이트하면 된다.
```js
const handleDndConsider = (e) => { items = e.detail.items }
const handleDndFinalize = (e) => { items = e.detail.items }
```

#### 동작 요약
1. `use:dndzone={{items}}` → 라이브러리에 items 배열 전달
2. 사용자가 드래그 → 라이브러리 내부에서 items 순서 재정렬
3. `dispatchEvent(new CustomEvent("consider", { detail: { items } }))` → 재정렬된 배열을 이벤트에 담아 dispatch
4. `on:consider={handler}` → `e.detail.items`로 재정렬된 배열을 꺼냄
5. `items = e.detail.items` → 상태 업데이트 → Svelte 반응성에 의해 DOM 갱신

즉, 라이브러리가 직접 원본 `items`를 수정하는 것이 아니라 **내부에서 재정렬한 새 배열을 커스텀 이벤트를 통해 돌려주고**, 개발자가 `items = e.detail.items`로 직접 상태를 갱신하는 구조이다.  
이렇게 하는 이유는 Svelte의 반응성은 **변수 재할당**을 통해 동작하기 때문에, 라이브러리가 임의로 원본을 수정하면 Svelte가 변경을 감지하지 못하기 때문이다.

</details>
<br>

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
