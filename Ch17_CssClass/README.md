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

# *[Ch18) rollup-sass](/Ch18_rollup-sass/README.md)*