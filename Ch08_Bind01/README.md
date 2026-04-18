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
# *Ch08) Bind01 양방향 데이터 연결 - Input*
<details>
<summary>접기/펼치기</summary>
<br>

## input 바인딩
- bind:value
  - type: text
- bind:checked
  - type: checkbox
- bind:group
  - type: radio, checkbox
<br>

## bind:value

### 01) bind 기본 문법
`<태그 bind:속성={변수명}>` 형태로 value속성 앞에 bind키워드를 콜론으로 연결하고, value속성에 중괄호와 함께 할당할 변수명을 작성한다.  
```svelte
<script>
  let bindValue = '';
</script>
<input type=text bind:value={bindValue}>
```

### 예제) bind:value
```svelte
<script>
  let name = ''
</script>
<div>
  <input 
    type=text
    placeholder="이름을 입력하세요."
    bind:value={name}
  >
  <p>안녕! {name || '낯선사람'}!</p>
</div>
```
```svelte
<script>
  let a = 1
  let b = 2
</script>
<div>
  <label>
    <input type=number bind:value={a} min=0 max=10>
    <input type=range bind:value={a} min=0 max=10>
  </label>
  <label>
    <input type=number bind:value={b} min=0 max=10>
    <input type=range bind:value={b} min=0 max=10>
  </label>
  <p>{a} + {b} = {a+b}</p>
</div>
```
<br>

## bind:checked
checkbox를 여러개가 아닌 단 1개만 사용하는 경우가 있다.  
한개의 checkbox를 제어하는 경우 단순히 체크가 되었는지 여부만 논리타입으로 체크하면 된다.  
이 경우 value가 아닌 checked 속성에 bind 키워드를 붙히고 변수를 할당한다.  
할당한 변수에는 논리 타입인 true 혹은 false 값이 할당된다.  
### 예제) bind:checked
```svelte
<script>
  let chk = false
</script>
<div>
  <h1>03) checkbox - bind:checked</h1>
  <label>
    <input type=checkbox bind:checked={chk} > 약관 동의
  </label>
  <button disabled={!chk}>구독</button>
  {#if chk}
    <p>당신은 약관에 동의했습니다. <br>이제 구독이 가능합니다.</p>
  {:else}
    <p>당신은 약관에 동의하지 않았습니다. <br>아직 구독이 불가능합니다.</p>
  {/if}
</div>
```
<br>

## bind:group
checkbox와 radio처럼 여러개의 데이터를 선택할 때 사용한다.  
### 예제) bind:group - checkbox
checkbox에서의 bind:group에 할당한 변수에는 선택된 값들이 배열로 관리된다.
- value에 배열 index 할당
  index를 할당하였으므로, 최종 선택값을 찾을때는 선택된 값이 할당되는 group 변수에는 index로 구성되며 해당 배열을 map함수로 원본 배열의 index로 접근하여 선택한 요소를 매핑한다.  
  ```svelte
  <script>
    let choiceSize1 = [0]
    let sizes1 = ['Tall', 'Grande', 'Venti']
  </script>
  <div>
    {#each sizes1 as size, index}
    <label>
      <input type=checkbox bind:group={choiceSize1} value={index}> {size}
    </label>
    {/each}
    <p>고객님은 {choiceSize1.map(el => sizes1[el])}를 선택하셨습니다.</p>
  </div>
  ```
- value에 배열 요소 할당
  ```svelte
  <script>
    let choiceSize2 = ['Tall']
    let sizes2 = ['Tall', 'Grande', 'Venti']
  </script>
  <div>
    {#each sizes2 as size, index}
    <label>
      <input type=checkbox bind:group={choiceSize2} value={size}> {size}
    </label>
    {/each}
    <p>고객님은 {choiceSize2}를 선택하셨습니다.</p>
  </div>
  ```

### 예제)bind:group - radio
radio 타입의 bind:group에 할당한 변수에는 선택된 radio의 value값이 할당된다.
- value에 배열 index 할당
  index를 할당하였으므로, 최종 선택값을 찾을때는 배열 index로 접근한다.
  ```svelte
  <script>
    let choiceSize1 = 0
    let sizes1 = ['Tall', 'Grande', 'Venti']
  </script>
  <div>
    {#each sizes1 as size, index}
      <label>
        <input type=radio bind:group={choiceSize1} value={index}> {size}
      </label>
    {/each}
    <p>고객님은 {sizes1[choiceSize1]}를 선택하셨습니다.</p>
  </div>
  ```
- value에 배열 요소 할당
  ```svelte
  <script>
    let choiceSize2 = 'Tall'
    let sizes2 = ['Tall', 'Grande', 'Venti']
  </script>
  <div>
    {#each sizes2 as size, index}
    <label>
      <input type=radio bind:group={choiceSize2} value={size}> {size}
    </label>
    {/each}
    <p>고객님은 {choiceSize2}를 선택하셨습니다.</p>
  </div>
  ```
</details>
<br>

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
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
# *[Ch27) HttpAwaitBlock](../Ch27_HttpAwaitBlock/README.md)*