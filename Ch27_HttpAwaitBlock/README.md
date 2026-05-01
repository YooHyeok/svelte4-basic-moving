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
# *[Ch26) Router](../Ch26_Router/README.md)*
# Ch27) Ch27_HttpAwaitBlock
<details>
<summary>접기/펼치기</summary>
<br>

## REST API
웹 앱 개발시 필수적인 기능 중 하나가 서버와의 통신이다.  
데이터를 임의적으로 표현할 수 없기 때문에 데이터를 가져와 화면에 보여 줘야 한다.  
보통은 REST API라는 통신 방법을 사용해 서버와 통신한다.  
REST API는 웹 주소를 이용하여 서버와의 통신하는 방법 중 하나라고 보면 된다.  

웹 주소를 입력하는 방법으로 데이터를 등록, 조회, 수정, 제거 할 수 있다.  

REST API의 4가지 함수는 다음과 같다.  

| 함수 | 설명 | 주소입력방식 |
|------|------|-------------|
| POST | 데이터 등록 | /test |
| GET | 데이터 조회 | /test 또는 /test/1 |
| PUT | 데이터 수정 | /test/1 |
| DELETE | 데이터 삭제 | /test/1 |

위 4가지 함수 외에도 PATCH, HEAD와 같은 함수도 존재한다.  

## Axios
자바스크립트에서 서버와 통신하기 위해 XHR(XMLHttpRequest)이 사용되었으나, 사용법이 복잡하여 jQuery Ajax, Axios 같은 라이브러리가 등장했다.

이후 브라우저 표준으로 fetch API가 추가되면서 별도 라이브러리 없이도 간편한 통신이 가능해졌다.
별도 라이브러리 없이 fetch로 충분한 경우가 많지만 인터셉터, 자동 JSON 파싱, 요청 취소 등 편의 기능이 더 많은 axios가 여전히 많이 쓰이고 있다.  

### axios 설치 코드
```bash
npm install axios
```

### axios 함수 문법1
```js
axios.get(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.put(url[, config])
```
### axios 함수 문법2
```js
axios({
  method: '',
  url: '',
  data: {

  }
})
```
#### 예제) Axios와 each~else 블록
기존 fetch 함수로 적용된 로직대신 axios를 호출하여 데이터를 출력하는 예제이다.  
`each~else` 블록: 반복하려는 변수의 데이터가 0일 경우 else를 호출한다.

```svelte
<script>
  import axios from 'axios'
  import { onMount } from 'svelte';

  let comments = [];

  const search = async () => {
    try {
      /* const res = await fetch(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
      comments = await res.json(); */
      const res = await axios.get(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
      comments = await res.data
    } catch (error) {
      throw new Error(error);
    }
  }
  onMount(async () => {
    await search();
  });
  
</script>
<div>
  {#each comments as comment}
      <article>
          <h4>이름 : {comment.name}</h4>
          <h4>이메일 주소 : {comment.email}</h4>
      </article>
  {:else}
      <p>loading...</p>
  {/each}
</div>
```

## await 블록
Svelte는 마크업 영역에서 비동기를 처리할 수 있는 await 블록을 제공한다.

비동기의 대표적인 예가 이전에 적용한 fetch, axios 등을 활용한 서버 통신이다.

자바스크립트는 이러한 비동기 처리를 위해 Promise를 지원한다.

Promise는 "미래에 완료될 작업"을 나타내는 객체로, 서버에 요청을 보내면 즉시 결과를 반환하지 않고 Promise 객체를 반환한다.

이 Promise는 세 가지 상태를 가진다.

서버 응답을 기다리는 동안은 pending(대기), 응답이 정상적으로 도착하면 fulfilled(이행), 네트워크 오류 등으로 실패하면 rejected(거부) 상태가 된다.

fetch와 axios 모두 Promise 기반으로 동작하며, 서버로부터 데이터를 요청하면 인터넷 상태에 따라 대기시간이 발생한다.

await 블록은 이 Promise의 상태에 따라 각각 다른 UI를 렌더링할 수 있는 기능이다.

{#await}은 pending, {:then}은 fulfilled, {:catch}는 rejected 상태에 대응한다.

이전 예제에서는 each~else 구문을 사용하여 비동기 방식을 처리했지만 Svelte에서는 await 블록을 제공하기 때문에 else 구문을 사용할 이유는 없다.

### await 블록 문법
```svelte
<script>
  const search = async () => {
    try {
      const data = await new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve('완료된 데이터');
        }, 2000);
      });
      return data;
    } catch (error) {
      throw new Error(error);
    }
  }
  search();
</script>

{#await promise}
  <!-- pending: 서버 응답을 기다리는 동안 표시할 마크업 영역 -->
  <p>대기중...</p>
{:then value}
  <!-- fulfilled: 요청 성공 시 표시할 마크업 영역, value에 Promise 반환값이 담긴다 -->
  <p>2초 경과: {value}</p>
{:catch error}
  <!-- rejected: 요청 실패 시 표시할 마크업 영역, error에 에러 객체가 담긴다 -->
  <p>오류 발생...</p>
{/await}
```

#### 예제) Promise와 await 블록
`await` 블록: 반복하려는 변수의 데이터가 0일 경우 else를 호출한다.

```svelte
<script>
  import axios from 'axios'

  const search = async () => {
  try {
    /* const res = await fetch(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
    return await res.json(); */
    const res = await axios.get(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
    return res.data;
  } catch (error) {
    throw new Error(error);
  }
}

let promise = search();
  
</script>

<div>
  <h2>Axios Await Block</h2>
  {#await promise}
  <p>loading...</p>
  {:then value}
  {#each value as comment}
  <article>
    <h4>이름 : {comment.name}</h4>
    <h4>이메일 주소 : {comment.email}</h4>
  </article>
  {/each}
  {:catch error}
  <p>{error.message} : 에러가 발생되었습니다.</p>
  {/await}
</div>
```

</details>
<br>

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
