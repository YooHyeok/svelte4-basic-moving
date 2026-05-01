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
# *Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick*
<details>
<summary>접기/펼치기</summary>
<br>

## elizabot 채팅 - update 활용

### [elizabot](https://www.npmjs.com/package/elizabot)
eliza는 가짜 심리치료사로 개발자가 만든 채팅 플러그인이다.  
주로 채팅 봇을 테스트 하기 위해 사용한다.  

#### 의존성 설치
```bash
npm install elizabot
```

### 예제) 채팅창 구현 및 스크롤 하단 고정
채팅 창을 제작하여 elizabot을 연동하면, 실제 채팅처럼 말풍선을 주고받을 수 있게 된다.  
이때 채팅창 컨텐츠 영역에 지정한 높이 이상으로 말풍선이 들어오게 되면 스크롤바가 생성되고, 마지막 위치에 스크롤된 상태로 있게 된다.  
컨텐츠 영역의 설정한 높이를 초과하여 스크롤이 생성되었을 때, 컨텐츠 영역이 길어질 때 마다 스크롤을 하단으로 이동시키는 로직을 구현해본다.  

#### 계산 필요 속성
- offsetHeight : div 안에서 보여지는 영역 높이
- scrollTop    : 현재 스크롤 위치 (최상단 ~ 스크롤 시작 위치)
- scrollHeight : div 내부 전체 콘텐츠 높이
- 20           : 버퍼 값, 아래쪽 여유


#### 스크롤 없음

- beforeUpdate
  ```svelte
  <script>
    import { beforeUpdate, afterUpdate } from 'svelte'
    beforeUpdate(() => {
      autoscroll = div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
    })
  </script>
  ```
  - 공식: 영역 전체 높이 + 스크롤 위치 > 컨텐츠 전체 높이 - 20  
    ```
    offsetHeight + scrollTop = 767 + 0 = 767
    scrollHeight - 20      = 766 - 20 = 746
    ```

- 스크롤 위치: 0
  ```
  [div 영역]
  ┌──────────────────┐ <- scrollTop (0) (스크롤 없음)
  │ visible content  │ 
  │                  │
  │                  │
  │                  │
  │                  │ <- scrollHeight (766) 
  └──────────────────┘ <- offsetHeight (767)
  767 + 0 = [767] > 766 - 20 = [746]
  autoscroll = true
  ```

#### 스크롤 생성 및 이동
```svelte
<script>
  import { beforeUpdate, afterUpdate } from 'svelte'
  afterUpdate(() => {
    if (autoscroll) {
      div.scrollTop = div.scrollHeight;
    }
  })
</script>
```

1) 스크롤 생성: 최상단 (스크롤 위치: 0)  
  - div 내부 전체 콘텐츠 높이 scrollHeight가 offsetHeight 초과  
  - 추가된 컨텐츠 높이 7  
  ```
  [div 영역]
  ┌──────────────────┐ <- scrollTop (0) (스크롤 생성: 새로 추가된 1줄만 계산됨)
  │ visible content  │ 
  │                  │
  │                  │
  │                  │ 
  │                  │ 
  │ new message ↑    │ <- offsetHeight (767)
  └──────────────────┘ <- scrollHeight (773)
  767 + 7 = [774] > 773 - 20 = [753]
  autoscroll = true
  ```

2) 스크롤 이동: 7만큼 이동 (스크롤 위치: 7)  
스크롤이 최상단에서 추가된 컨텐츠 높이 만큼 7 증가함  
afterUpdate에 의해 scrollTop의 값을 offsetHeight만큼 더한다.  
(이때 추가된 컨텐츠 높이 7 만큼을 넘을 수 없기 때문에 7만큼만 증가함.)  
```
[div 영역]
┌──────────────────┐ 
│ visible content  │ <- scrollTop (7) (스크롤 생성: 새로 추가된 1줄만 계산됨)
│                  │
│                  │
│                  │ 
│                  │ 
│ new message ↑    │ <- offsetHeight (767)
└──────────────────┘ <- scrollHeight (773)
767 + 7 = [774] > 773 - 20 = [753]
autoscroll = true
```


## tick

