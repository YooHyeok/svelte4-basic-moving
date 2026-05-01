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
# *Ch07) 마크업 반복문 Each Block*
<details>
<summary>접기/펼치기</summary>
<br>

1. 기본 문법
2. index(순번)
3. 객체 배열과 구조분해 할당
4. key(고유값)

## Each Block
script 영역 뿐만 아니라 마크업 영역에서도 반복작업이 필요하다.  
예를들어 쇼핑몰의 경우 상품목록이 매우 많다.  
상품 목록을 일일이 하드코딩으로 나열하지 않고 반복문을 통해 한 작업만 처리하고 나머지는 반복하여 출력한다.  

### 01) 기본 문법
`{#each} ~ {/each}` 형태로 구성되어 있으며, 중괄호 내 #each 우측으로 배열로 구성된 데이터를 선언하고, as키워드와 함께 해당 배열을 순회며 반복적으로 값을 할당받을 임의의 변수를 선언한다.  
```svelte
{#each datas as data}
  {data}
{/each}
```

#### 예제) select option 반복
```svelte
<script>
  let weekDays = ['일', '월', '화', '수', '목', '금', '토'] 
</script>
<div>
  <select>
    {#each weekDays as weekday}
    <option>{weekday}요일</option>
    {/each}
  </select>
</div>
```

### 02) index(인덱스)
순회할 배열의 인덱스 순번을 부여하여 관리한다.  
아래와 같이 기본 문법의 배열 순회 데이터를 할당할 변수에 쉼표(콤마)로 구분한 뒤 변수를 선언하면 해당 변수를 인덱스로 받아 사용할 수 있다.  
```svelte
{#each datas as data, index}
{/each}
```

#### 예제) 2023 KBO 정규리그 순위 예제
```svelte
<script>
  let teams = ['LG 트윈스','KT 위즈','SSG 랜더스','NC 다이노스','두산 베어스','KIA 타이거즈','롯데 자이언츠','삼성 라이온즈','한화 이글스','키움 히어로즈'];
</script>
<div>
  <h3>2023 KBO 정규리그순위</h3>
  {#each teams as team, i}
  <p>{i + 1}위 : {team}</p>
  {/each}
</div>
```
당연히 인덱스 접근으로도 가능하다.  
```svelte
<div>
  {#each teams as team, i}
  <p>{i + 1}위 : {teams[i]}</p>
  {/each}
</div>
```

### 03) 객체 배열 반복처리
```svelte
<script>
  let langs = [{ id: 1, name: '스벨트(Svelte)', release: 2016, src: '~', }, ];
</script>
<div>
  {#each langs as lang}
    <div style="bolder: 2px solid black; width: 200px; padding: 10px;">
      <h4>이름 : {lang.name}</h4>
      <h4>배포년도 : {lang.release}</h4>
      <img src={lang.src} alt={lang.name} height="50">
    </div>
  {/each}
</div>
```
#### 객체 구조분해 할당
배열 내 객체를 구조분해 할당도 가능하다.  
as 키워드 우측으로 중괄호 내에 객체의 속성들을 나열한다.  
```svelte
<script>
  let langs = [{ id: 1, name: '스벨트(Svelte)', release: 2016, src: '~', }, ];
</script>
<div>
  {#each langs as {id, name, release, src}} <!-- 객체 속성 나열 -->
    <div style="bolder: 2px solid black; width: 200px; padding: 10px;">
      <h4>이름 : {name}</h4>
      <h4>배포년도 : {release}</h4>
      <img src={src} alt={name} height="50">
    </div>
  {/each}
</div>
```

### 04) key(고유값)
each 블록에 key를 사용하는 것은 데이터 목록이 변경(삭제/추가) 될 때 DOM 노드를 효율적으로 재사용 혹은 업데이트하여 성능을 최적화 하고 오류를 방지하기 위해 필요하다.  
이 경우 index를 사용할 수도 있으나, index를 사용할 경우 시점문제로 고유값이 중복처리 되는 등 렌더링 버그가 발생할 수 있다.  
#### index key 지정 예
```svelte
<script>
  let datas = [{id: 1}]
</script>
{#each datas as data, idx (idx)}
{/each}
```
실제로, React나 Vue에서도 index를 key로 사용할 경우 컴포넌트의 깊이가 매우 깊을 때 변경되는 시점의 차이로 인해 key가 꼬여 렌더링에 버그가 발생하는 경우가 발생한다.  

```svelte
<script>
  let datas = [{id: 1}]
</script>
{#each datas as data, idx (data.id)}
{/each}
```

key를 지정할 때 index를 생략할 수는 있지만 선언부 위치를 바꿀 수는 없다
```svelte
<script>
  let datas = [{id: 1}]
</script>
{#each datas as data (data.id)}
{/each}
```

### 05) each~else
each블록 내에 else블록을 사용할 수 있다.  
each 블록에 선언한 배열의 길이가 0이거나 undefined 혹은 null 과 같이 값이 falsy일 경우 else블록이 실행된다.  
```svelte
<script>
  let datas = []
</script>
{#each datas as data, idx (data.id)}
{:else}
  <p>falsy</p>
{/each}
```

</details>
<br>

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
