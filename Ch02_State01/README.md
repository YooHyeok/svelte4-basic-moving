# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *Ch02) State 01 - 기본 및 @html*
<details>
<summary>접기/펼치기</summary>
<br>

svelte의 state 상태변수 문법에 대해 정리한다.  

## 0) `State란?`
상태 라는 뜻을 가지고 있으며, Vue나 React 등과 같은 SPA 기반 혹은 반응형 컴포넌트 기반 프론트엔드 프레임워크 혹은 라이브러리에서의 컴포넌트의 상태를 의미한다.  
실제 상태라는 의미 보다는 컴포넌트 내에서 UI를 동적으로 변경하기 위해 사용하는 데이터 이다.  

상태변수 기본 선언법과, 템플릿 보간, 태그 속성 할당, @html 문자열 태그 주입 등 기본 활용법은 다음과 같다.
<br>

## 1) `state 상태변수 기본 문법`

React에서는 useState() 라는 함수를 통해 상태값을 관리하지만 Svelte에서 상태변수는 일반 Javascript의 문법과 유사하게 let과 const 키워드로 변수를 선언하는 단순한 방식으로 선언한다.  
let은 상태 변수 변경이 가능하고 const의 경우 상수처럼 사용하여 store 등의 한다.
- 예제
  ```svelte
  <script>
    let letVar = "변경 가능한 상태변수"
    const constVar = "변경 불가능"
  </script>
  ```
<br>

## 2) `템플릿 표현식`
script 영역에 선언한 상태값을 템플릿 영역의 특정 태그 텍스트노드 위치에 할당하여 렌더링하기위한 문법이다.  
Vue의 경우 텍스트 보간법(mustache) 이라 부르며 `{{변수명}}` 형태로 이중 중괄호 내에 으로 사용한다.  
React에서는 JSX 문법이라 부르며 `{변수명}` 형태로 사용하며, Svelte에서도 동일하게 단일 중괄호 내에 사용하며 React, Vue와는 다르게 공식 명칭은 정해지지 않아 템플릿 표현식 이라고 부른다.  
- 예제
  ```svelte
  <script>
    let letVar = "변경 가능한 상태변수"
    const constVar = "변경 불가능"
  </script>
  <h3>state letVar: {letVar}</h3>
  <h3>state constVar: {constVar}</h3>
  ```

Svelte에서는 변수 함수 호출 연산 모두 가능하다.
```svelte
<script>
  let count = 0
  const getName = () => {
    return "유혁스쿨"
  }
</script>
<p>{count}</p>
<p>{count+1}</p>
<p>{getName()}</p>
```
<br>

## 3) `태그속성할당 문법`
변수를 html태그의 속성에 할당하여 값을 주입하는 문법이다.  
속성에 변수에 할당한 값 즉, 변수 자체를 할당하기 위해서는 주입하려는 속성명에 `속성명={변수명}`과 같은 형태로 중괄호를 먼저 선언하고 그 안에 변수를 주입하는 형태로 사용한다.  
만약 속성명과 변수명이 일치하다면 축약형태인 `{src}` 만으로 선언이 가능하다.  
- 예제
  ```svelte
  <script>
    let src, url;
    src = url = 'https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdna%2FbGz29o%2FbtrNgcGtBfI%2FAAAAAAAAAAAAAAAAAAAAABGdvIkC1kO3Hr8H34r_UkuFQIQxMSLZuVebJmldoTsv%2Fimg.png%3Fcredential%3DyqXZFxpELC7KVnFOS48ylbz2pIh7yKj8%26expires%3D1772290799%26allow_ip%3D%26allow_referer%3D%26signature%3DO3%252FZctc7vvjsThug4UHROrtpCMw%253D'
  </script>
  <div>
    <h1>State02) 태그속성할당 문법</h1>
    <img src={url} alt=""> <!-- 태그속성 문법1) 변수명과 속성명이 다른 경우 -->
    <img {src} alt=""> <!-- 태그속성 문법2) 변수명과 속성명이 같은 경우 -->
  </div>
  ```

## 4) @html 문자열 태그 주입 문법
문자열로 된 html 태그를 특정 태그 하위로 삽입하려고 하면 svelte에서는 dom 객체로 변환되지 않고 단순 문자열로 인식하여 순수 문자열로 출력된다.  
이때 사용하는 문법이 @html이며 vue의 v-html과 유사하게 html 태그가 문자열내에 있다면 해당 태그는 dom으로 인식하여 렌더링한다.  
사용법은 삽입하려는 부모 대상 태그에 템플릿 보간 문법인 `{중괄호}`를 선언하고, 중괄안에 @html과 문자열로 작성된 태그 값 혹은 변수를 `{@html 변수명}` 형태로 작성한다
- 예제
  ```svelte
  <script>
    let str = '문자열 태그 인식 문법 {@html}을 위한 <strong>Html strong 태그</strong> 입니다.'
  </script>
  <div>
    <h1>State03) @html 문법</h1>
    <p>{@html str}</p>
  </div>
  ```
</details>
<br>

# *[Ch02) State02](../Ch02_State02/README.md)*
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
