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
# *Ch09) Bind02 - select, textarea, media*
<details>
<summary>접기/펼치기</summary>
<br>

## select, textarea, media

### select, textarea 바인딩
#### bind:value
select와 textarea에도 값을 할당활때 value속성에 할당한다.
<br>

#### 예제01) select 기본
select의 경우 option에 부여된 value값이 select의 value에 할당한 변수에 값이 초기화된다.  
```svelte
<script>
  let portals = [
    { name: '사이트선택', url: null },
    /* 생략... */
  ];
  let selected;
  const selectChange = (event) => {
    console.log(selected === event.target.value)
    if (selected != null) {
      window.open(selected)
    }
  }
</script>
<div>
  <select bind:value={selected} on:change={selectChange}>
    {#each portals as portal}
      <option value={portal.url}>{portal.name}</option>
    {/each}
  </select>
</div>
```
#### 예제02) select multiple
select의 multiple은 여러개의 값을 ctrl로 선택하므로 선택된 복수개의 데이터를 bind:value 속성에 할당된 변수에 배열로 받게된다.
```svelte
<script>
  let foods = ['떡볶이','순대','오뎅','튀김'];
  let selected = []; // select의 multiple을 통한 복수 데이터 관리
  const selectChange = (event) => {
    console.log(event.target.value)
    if (selected != null) {
      window.open(selected)
    }
  }
</script>
<div>
  <select multiple bind:value={selected} on:change={selectChange}>
    {#each foods as food}
      <option value={food}>{food}</option>
    {/each}
  </select>
  #{#if selected.length = 0}
     <p>주문하실 메뉴를 선택해 주세요.</p>
  {:else}
     <p>선택메뉴: {selected}</p>
  {/if}
</div>

```
#### 예제03) textarea
textarea는 기본적으로 텍스트 노드 혹은 value 속성에 내용을 할당할 수 있다.  
svelte에서는 bind:value를 활용하여 값을 할당한다.
```svelte
<script>
  let text = '내용을 입력하세요.'
</script>
<div>
  <textarea value="value속성으로 텍스트 할당" rows="5" /><>
  <textarea rows="5">텍스트노드로 텍스트 할당</textarea>
  <textarea bind:value={text} rows="5"/>
  <p>{text}</p>
</div>
```

### media 바인딩
media에는 video태그와 audio태그 등이 있다.

#### media bind 속성 종류
- 읽기전용 속성
  |     속성      |          설명                                                 |
  |--------------|--------------------------------------------------------------|
  |  duration    | 총 재생 길이(초단위)                                            |
  |  buffered    | {start, end} 객체들의 배열, 버퍼 된 위치                         |
  |  seekable    | {start, end} 객체들의 배열, 위치를 찾을 수 있는 범위               |
  |  played      | {start, end} 객체들의 배열, 재생했던 위치                        |
  |  seeking     | 찾는중 여부 (true/false)                                       |
  |  ended       | 재생 종료 여부 (true/false)                                    |
  |  videoWidth  | video태그의 너비 (video만 사용 가능, audio는 사용 불가능)         |
  |  videoHeight | video태그의 높이 (video만 사용 가능, audio는 사용 불가능)         |

- 읽기/쓰기 속성
  |     속성      |          설명                                                 |
  |--------------|--------------------------------------------------------------|
  | currentTime  | 현재 재생 위치 (초단위)                                         |
  | playbackRate | 재생 속도 (normal: 1)                                          |
  | paused       | 일시정지 여부 (true/false)                                      |
  | volume       | 음량 크기 (0 ~ 1 사이 값)                                       |


#### 예제04) video 재생/정지/초기화 기능 및 총 재생시간, 현재 재생위치
duration, currentTime, paused 속성에 대한 bind를 적용하며, 재생/정지/초기화 기능을 구현한다.
```svelte
<script>
  let duration; // 총 재생시간
  let currentTime = 0; // 현재 재생 시간
  let paused = true; // 영상 재생 상태 (재생:false/정지:true)
  const onPlay = () => paused = false;
  const onPause = () => paused = true;
  const onInitial = () => {
    paused = true;
    currentTime = 0;
  }
</script>
<div>
  <p>From <a href="https://studio.blender.org/films">Blender Studio</a>. CC-BY</p>
  <video
    poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
    src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
    width="500"
    bind:duration={duration}
    bind:currentTime={currentTime}
    bind:paused={paused}
  >
    <track kind="captions" />
  </video>
  <br />
  <button on:click={onPlay}>재생</button>
  <button on:click={onPause}>정지</button>
  <button on:click={onInitial}>초기화</button>
  <p>총 재생시간 : { Number(duration).toFixed(0) }초</p>
  <p>현재 재생위치 : {currentTime}초</p>
</div>
```

</details>
<br>

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
