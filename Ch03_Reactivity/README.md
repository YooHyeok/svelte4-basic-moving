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
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*