### 개념
DOM이 업데이트 되었는지 확실히 보장하고 싶을 때 사용하는 도구이다.  
변경된 상태값이 실제 DOM에 적용되면 다음 단계를 진행할 수 있도록 도와준다.  
예를들어 A로직 후 B 로직을 실행할 때, A로직에 의해 DOM이 업데이트 되는데, B로직이 DOM이 업데이트 된 후 실행될 수 있게 기다려주는 기능을 제공한다.  
변경된 내용이 있다면 변경된 내용이 DOM에 반영된 직후 바로 호출되거나, 변경된 내용이 없어도 바로 호출된다.  

변경된 내용이 없어도 바로 호출된다는 것은, 사실 Tick을 안써도 되는 상황이지 않을까?  
특정 로직이 실행되었을 때 상태 변경이 없거나 혹은 상태 변경 후 DOM이 변경되지 않더라도 DOM이 업데이트 되었는지 확실히 **보장**하고 싶을 때 사용한다.  
Vue의 nextTick과 동일한 역할을 수행한다.  

### 기본 문법
Promise 기반으로 체이닝방식 혹은 async/await방식 모두 사용 가능하다.  

- 체이닝 방식
  ```svelte
  <script>
    import { tick } from 'svelte'
    const tickExample = async () => {
      /* 1. 로직 실행 */
      tick().then(() => {
      /* 2. DOM 반영 후 실행할 로직 */
    })
    }
    
  </script>
  ```
- async/await 방식
  ```svelte
  <script>
    import { tick } from 'svelte'
    const tickExample = async () => {
      /* 1. 로직 실행 */
      await tick() // DOM 반영 대기
      /* 2. DOM 반영 후 실행할 로직 */
    }
  </script>
  ```

### 예제) input 활성화 후 포커싱
상태값에 의해 dom이 생성되고, 생성된 dom에 접근하기위해 Tick을 통해 대기하는 예제이다.  
- 체이닝 방식
  ```svelte
  <script>
      import { tick } from "svelte";

    let active;
    let input;
    const handleCilck = (param) => {
      active = param
      tick().then(() => {
      if (active) {
          input.focus()
        }
      })
    };
  </script>
  <div>
    <h1>Tick</h1>
    <button on:click={() => handleCilck(true)}>input 활성화</button>
    <button on:click={() => handleCilck(false)}>input 비활성화</button>
    {#if active}
    <div>
      <input type="text" bind:this={input} />
    </div>
    {/if}
  </div>
  ```
- async/await 방식
  ```svelte
  <script>
      import { tick } from "svelte";

    let active;
    let input;
    const handleCilck = async (param) => {
      active = param
      await tick()
      if (active) {
        input.focus()
      }
    };
  </script>
  <div>
    <h1>Tick</h1>
    <button on:click={() => handleCilck(true)}>input 활성화</button>
    <button on:click={() => handleCilck(false)}>input 비활성화</button>
    {#if active}
    <div>
      <input type="text" bind:this={input} />
    </div>
    {/if}
  </div>
  ```

### 번외 - Tick의 원리 (MicroTask)
<details>
<summary>접기/펼치기</summary>
<br>

Svelte는 상태가 업데이트 되면 즉시 업데이트 되지 않는다.  
정해진 시간 동안 변경된 내용을 한번에 업데이트 한다.  
변경된 내용들은 Microtask Queue에 적재된다.

자바스크립트 이벤트 루프 구조를 살펴본다.  
```
Call Stack (현재 실행중인 코드)
↓
Microtask Queue
↓
Render (DOM paint)
↓
Macrotask Queue
```

#### `_task Queue가 필요한 이유`
자바스크립트는 기본적으로 싱글 스레드다.  
즉, 동시에 한가지 일만 처리할 수 있다.  
```js
console.log("A")
console.log("B")
console.log("C")
```
위 코드는 동기 실행이다.  

문제는 아래와 같은 작업이다.  
- 네트워크 요청
- 파일 읽기
- 타이머
- 사용자 클릭 이벤트  
위와 같은 작업들은 시간이 오래걸린다.  
예를들어 `fetch("/data")` 와 같은 api 호출을 자바스크립트가 동기적으로 기다리면 브라우저와 UI가 멈춘다.  
그래서 자바스크립트는 비동기 구조를 사용한다.  

자바스크립트 엔진이 비동기를 처리하기 위한 구조는 다음과 같다.  
```
Call Stack
↓
Web APIs
↓
Task Queue
↓
Event Loop
```
<br>

