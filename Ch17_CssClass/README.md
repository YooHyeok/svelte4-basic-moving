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
# *Ch17) Css, Class 조건부 bind*
<details>
<summary>접기/펼치기</summary>
<br>

1. Svelte css 기본 사용법
2. class directive 
  - 기본 문법
  - 체크 박스
  - 라디오

## Svelte CSS 기본

기본적으로 컴포넌트 내 `<style></style>` 태그 선언이 가능하며, 해당 태그 내에서 css를 적용할 경우 적용 scope는 해당 컴포넌트만 적용된다.  

style sheet의 기본적인 문법과 같이 태그 선택자 혹은 class 선택자를 사용한다.  

```svelte
<script>
  /* 인라인 스타일 시트 (동적으로 변경되는 값에 사용) */
  let color01 = 'pink';
</script>
<div>
  <h3>제목태그1</h3>
  <h4 class="title02">제목태그2</h4>
  <h5 style="color: {color01}">{color01}</h5> <!-- 인라인 스타일 -->
</div>
<style>
  /* 내부 스타일 시트 */
  h3 {
    background-color: black;
    color: pink;
  }
  .title02 {
    background-color: black;
    color: yellow;
  }
</style>
```
### 인라인 스타일 시트
일반적인 마크업 문법과 동일하며 태그에 직점 style 속성과 css를 부여하는 방식이다.  
```svelte
<div>
  <h4 style="color: pink">{pink}</h5> <!-- 인라인 스타일 -->
</div>
```
#### 동적 인라인 스타일 시트
css의 값을 동적으로 변경할때에는 css의 값을 변수로 선언하고, 해당 변수에 값을 부여하는 방식으로 동적으로 변경이 가능하다.
```svelte
<script>
  let color = 'pink';
</script>
<div>
  <button on:click={() => color = 'pink'}> 분홍색</button>
  <button on:click={() => color = 'red'}> 빨간색</button>
  <h4 style="color: {color}">{color}</h5> <!-- 동적 인라인 스타일 (동적으로 변경되는 값에 사용) -->
</div>
```

## class directive
컴포넌트 상태값에 따라 특정 css를 조건부로 추가/제거 하는 svelte 전용 문법이다.  
조건식이 true이면 해당 클래스가 적용되고 false이면 제거된다.  

### 기본 문법
`class:클래스선택자={boolean(변수|조건식)}` 형태로 사용한다.  
클래스 선택자는 .css파일 혹은 `<style></style>` 태그 내에 선언된 클래스를 적용한다.  
실제 directive에 할당되는 값은 `<script></script>` 태그 내에 작성된 변수 혹은 변수를 기준으로 참/거짓 결과값을 도출할 수 있는 변수 혹은 조건식을 할당한다.  

아래 예제는 버튼을 클릭했을 경우 active와 disabled 클래스 선잭자가 적용/해제 된다.
```svelte
<script>
  let isActive = true; // 할당할 변수
  let value = 0; // 할당할 조건식에 사용될 변수
</script>
<p 
  class:active={isActive}
  class:disabled={value == 1}
>
  클래스 디렉티브
</p>
<button on:click={() => isActive = !isActive; value = value == 0 ? 1 : 0}>적용/해제</button>
<style>
  .active {
    background-color: black;
    color: white;
  }

  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
</style>
```

#### 축약형
만약 조건식 대신 변수를할당할 때 클래스선택자와 변수명이 같다면 `class:지시자(변수명)` 으로 축약이 가능하다.
```svelte
<script>
  let active = true; // 할당할 변수
</script>
<p class:active>클래스 디렉티브</p> <!-- 변수명과 클래스 지시자 이름이 같으므로 축약형 적용 -->
<button on:click={() => active = !active;}>적용/해제</button>
<style>
  .active {
    background-color: black;
    color: white;
  }
</style>
```

### 예제) 3개 버튼 active class 적용/해제
```svelte
<script>
  let current = 'first';
</script>

<div>
  <h1>2)class directive - 기본 문법</h1>
  <button class:active={current === 'first'} on:click={() => current = "first"}>첫번째 버튼</button>
  <button class:active={current === 'second'} on:click={() => current = "second"}>두번째 버튼</button>
  <button class:active={current === 'third'} on:click={() => current = "third"}>세번째 버튼</button>
  <p>{current}</p>
</div>

<style>
  button{
    border: none; border-radius: 5px; background-color: #ededed; 
    padding: 5px 20px; cursor: pointer;
  }
  button::after{ content: ' - 비활성'; }
  .active{ background-color: cornflowerblue; color: white; }
  .active::after{ content: ' - 활성'; }
</style>
```

## input 체크박스/라디오 활용
class directive에 적용하는 조건식에서 활용되는 변수는 동적으로 값을 변경함으로써 적용되는 원리이다.  
button 뿐만 아니라 체크박스, 라디오 등을 조작하는 value에 해당 변수를 bind하여 제어할수도 있다.  


### 예제) 체크박스
```svelte
<script>
  let border  = false; /* checked bind 용도 & 축약형으로 할당할 변수 */
</script>

<div>
  <h3>테두리 선택</h3>
  <label>
      <input type="checkbox" bind:checked={border}> 실선
  </label>
  <hr />
  <button class:border>버튼</button>
</div>

<style>
  button{
    border: none; border-radius: 5px; background-color: #ededed; 
    padding: 5px 20px; cursor: pointer;
  }
  .border{ border: 3px solid green; } /* border를 변수로 처리 */
</style>
```

### 예제) 라디오
```svelte
<script>
    let borderSolid, borderDashed, borderDouble;

    let borders = ['실선', '점선', '두줄']
    let choice = 0;
</script>
<div>
  <h3>테두리 선택</h3>
  {#each borders as border, i}
    <label>
      <input type="radio" bind:group={choice} value={i}>
      {border}
    </label>
  {/each}
</div>
<hr>
{#if choice == 0}
  <button class:borderSolid={true}>버튼</button>
{:else if choice == 1}
  <button class:borderDashed={true}>버튼</button>
{:else}
  <button class:borderDouble={true}>버튼</button>
{/if}
<style>
  button{
    border: none; border-radius: 5px; background-color: #ededed; 
    padding: 5px 20px; cursor: pointer;
  }
  .borderSolid{ border: 3px solid green; }
  .borderDashed{ border: 3px dashed green; }
  .borderDouble{ border: 3px double green; }
</style>
```

</details>
<br>

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
