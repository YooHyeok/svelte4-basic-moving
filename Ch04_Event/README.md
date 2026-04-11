# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *Ch04) Event*
<details>
<summary>접기/펼치기</summary>
<br>

## 목차
1) 이벤트 문법
2) 인라인 이벤트
3) 핸들러 매개변수
4) 이벤트 수식어


## 01) 이벤트 문법
`<태그 on:이벤트타입명={이벤트함수}></태그>` 형태로 사용한다.  
on 키워드 뒤에 콜론과 이벤트타입명을 지정하고 이벤트 함수를 할당한다.  
이벤트 함수는 사용자가 정의한 익명함수, 일반함수 등을 가리키며, Vue에서는 한줄의 실행코드를 할당할 수 있으나 Svelte는 React처럼 오직 함수만 할당 가능하다.  

### 마우스 좌표 출력 프로그램
```svelte
<script>
  let m = {
    x: 0,
    y: 0,
  }
  const handleMouseMove = e => {
    m.x = e.clientX
    m.y = e.clientY
  }
</script>
<div>
  <div on:mousemove={handleMouseMove}>
    x좌표 : {m.x} <br>
    y좌표 : {m.y}
  </div>
</div>
<style>
  div {
    width: 100%; height: 50%;
    background-color: pink;
  }
</style>
```

## 02) 인라인 핸들러
```svelte
<script>
  let m = {
    x: 0,
    y: 0,
  }
</script>
<div>
  <div on:mousemove={e => m = {x: e.clientX, y: e.clientY}}>
    x좌표 : {m.x} <br>
    y좌표 : {m.y}
  </div>
</div>
<style>
  div {
    width: 100%; height: 50%;
    background-color: pink;
  }
</style>
```
## 03) 핸들러 매개변수
Svelte에서는 핸들러 매개변수를 전달할 때 함수 호출 형태로 직접 할당하면 안된다.  
svelte와 vue 모두 함수 참조 형태로 프레임워크 내부에서 할당된 함수를 객체에 등록하고, 객체 프로퍼티에 접근하여 실제 괄호를 붙혀 실행하게 된다.  
따라서 매개변수를 전달하기 위해서는 함수 호출 형태로 호출해야 하므로 아래와 같이 화살표함수로 한번 wrapping해야 매개변수를 전달할 수 있다.  
```svelte
<script>
  const handleClick = text => alert(`${text}`)
</script>
<div>
  <button on:click={handleClick('1번')}>메롱</button> <!-- 바로 호출됨 -->
  <button on:click={e => handleClick('1번')}>메롱</button>
</div>
<style>
  </style>
```
(괄호를 붙이면 함수를 전달하는 것이 아니라 호출된 실행 결과를 전달하게 됨)

Vue의 경우는 함수 호출형태로도 가능한데, Vue는 내부적으로 컴파일러가 wrapper를 자동으로 생성한다.  
이러한 스타일은 html에서 wrapping 내부적으로 하는 형태와 동일하다.
### html 예제
- 이벤트 할당
  ```html
  <button onclick="handler()">Click</button>
  ```
- 내부 변환
  ```js
  button.onclick = () => handler();
  ```
### Vue 예제
#### 기본 함수 참조 형태
- 이벤트 할당
  ```vue
  <template>
    <button @click="handler">버튼<button>
  </template>
  ```
- 내부 변환
  ```js
  {onClick: handler}
  ```
#### 함수 호출 형태
- 이벤트 할당
  ```vue
  <template>
    <button @click="handler()">버튼<button>
  </template>
  ```
- 내부 변환
  ```js
  {onClick: ($event) => handler()}
  ```

## 04) 이벤트 수식어
event.preventDefault(); event.stopPropagation(); 등 이벤트 제어 메소드를 호출하는 기능을 제공한다.  

`on:이벤트명|수식어={핸들러}` 형태로 사용한다.

vue에서 지원하는 Modifier와 같은 기능이다.
preventDefault를 vue와 svelte 각각에서 적용하는 코드는 아래와 같다. 
- vue 
  ```vue
  <template>
    <button @click.prevent="()=>{}"></button>
  </template>
  ```
- svelte
  ```svelte
  <button on:click|preventDefault="()=>{}"></button>
  ```

`on:이벤트명|수식어|수식어={핸들러}` 형태의 다중 처리도 가능하다. 
- vue
  ```vue
  <template>
    <button @click.stop.prevent="()=>{}"></button>
  </template>
  ```
- svelte
  ```svelte
  <button on:click|stopPropagation|preventDefault="()=>{}"></button>
  ```

### 수식어 종류
- preventDefault: e.preventDefault() 호출
- stopPropagation: e.stopPropagation() 호출
- passive: 터치 혹은 휠 이벤트로 발생하는 스크롤 성능 향상
- capture: 버블링 단계가 아닌 캡처 단계에서 이벤트 핸들러 실행
- once: 이벤트 핸들러를 단 한번만 실행
- self: e.target과 이벤트 핸들러를 정의한 요소가 같을 때 실행

</details>
<br>

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