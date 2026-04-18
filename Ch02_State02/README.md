# *[ROOT/README.md](../README.md)*
# *[Svelte4 프로젝트 세팅](INSTALL.md)*
<br>

# *[Ch01) Component](../Ch01_Component/README.md)*
# *[Ch02) State 01 - 기본 및 @html](../Ch02_State01/README.md)*
# *Ch02) State 02 - 이벤트 활용 및 객체, 객체-배열 타입*
<details>
<summary>접기/펼치기</summary>
<br>

## 목차
1. State 클릭 이벤트 활용
2. 객체 타입 State
3. 객체-배열 타입 State

## 01) `State 클릭 이벤트 활용`
State는 값을 템플릿에 적용하기만을 위한것이 아닌 값 변경을 자유롭게 하여 템플릿에 변경된 값을 반영하기 위해 사용한다.  

Svelte에서 이벤트를 사용하는 문법은 다음과 같다.
```svelte
<태그 on:이벤트타입명={이벤트명령처리}></태그>
```
위와같이 on키워드 뒤에 콜론과 이벤트타입명을 지정하고 이벤트명령처리를 할당한다.  
이벤트명령처리에는 오직 함수만 할당 가능하다.  
함수명 혹은 익명 화살표함수를 할당한다.  


- 이벤트 할당 예제01) 익명 화살표 함수 할당
  ```svelte
  <script>
    let count = 0
  </script>
  <h3>count: {count}</h3>
  <button 
    on:click={() => {
      console.log("증가 전 count = ", count)
      count += 1
      console.log("증가 후 count = ", count)
    }}
  >증가
  </button>
  ```
- 이벤트 할당 예제02) 함수 할당
  ```svelte
  <script>
    let count = 0
    const increment = () => {
      console.log("증가 전 count = ", count)
      count += 1
      console.log("증가 후 count = ", count)
    }
  </script>
  <h3>count: {count}</h3>
  <button on:click={increment}>증가</button>
  ```

### 예제) 카운터 프로그램
- [src/State01.svelte](src/State01.svelte)
  ```svelte
  <script>
    let count = 0;
    let decrement = ()=>{
        console.log("감소 전 count = ", count)
        count --;
        console.log("감소 후 count = ", count)
      }
  </script>
  <div>
    <h1>State01) 이벤트 할당</h1>
    <button on:Click={count=0}>초기화</button>
    <button 
      on:Click={()=>{
        console.log("증가 전 count = ", count)
        count ++
        console.log("증가 후 count = ", count)
      }}
    >
      +
    </button>
    <button on:Click={decrement}>-</button>
    <hr>
    <h1>클릭 횟수: {count}</h1>
  </div>
  ```

## 02) `객체 타입 State`
객체 타입의 State의 경우 템플릿 표현식에서는 일반 자바스크립트가 객체의 속성에 접근하는것처럼 `{객체.속성명}`로 접근한다.  
동적 접근 방식인 `객체["속성명"]` 도 가능하다.  
동적 접근 방식은 템플릿 표현식 외 태그속성할당 문법에서도 가능하다.  

```svelte
<script>
  let artist = {
    name: '진',
    age: 31,
    height: 179,
    group: '방탄소년단',
    img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F8152fad7a07738b7d11b8fe1b44b3cd0db34d5fa5c35abee4deae2fd163a4218f003e753532e1edd20a4db12e88382c0f3342d054cba5a0d38ba8bd9be593138ae4b6404caf7373e92540f2688467b825caa89de860dccc282395d440f6f72db&type=fff264_180'
  }
</script>
<div>
  <h1>State02) 객체 타입 State</h1>
  <h2>객체 접근 01 - 일반/동적</h2>
  <h3><img src={artist["img"]} alt="사진"></h3>
  <h3>이름 : {artist.name}</h3>
  <h3>나이 : {artist.age}</h3>
  <h3>키 : {artist.height}</h3>
  <h3>소속그룹 : {artist.group}</h3>
</div>

```

### 객체 구조 분해 할당
객체타입의 반응형 변수를 구조 분해 할당을 할 수 있는데, 이 경우 객체의 속성들을 반응형 변수로 각각 재할당 하는 것이므로 구조분해를 통해 재할당 된 변수들은 반응형을 유지하지만 기존 객체에는 반응성에 대한 영향을 주지 않는다.
(복사하는 개념 이므로 만약 name을 변경할경우 구조분해된 name은 수정되지만 artist 객체의 name은 수정되지않음.)
```svelte
<script>
  let artist = {
    name: '진',
    age: 31,
    height: 179,
    group: '방탄소년단',
    img: 'https://search.pstatic.net/sunny/?src=https%3A%2F%2Fw.namu.la%2Fs%2F8152fad7a07738b7d11b8fe1b44b3cd0db34d5fa5c35abee4deae2fd163a4218f003e753532e1edd20a4db12e88382c0f3342d054cba5a0d38ba8bd9be593138ae4b6404caf7373e92540f2688467b825caa89de860dccc282395d440f6f72db&type=fff264_180'
  }
  let {name, age, height, group, img} = artist
</script>
<div>
  <h1>State02) 객체 타입 State</h1>
  <h2>객체 접근 02 - 구조분해할당</h2>
  <h3><img src={img} alt="사진"></h3>
  <h3>이름 : {name}</h3>
  <h3>나이 : {age}</h3>
  <h3>키 : {height}</h3>
  <h3>소속그룹 : {group}</h3>
</div>

```

## 03) `객체-배열 타입 State`
게시판 글 목록 같은 경우 객체형태의 데이터를 배열로 구성하여 다건으로 다룬다.  
배열의 모든 값들을 인덱스로 하나하나 접근하여 마크업 할 경우 코드가 매우 길어지진다.  
이 경우 Svelte가 내장하고 있는 Each Block을 활용하여 반복 출력 처리가 가능하다.  
### Each Block
상태값이 배열일 때 반복해서 출력해주는 문법이다.  
```svelte
<script>
  let results = [
    {
      name: "유혁스쿨"
    }
  ]
</script>
<ul>
  {#each results as data, index}
    // 반복 데이터
    <li>{data.name}</li>
  {/each}
</ul>
```
구조분해할당도 가능하다.
```svelte
<ul>
  {#each results as {name}, index}
    // 반복 데이터
    <li>{data}</li>
  {/each}
</ul>
```
</details>
<br>

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
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*