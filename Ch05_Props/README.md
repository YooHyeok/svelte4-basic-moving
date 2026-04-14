# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *[Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입](../Ch02_State02/README.md)*
# *[Ch03) Reactivity](../Ch03_Reactivity/README.md)*
# *[Ch04) Event](../Ch04_Event/README.md)*
# *Ch05) Props export let*
<details>
<summary>접기/펼치기</summary>
<br>

## Props란?
Props란 Properties의 줄인말로 React와 Vue에서 사용하는 단어이다.  
Svelte에서는 Props라는 단어를 공식적으로 사용하지 않지만 동일한 기능을 갖는 export let 문법이 있다.  
부모 컴포넌트에서 자식 컴포넌트에 전댈하주는 값으로 읽기 전용 데이터이다.  
컴포넌트는 상하관계 구성되기 때문에 데이터 전달을 부모에서 자식 방향으로 수직적으로 처리한다.  

## 01) export let 기본 문법
### 부모 컴포넌트
`<자식컴포넌트 prop명={전달값}>` 혹은 `<자식컴포넌트 prop명="전달값">` 형태로 사용한다.  
넘기려는 값이 변수나 객체가 아닌 원시타입 값 그 자체일 경우 쌍따옴표로 감싸 넘길수도 있다.  
하지만 숫자 타입을 기입할 경우 vsc에서는 숫자형으로 보이지만 실제 넘겨지는 타입은 string 타입이다.  
변수 자체를 넘길경우엔 중괄호 내에 입력해야만 하고,

```svelte
<script>
  import Child from './child.svelte'
  let obj = {value:"값"}
</script>
<Child prop={"바보"}/>
<Child prop="메롱"/>
<Child prop="13"/>
<Child prop="false"/>
<Child prop={obj}/>
<Child prop={{value:"값"}}/>
```
### 자식 컴포넌트
자식 컴포넌트의 script 태그 내 `export let prop명` 으로 전달받는다.  
```svelte
<script>
  export let prop
  console.log("prop = ", prop)  
</script>
<p>prop: {prop}</p>
```

## 02) default 값
react에서는 일반 변수의 매개변수에 기본값을 설정하는것과 동일한 형태로 `(prop = "기본값")` 과 같이 기본값을 설정할 수 있다.  
vue에서는 추가로 읽기전용, 필수여부, 기본값, 타입 모두를 설정할 수 있다.  
svelte에서는 기본적으로 기본값 설정만 지원하며, 일반적으로 변수에 값을 할당하는 형태로 `export let prop = "기본값"` 과 같이 선언한다.  

### 자식 컴포넌트
```svelte
<script>
  export let prop = "기본값"
  console.log("prop = ", prop)  
</script>
<p>prop: {prop}</p>
```

## 03) Props 값 변경
자식 컴포넌트는 전달되는 값을 변경할 수 없다.  
값을 변경하기 위해서는 오직 부모 컴포넌트에서만 변경이 가능하며, 이는 state 상태변수를 props로 전달하는 유형에만 해당한다.  

1) state 변경 함수 Props 전달
2) createEventDispatcher

### state 변경 함수 Props 전달
Svelte에서는 React나 Vue 처럼 Props로 함수를 전달할 수 있다.  
부모 컴포넌트에서 state 값을 조작하는 함수를 선언한 뒤, 자식 컴포넌트 태그의 속성을 통해 전달하고 자식 컴포넌트에서 `export let`으로 해당 함수를 할당하여 전달받을 수 있다.  
#### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  let age01 = 20;
  const onPlus = () => age01++
  const onMinus = () => age01--
</script>
<div>
  <Child name={'김철수'} age={age01} hobby={'축구하기'} onPlus={onPlus} onMinus={onMinus}/>  
</div>
```
#### 자식 컴트넌트
```svelte
<script>
  export let age = 20;
</script>

<h3>나이: {age}</h3>
<hr>
<button on:click={onPlus}>나이증가 +</button>
<button on:click={onMinus}>나이감소 -</button>
```
### event drivent: createEventDispatcher
Vue에서 지원하는 Emit 기능과 유사한 이벤트 기반 통신 방식이다.

부모 컴포넌트에서 자식 컴포넌트 태그에 `on:이벤트명={함수명}` 형태로 커스텀 이벤트와 핸들러 함수를 등록해준다.  
자식 컴포넌트에서는 svelte 패키지로부터 createEventDispatcher를 import문을 사용하여 불러온 뒤  
`const dispatch = createEventDispatcher()` 형태로 선언과 동시에 함수 호출을 통해 할당하고,  
할당된 변수 dispatch를 `dispatch('이벤트명', 전달값)`함수 호출 문법을 통해 첫번째 매개변수로 이벤트명을, 두번째 매개변수로 payload 값을 넘긴다.  
자식 컴포넌트에서는 핸들러 함수에서 payload 값을 핸들러 함수 매개변수의 detail 속성으로 접근할 수 있게 된다.  

#### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  let age01 = 20;
  const operation = (event) => age01 = event.detail.age
</script>
<div>
  <Child name={'김철수'} age={age01} hobby={'축구하기'} on:plus={operation} on:minus={operation}/>
</div>
```
#### 자식 컴트넌트
```svelte
<script>
  import { createEventDispatcher } from "svelte";
  export let age = 20;
  const dispatch = createEventDispatcher();
  const onPlus = () => dispatch('plus', {age: age+1})
  const onMinus = () => dispatch('minus', {age: age-1})
</script>

<h3>나이: {age}</h3>
<hr>
<button on:click={onPlus}>나이증가 +</button>
<button on:click={onMinus}>나이감소 -</button>
```

## 04) spread

```js
const people {
  name: '김철수',
  age: 20,
  hobby: '축구하기'
}
```
위와같은 형태의 객체를 spread 문법을 통해 props로 전달하면, 
자식 컴포넌트에서는 객체 형태로 한번에 받지 않고, 각 속성을 `export let 속성` 형태로 할당받게 된다.  
```svelte
<script>
  export let name;
  export let age;
  export let hobby;
</script>

<h3>이름: {name}</h3>
<h3>나이: {age}</h3>
<h3>취미: {hobby}</h3>
<hr>
```

### 부모 컴포넌트
```svelte
<script>
  import Child from "./Child.svelte"
  const allData01 = {
    name: '김철수',
    age: 20,
    hobby: '축구하기'
  }
  const allData02 = {
    name: '김영희',
    age: 21,
    hobby: '넷플릭스보기'
  }
</script>
<div>
  <Child {...allData01}/>
  <Child {...allData02}/>
</div>
```
### 자식 컴포넌트
```svelte
<script>
  export let name;
  export let age;
  export let hobby;
</script>

<h3>이름: {name}</h3>
<h3>나이: {age}</h3>
<h3>취미: {hobby}</h3>
<hr>
```
</details>
<br>

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