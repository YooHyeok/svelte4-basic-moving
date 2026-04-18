# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *[Ch04) Event](../Ch04_Event/README.md)*
# *[Ch05) Props](../Ch05_Props/README.md)*
# *Ch06) 마크업 조건문 If Block*
<details>
<summary>접기/펼치기</summary>
<br>

## If Block
컴퓨터 프로그램을 이루는 구문 중 대표적인 구문으로 조건문과 반복문이 있다.  
Svelte는 조건문과 반복문을 마크업 영역에서 사용할 수 있는 기능을 제공한다.  
If Block이라 부르며 조건에 따라 마크업 영역을 다르게 표시할 수 있다.  
`{#if} ~ {/if}` 형태로 사용하며 if문의 시작과 종료를 명확히 해야한다.  
```svelte
{#if}
  <!-- 조건이 true(참)일 경우 마크업 표시 -->
{/if}
```

### 예제) 로그인/로그아웃 버튼 전환
```svelte
<script>
  let user = { loggedState: false }
  const onToggle = () => user.loggedState = !user.loggedState
</script>
<div>
  {#if user.loggedState}
    <button on:click={onToggle}>로그아웃</button>
    <p>현재 로그인 상태입니다.</p>
  {/if}
  {#if !user.loggedState}
    <button on:click={onToggle}>로그인</button>
    <p>현재 로그아웃 상태입니다.</p>
  {/if}
</div>
```

## If~Else Block
if block 로직만 사용하면 true인 경우만 마크업 처리를 해야하므로, if와 반대되는 block을 한번 더 정의해야한다.  
대부분의 프로그래밍 언어가 if 조건식에서 else 구문을 제공해주는것 처럼 svelte의 If Block에서도 else를 지원해준다.  
`{:else}` 형태로 중괄호 내에 :콜론뒤에 else 키워드를 선언하여 사용한다.
```svelte
{#if}
  <!-- 조건이 true(참)일 경우 마크업 표시 -->
{:else}
  <!-- 조건이 false(거짓)일 경우 마크업 표시 -->
{/if}
```

### 예제) 로그인/로그아웃 버튼 전환
```svelte
<script>
  let user = { loggedState: false }
  const onToggle = () => user.loggedState = !user.loggedState
</script>
<div>
  {#if user.loggedState}
    <button on:click={onToggle}>로그아웃</button>
    <p>현재 로그인 상태입니다.</p>
  {:else}
    <button on:click={onToggle}>로그인</button>
    <p>현재 로그아웃 상태입니다.</p>
  {/if}
</div>
```

## If~ElseIf~Else 구문
3개 이상의 많은 결과로 표현할 수 있는 Else If Block도 지원한다.  
else 구문과 같이 `{:else if}` 형태로 중괄호 내에 :콜론뒤에 else if 키워드를 선언하여 사용한다.
```svelte
{#if}
  <!-- 조건1이 true(참)일 경우 마크업 표시 -->
{:else if}
  <!-- 조건2가 true(참)일 경우 마크업 표시 -->
{:else}
  <!-- 조건1 조건2 모두 false(거짓)일 경우 마크업 표시 -->
{/if}
```
### 예제) 양수/음수/0/그외 판별 예제
```svelte
<script>
  let x = null
  const numChange = (event) => {
    x = event.target.value
  }
</script>
<div>
  <label for="testBox">양수/음수 테스트</label>
  <input
    type="text" 
    id="textBox" 
    placeholder="정수를 입력하세요."
    on:keyup={numChange} 
  >
  {#if x > 0}
    <p>작성한 숫자는 양수입니다.</p>
  {:else if x < 0}
    <p>작성한 숫자는 음수입니다.</p>
  {:else if x == 0}
    <p>작성한 숫자는 0입니다.</p>
  {:else}
    <p>정수로 다시 입력하세요.</p>
  {/if}
</div>
```

</details>
<br>

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
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*