#### `Call Stack`
현재 실행중인 함수들이 쌓이는 공간이다.  
자바스크립트 엔진이 직접 관리하며, 함수 실행이 완료되면 자동으로 pop(제거) 한다.  
```js
function a() {
  b()
}
function b() {
  console.log()
}
a()
```
위 코드가 Call Stack에 쌓이면 아래와 같이 쌓이고, 각 함수들이 실행되면서 stack이 비워진다.다.  
```
[Call Stack]

a()
└ b()
  └ console.log()
```
<br>

#### `Web APIs`
브라우저는 자바스크립트 엔진 외 비동기 작업을 처리하는 API를 제공한다.
- setTimeout
- fetch
- DOM events

```js
setTimeout(() => {
  console.log("1초 지남")
}, 1000)
```
setTimeout의 실행과정은 아래와 같다.  
```
[실행 과정]

setTimeout 등록
↓
Web API timer 처리
↓
1초 후 callback 준비
```
이때 callback은 Task Queue로 이동한다.

#### `Task Queue`
Task Queue는 나중에 실행할 작업을 저장하는 대기열이다.  
```
[Task Queue]
task1
task2
task3
```
Event Loop는 Call Stack이 비어있으면 Task Queue에서 Task 하나를 꺼내 실행한다.  

#### `Event Loop`
자바스크립트 실행을 관리하는 루프이다.  
Call Stack이 비어있는지 감시하고, 비어있다면 Task Queue 에서 Task 하나를 꺼내 Call Stack에 쌓는다.  
```js
while(true) {
  if (!callStack || callstack.length === 0) {
    // taskQueue에서 task 실행
  }
}
```

자바스크립트에는 2가지 종류의 TaskQueue가 있다.  
- Microtask Queue
- Macrotask Queue
이 둘은 우선순위가 다르다.  

#### `Macrotask Queue`
일반적인 비동기 작업이다.  
- setTimeout
- setInterval
- DOM events
- postMessage  

```js
setTimeout(()=> {},1000)
```
위 코드에서 callback이 Mackrotask Queue에 들어간다.  
(공통 패턴은 등록해둔 콜백/핸들러가 큐에 들어가게 된다.)  

#### `Microtask Queue`
Macrotask 보다 더 높은 우선순위를 가진 task로, 더 먼저 실행된다.  
- Prmomise.then
- queueMicrotask
- MutationObserver  
```js
Promise.resolve().then(() => {
  console.log("Promise")
})
```
then에 작성한 callback은 Microtask Queue에 들어간다.  
실행 순서는 아래와 같다.  
```
[JS 이벤트 루프 순서]
Call Stack
↓
Microtask Queue
↓
Redner
↓
Macrotask Queue
```

```js
console.log("A") // 1. (Call Stack)
setTimeout(()=>{
  console.log("B") // 4. (Macrotask)
}, 1000)
Promise.resolve().then(() => {
  console.log("C") // 3. (Microtask)
})
console.log("D") // 2. (Call Stack)
```

```
[실행 흐름]

Call Stack
 ├ console.log(A)
 ├ setTimeout
 ├ Promise.then
 └ console.log(D)

Call Stack 비워짐 (순차적으로 실행)

Microtask Queue
Call Stack
 └ console.log(B) (setTimeout)

Call Stack 비워짐

Macrotask Queue
Call Stack
 └ console.log(C) (Promise.then())

 Call Stack 비워짐
```

자바스크립트 엔진에 의해 1번과 2번 그리고 3번과 4번의 Web APIs들이 Call Stack에 쌓이고  
3번과 4번의 콜백이 각각 Microtask와 Macrotask Queue(Task Queue)에 쌓인다.  
Call Stack에서 1, 2, 3, 4가 모두 호출 완료된 후 Call Stack이 비워진다.  
이벤트 루프는 Call Stack이 비워진것을 감지하고, 우선순위가 높은 Microtask Queue를 확인하여 3번을 Call Stack에 넣은 후 호출한다.  
Call Stack이 비워지면 다시 이벤트 루프가 Macrotask Queue를 확인하여 4번을 Call Stack에 넣은 후 호출하고 Call Stack이 비워진다.  

브라우저는 보통 Microstack 이후 render를 수행한다.  
```
JS 실행
↓
Microtask
↓
DOM render
```

#### Svelte 구조로 이해
Svelte는 state 변경시 앞서 말한대로 DOM 업데이트를 바로 하지 않는다.  

```
state 변경
↓
dirty mark
↓
schedule_update()
↓
microtask
↓
flush
↓
DOM update
```


