# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *Ch03) Reactivity*
<details>
<summary>접기/펼치기</summary>
<br>

## 목차
1. Reactivity01) state 삼항연산 조건부 렌더링
2. Reactivity02) 반응성 변수 $: 
2. Reactivity03) 반응성 블록 $: {} 
2. Reactivity04) 반응성 조건블록 $: if () {} 
## 01) `state 삼항연산 조건부 렌더링`
템플릿 표현식에 state값에 삼항연산을 활용하여 조건부 렌더링이 가능하다.  
아래는 한번도 클릭하지 않았을 경우 time을 버튼을 한번이라도 클릭했을 경우 times를 출력하는 예제이다.  
```svelte
<script>
  let count = 0

  const handleClick = () => count++
</script>
<div>
  <button on:click={handleClick}>클릭 수 : {count} {count <= 1 ? 'time' : 'times'}</button>
</div>
```

## 02) `반응성 변수 $:`
반응성(Reactivity)란 상태값이 변할 때 별다른 호출 없이 값이 함께 변하는 것을 말한다.  
다른 프레임워크 언어에서는 훨씬 복잡한 코드를 쓰지만 Svelte는 `$:`를 통해 `$: 반응성변수 = 상태변수` 형태로 간단하게 사용이 가능하다.  
`$:`와 함께 사용된 state 변수의 값이 변경되면 이를 감지하여 state를 변경하거나 로직을 실행시켜준다.  
구조적으로 완벽하게 동일하지는 않지만 Vue로 예를 들면 Computed + WatchEffect 이고 React로 예를들면 useMemo + useEffect와 유사하다.

computed나 useMemo처럼 직접적인 캐싱 기능을 가지고 있진 않지만, 값이 변하지 않는다면 재실행 되지 않으므로 재계산이 최소화 되는 캐싱과 유사한 효과를 얻을 수 있다.  

앞서 3항연산자를 템플릿 표현식에 직접 할당했던 문장을 반응성으로 구현할 수 있다.  
```svelte
<script>
  let count = 0

  $: label = count <= 1 ? 'time' : 'times'

  const handleClick = () => count++
</script>
<div>
  <button on:click={handleClick}>클릭 수 : {count} {label}</button>
</div>
```

아래 예제는 count값이 변결될 때 마다 2를 곱하여 doubled라는 반응성 변수에 재할당하고, count값이 변경될 때 마다 제곱을 하여 squred 변수에 재할당 한다.  
```svelte
<script>
  let count = 0

  // 반응성 변수 선언
  $: doubled = count * 2;
  $: square = count * count;
  $: label = count <= 1 ? 'time' : 'times'

  const handleClick = () => count++
</script>
<div>
  <h1>Reactivity02) $ 반응성 변수</h1>
  <button on:click={handleClick}>클릭 수 : {count} {label}</button>
  <h3>두배 구하기</h3>
  <p>{count} x 2 = {doubled}</p>
  <h3>제곱 구하기</h3>
  <p>{count} x {count} = {square}</p>
</div>
```

## 03) `반응성 블록 $: {}` 
반응성 코드를 그룹화 할 수 도 있다.  
`$: {}` 형태로 작성하며 중괄호 내에 반응성을 동작시킬 로직들을 작성한다.  
여러개의 state를 포함할 수 있으며 각각의 state가 변할때마다 해당 블록이 실행된다.  
```svelte
<script>
  let count = 0

  // 반응성 변수 선언
  $: doubled = count * 2;
  $: square = count * count;
  $: label = count <= 1 ? 'time' : 'times'

  // 반응성 그룹화
  $: {
    console.log('기본값 : ' + count)
    console.log('두배값 : ' + doubled)
    console.log('제곱값 : ' + square)
    console.log('레이블 : ' + label)
  }

  const handleClick = () => count++
</script>
<div>
  <h1>Reactivity03) $ 반응성 블록</h1>
  <button on:click={handleClick}>클릭 수 : {count} {label}</button>
  <h3>두배 구하기</h3>
  <p>{count} x 2 = {doubled}</p>
  <h3>제곱 구하기</h3>
  <p>{count} x {count} = {square}</p>
</div>
```

## 04) `반응성 조건블록 $: if() {}` 
반응성 코드에 조건을 
`$: if() {}` 형태로 작성하여 조건절로 사용할 수 있다.  
조건이 참이 될 경우 조건 블록 내 로직이 실행된다.  
아래는 물품 수량이 최소1개 최대 9개까지만 구매가 가능한 프로그램 예제이다.
```svelte
<script>
  let count = 0

  // 반응성 조건블록
  $: if (count >= 10) {
    alert('10개 이상 구매할 수 없습니다.')
    count = 9
  }
  $: if (count < 0) {
    alert('최소 구매개수는 1개입니다.')
    count = 1;
  }

  const onPlus = () => count ++;
  const onMinus = () => count --;

</script>
<div>
  <h1>Reactivity03) $ 반응성 조건블록</h1>
  <button on:click={onMinus}>-</button>
  <input type="text" value={count} style="width:25px;">
  <button on:click={onPlus}>+</button>
</div>
```

</details>
<br>

# *[Ch04) Event](../Ch04_Event/README.md)*
# *[Ch05) Props](../Ch05_Props/README.md)*
# *[Ch06) IfBlock](/Ch06_IfBlock/README.md)*
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
