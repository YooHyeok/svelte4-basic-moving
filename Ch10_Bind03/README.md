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
# *[Ch09) Bind02 - select (multiple), textarea, media](../Ch09_Bind02/README.md)*
# *Ch10) Bind03 - this, component, dimension*
<details>
<summary>접기/펼치기</summary>
<br>

## this(dom), component(props), dimension(공간)

### this 바인딩
svelte에서 지원하는 dom 접근 방식으로 `bind:this`형태로 this 키워드를 bind 디렉티브에 할당한다.  
`<태그명 bind:this={상태변수} />` 형태로 접근하려는 태그에 작성하여 해당 태그의 dom 객체에 접근한다.  
할당한 변수에는 dom 객체가 할당된다.  

```svelte
<script>
  let bindThis = '';
</script>
<input bind:this={bindThis} />
```

<br>

#### 예제01) input 패스워드 유효성 검사 (input focus)
입력란에 패스워드 입력 후 버튼을 클릭했을 때 패스워드가 1234이면 입력란이 초록색으로, 1234가 아니면 빨간색으로 표시하며 포커싱이 적용된다.
```svelte
<script>
  let text = ''; // input value
  let clicked = false; // 클릭여부
  let validated = false; // 비밀번호 일치 여부
  let inputRef;

  const onValidatedCheck = () => {
    clicked = true;
    validated = text === '1234'
    if(!validated) {
      inputRef.focus();
    }
  }
</script>
<div>
  <form>
    <input 
      type="text" 
      bind:this={inputRef}
      bind:value={text} 
      class={clicked && (validated ? 'success' : 'failure')}
    >
    <button type="submit" on:click|preventDefault={onValidatedCheck}>검증하기</button>
  </form>
</div>
<style>
  .success{ background-color: lightgreen; }
  .failure{ background-color: lightcoral; }
</style>
```
### component 바인딩
Dom 속성을 바인딩하는 것처럼 컴포넌트의 props를 바인딩할 수 있다.  
props는 부모 컴포넌트에서 자식 컴포넌트로 전달하는 값이다.  
단방향 데이터로 자식 컴포넌트의 상태 값을 부모 컴포넌트에게 전달하지는 못한다.  
이때, bind 디렉티브를 사용하여 부모컴포넌트의 상태 변수와 자식 컴포넌트의 상태 변수가 연결되어 자식에서 부모의 상태값을 변경할 수 있다.  
VueJS 2의 `:prop.sync` 혹은 3의 `defineEmits(['update:prop']) / emit('update:count', 값)` 과 유사한 기능이다.

문법은 props 전달 문법앞에 `bind:`를 붙혀준다.
- props 전달
`<자식컴포넌트 props명={상태변수} />`
- component 바인딩
`<자식컴포넌트 bind:props명={상태변수} />`

#### 예제) 
- 부모 컴포넌트
  ```svelte
  <script>
    import Child from './child.svelte'
    let props = ''
  </script>
  <Child bind:props={props}/>
  ```
- 자식 컴트넌트
  ```svelte
  <script>
      export let props;
      const double = () => props *= 2;
  </script>

  <p>자손 값 : {props}</p>
  <button on:click={double}>두배구하기</button>
  ```

### Dimension(공간) 바인딩

cientWidth, cientHeight, offsetWidth, offsetHeight 속성들이 Dimension 바인딩에서 읽기 전용으로 바인딩 가능한 속성들로 읽기 전용이기 때문에 값을 변경해도 width와 height가 변경되지 않는다.  
(client는 테투리를 포함하지 않고 offset은 테두리를 포함한다.)  

위 속성들은 DOM 요소의 실제 크기를 측정하기 위한 브라우저 API이다.  
일반적으로 vue에서는 해당 dom에 ref를 심어 dom 객체로부터 clientWidth 등의 속성에 접근해야 하지만 svelte에서는 bind 문법을 통해 바로 상태를 할당하여 값을 읽을 수 있다.  

block과 inline-block이 아닌 inline 요소에는 영역이 존재하지 않기 때문에 바인딩이 불가능하므로 block 레벨 요소로 감싼 후 block 레벨 요소에 바인딩해야 한다.  

`<태그 bind:clientWitdth={상태변수}>`

#### 예제) 
A라는 div 태그 하위에 p나 span태그로 텍스트를 넣어두고, 해당 태그를 block 요소에서 input-block으로 바꿔 하위 요소만큼 영역이 잡히도록 한다.  
input 태그의 range를 통해 상태값을 변경하도록 조정하는데, 해당 상태값을 텍스트노드를 감싸고 있는 태그의 style 속성에 에 할당하여 텍스트의 크기를 키운다.  
텍스트의 크기가 커지면 텍스트 노드를 감싸고 있는 태그도 커지며, 해당 태그를 감싸고 있는 A div 태그의 크기도 커지는데 이때 dimension bind를 활용하면 해당 div의 너비와 높이를 읽어들일 수 있다.  

![alt text](dimension.gif)

```svelte
<script>
  let w; // div 태그의 폭
  let h; // div 태그의 높이
  let size = 20; // 글자 크기
</script>

<p>슬라이드바로 글자 크기를 변경해보세요.</p>
<input type="range" min="10" max="100" bind:value={size} />
<p>글자 크기 : {size}px</p>
<div bind:clientWidth={w} bind:clientHeight={h}>
    <span style="font-size: {size}px;">글자</span>
</div>
<ul>
    <li>가로 폭 : {w}</li>
    <li>세로 높이 : {h}</li>
</ul>

<style>
    div{ display: inline-block; border: 3px solid black; }
</style>
```

</details>
<br>

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