```js
import {onMount} from 'svelte'

let count = 0;

onMount(() => {
  count = 1
  count = 2
  count = 3
})
```
```js
import {onMount} from 'svelte'

let count = 0;
let num = 0;

onMount(() => {
  count = 1
  num = 1
  count = 2
  num = 2
  count = 3
})
```
예를들어 위와같이 상태변수를 3번 변경할 경우 DOM update는 3번이 된다.  
하지만 Svelte 입장에서는 비용적인 측면에서 브라우저 렌더링 비용을 줄여주기 위해 중간 DOM 업데이트를 생략함으로써 DOM 업데이트 횟수를 1번으로 처리한다.  
```
[state 변경]
→ DOM update 예약
→ microtask에서 DOM 업데이트
```
그런 이유로 Svelte는 위와 같은 구조를 사용한다.
이 과정을 더 상세하게 나누면 아래와 같다.  
```
사용자 정의 함수 실행
↓
state 변경
↓
dirty mark
↓
schedule_update()
↓
Promise.resolve().then(flush) → microtask queue 적재 및 대기
↓
사용자 정의 함수 종료
↓
microtask queue → pop(flush)
↓
Call Stack → add(flush)
↓
flush 호출 → Call stack pop(flush)

DOM update
```

각 흐름의 상세 내용은 다음과 같다.  
- #### drity mark  
  → 어떤 state가 변경되었는지 표시 (Dom 업데이트시 전체 DOM을 다시 계산하지 않기 위해)
- #### schedule_update()  
  → DOM update (flush) `예약` (flush 작업을 Microtask queue에 등록)  
- #### flush (배치)
  → dirty component 확인
  → component update 실행
  → DOM patch

최종적으로 flush가 Microtask의 Queue에 들어가게 된다.  
```
Microtask Queue
└ flush
```

Svelte scheduler 때문에 같은 tick에서는 Microtask queue에 2개의 flush가 추가될 수 없다.  
```js
let update_scheduled = false
function scheduled_update() {
  if (!update_scheduled) {
    update_scheduled = true
    Promise.resolve().then(flush)
  }
}
```

Svelte에서 tick을 사용할 경우 하나의 상태 변경 흐름을 두 개의 flush 사이클로 분리할 수 있다.

먼저 tick 이전의 상태 변경이 발생하면 Svelte scheduler에 의해 flush가
microtask queue에 예약된다.

이후 await tick()을 만나면 현재 실행 중인 함수(test)의 실행이 일시 중단되고,
Call Stack이 비워진 뒤 microtask queue에 있던 flush가 실행된다.

flush 실행 과정에서 DOM Patch가 수행되어 tick 이전 상태 변경이 실제 DOM에 반영된다.

flush가 완료되면 tick의 Promise가 resolve되고,
일시 중단되었던 함수(test)가 다시 실행된다.

그 후 tick 이후의 상태 변경이 발생하면 새로운 flush가 다시 microtask queue에
예약되고, 동일한 절차를 통해 한 번 더 DOM Patch가 수행된다.

이는 마치 두개의 상태변경 코드를 tick 기준으로 두개의 flush로 나누어 각각을 동기적으로 처리하는것처럼 처리할 수 있다.

```svelte
<script>
  import { tick } from 'svelte'

  let loading = false;
  let count = 0;
  async function test() {
    loading = true   // flushA 예약

    await tick()     // flushA 실행 대기

    count = 10       // flushB 예약
  }
  onMount(() => {
    test();
  })
</script>
```

```
Call Stack → add(onMount, test)
↓
loading = true
↓
microtask queue → add(flushA)
↓
await tick() → test 실행 일시 중지 (Promise pending)
↓
Call Stack → pop(test)
↓
microtask queue → pop(flushA)
↓
Call Stack → add(flushA)
↓
flush 호출 → Call stack pop(flushA)
↓
<DOM update>
↓
tick Promise resolve
↓
microtask queue → add(test resume)
↓
microtask queue → pop(test resume)
↓
Call Stack → add(test resume)
↓
count = 10
↓
microtask queue → add(flushB)
↓
Call Stack → pop(test resume)
↓
microtask queue → pop(flushB)
↓
Call Stack → add(flushB)
↓
flush 호출 → Call stack pop(flushB)
↓
<DOM update>
```

***React, Vue, Svelte 3개 모두 상태변경 Batch 처리는 중간 로직과 flush 전략의 차이가 있을 뿐 Microtask에 의한 핵심적 내용은 모두 동일하다. ***
</details>
<br>

</details>
<br>

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
