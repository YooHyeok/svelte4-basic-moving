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
# *Ch11) Slot - 기본문법, Fallback, named, props, fragment, $$Slots*
<details>
<summary>접기/펼치기</summary>
<br>

## 개념
부모 컴포넌트가 자식 컴포넌트에 html 컨텐츠를 전달하는 기능이다.  
컴포넌트의 재사용성을 극대화하고, 부모 컴포넌트에서 컨텐츠를 유연하게 주입함으로써 자식 컴포넌트의 내용을 재구성할 수 있다.  

## 기본문법, Fallback, named, props, fragment, $$Slots

### 01) 기본 문법
부모 컴포넌트에서 자식 컴포넌트를 호출할 때 `<자식컴포넌트><!--전달할 마크업--></자식컴포넌트>` 형태로 자식 컴포넌트 태그 사이에 전달할 마크업을 작성한다.  
자식 컴포넌트에서는 `<slot/>` 태그를 통해 부모 컴포넌트에서 전달한 마크업을 배치할 수 있다.  

#### 예제)
- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <h4>이름 : 스벨트(Svelte)</h4>
      <p>배포년도 : 2016년</p>
      <img src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
    </Child>
    <Child>
      <h4>이름 : 리액트(React)</h4>
      <p>배포년도 : 2013년</p>
      <img src="https://ko.legacy.reactjs.org/favicon.ico" alt="리액트(React)" height="50" />
    </Child>
  </div>
  <br>
  ```

- Child.svelte
  ```svelte
  <div class="box">
    <slot/>
  </div>
  <style>
    .box {
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

<br>

### 02) Fallback - 기본값
부모 컴포넌트에서 자식 컴포넌트를 호출할 때 `<자식컴포넌트></자식컴포넌트>` 혹은 `<자식컴포넌트/>` 형태로 마크업을 전달하지 않는 경우 자식 컴포넌트에서 slot 태그 사이에 `<slot><!-- 기본값 --></slot>` 형태로 기본값을 작성하여 출력할 수 있다.  

#### 예제)
- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <h4>이름 : 스벨트(Svelte)</h4>
      <p>배포년도 : 2016년</p>
      <img src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
    </Child>
    <Child>
      <h4>이름 : 리액트(React)</h4>
      <p>배포년도 : 2013년</p>
      <img src="https://ko.legacy.reactjs.org/favicon.ico" alt="리액트(React)" height="50" />
    </Child>
    <Child/> <!-- 마크업 미전달 -->
    <Child/> <!-- 마크업 미전달 -->
    <Child/> <!-- 마크업 미전달 -->
  <br>
  ```
- Child.svelte
  ```svelte
  <div class="box">
    <slot>
      <p>입력된 데이터가 없습니다.</p>
    </slot>
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

### 03) named slot - slot 이름 설정
자식 컴포넌트에 여러 slot영역이 존재할 경우 각 slot에 이름 부여 후   
부모 컴포넌트에서 전달하려는 dom 요소를 원하는 위치에 배치하기 위해 사용하는 기능이다.  

자식 컴포넌트의 slot 태그에서 vue와 동일하게 `name='이름'` 형태로 name 속성에 이름을 부여한다.  
부모 컴포넌트에서는 `slot="이름"` 형태로 사용하며 vue의 `v-slot:이름`(혹은 `#이름`) 문법과 동일한 의미를 갖는다.  

#### 예제)
- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <h4 slot="name">스벨트(Svelte)</h4>
      <p slot="release">2016</p>
      <img slot="img" src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
    </Child>
    <Child>
      <h4 slot="name">리액트(React)</h4>
      <p slot="release">2013</p>
      <img slot="img" src="https://ko.legacy.reactjs.org/favicon.ico" alt="리액트(React)" height="50" />
    </Child>
    <Child/> <!-- 마크업 미전달 -->
    <Child/> <!-- 마크업 미전달 -->
    <Child/> <!-- 마크업 미전달 -->
  </div>
  ```
- Child.svelte
  ```svelte
  <div class="box">
    <h4>이름 : <slot name="name">전달받은 이름이 없습니다.</slot></h4>
    <p>배포년도 : <slot name="release">전달받은 배포년도가 없습니다.</slot></p>
    <slot name="img">전달받은 이미지가 없습니다.</slot>
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

### 04) slot props

#### 기본 문법
slot props는 일반적인 props와 다르게 `부모 컴포넌트 → 자식 컴포넌트`로 전달하지 않고 `자식 컴포넌트 → 부모 컴포넌트`로 전달한다.  
먼저 자식 컴포넌트에서 slot 태그에 전달하려는 상태를 `<slot prop이름={상태값}/>` 형태로 작성한다.  
부모 컴포넌트에서는 자식 컴포넌트 태그에 let 키워드와 함께 전달한 prop이름을 `<자식컴포넌트 let:prop이름></자식컴포넌트>`형태로 할당해준다.  

#### named 속성이 적용된 slot
만약 named 속성이 적용된 slot일 경우 자식 컴포넌트에서 `<slot name="slot별칭" prop이름={상태값}/>` 형태로 name 속성만 추가되고 나머지는 동일하게 작성한다.  
부모 컴포넌트에서 자식 컴포넌트 하위에 전달하는 named slot 속성이 적용된 태그요소 중 일치하는 slot 별칭에 `<태그 slot=slot별칭 let:prop이름></태그>` 형태로 할당하여 props를 전달받는다.

#### 예제) 마우스 호버로 상태값 조작 후 조작된 상태값으로 class(.active) 효과 적용
- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <h4 slot="name" let:hovering class:active={hovering}>스벨트(Svelte)</h4>
      <p slot="release">2016</p>
      <img slot="img" src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
    </Child>
    <Child>
      <h4 slot="name" let:hovering class:active={hovering}>리액트(React)</h4>
      <p slot="release"> 배포년도 : 2013년</p>
      <img slot="img" src="https://ko.legacy.reactjs.org/favicon.ico" alt="리액트(React)" height="50" />
    </Child>
  </div>
  <style>
    .active{
      background-color: #000;
      color: #fff;
      cursor: pointer;
    }
  </style>
  ```
- Child.svelte
  ```svelte
  <script>
    let hovering;
    const enter = () => hovering = true
    const leave = () => hovering = false
  </script>
  <div class="box">
    <h4 on:mouseenter={enter} on:mouseleave={leave}>이름 : </h4><slot hovering={hovering} name="name"><h4>전달받은 이름이 없습니다.</h4></slot>
    <p>배포년도 : <slot name="release">전달받은 배포년도가 없습니다.</slot>년</p>
    <slot name="img">전달받은 이미지가 없습니다.</slot>
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

### 05) svelte:fragment - 가상 Dom Wrapper

`<svelte:fragment>` 태그는 실제 Dom에 렌더링 되지 않는 가상의 Wrapper 요소이다.  
자식 컴포넌트의 slot 영역에 전달할 노드들이 단일 노드가 아닌 복수 노드이고, 이를 실체가 있는 dom이 아닌 하나의 그룹으로 묶어 전달하기 위해 사용한다.  
예를들어 `<div>` 요소에 전역으로 css 효과가 적용되어 있고 자식 컴포넌트에서 `<div>` 영억 안에 3개의 태그 요소를 적재해야 할 때, `<div>` 요소에 한번 감싸서 보낸다면 원하는 출력물을 얻지 못하고 레이아웃이 틀어질 수 있다.  
이런 경우 가상으로 그룹화 하여 전달할 수 있도록 도와준다.  

이는 react의 <></>와 유사하다.  
react와 vue2는 컴포넌트 내에 기본적으로 root노드로 fragment가 필요한 반면, vue3와 svelte에서는 root노드를 허용하기 때문에 일반적으로는 사용하지 않기 때문에 slot(named)을 사용할때만 필요한 문법이다.  
(실제로 svelte:fragment를 선언하면 자식 컴포넌트의 자식이어야 한다고 경고를 출력한다.)  
vue3에서 slot에 fragment를 사용할때는 <template> 태그를 활용하고, svelte에서는 <svelte:fragment>로 사용한다.

#### 기본 문법 및 예제
기본 문법은 간단하다.  
기존 부모 컴포넌트에 선언된 자식 컴포넌트 태그 사이에 전달하려는 태그 대신 `<svelte:fragment>` 태그에 내용을 감싼다.  
- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <svelte:fragment>
        <h4>이름 : 스벨트(Svelte)</h4>
        <p>배포년도 : 2016년</p>
        <img src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
      </svelte:fragment>
    </Child>
  </div>
  ```
- Child.svelte
  ```svelte
  <div class="box">
    <h4>이름 : <slot name="name">전달받은 이름이 없습니다.</slot></h4>
    <p>배포년도 : <slot name="release">전달받은 배포년도가 없습니다.</slot>년</p>
    <slot name="img">전달받은 이미지가 없습니다.</slot>
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

named slot이 적용된 경우라면 기존 named slot을 적용했던 태그 대신 `<svelte:fragment>` 태그에 동일하게 named slot을 적용한다.  

- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <svelte:fragment slot="name" >스벨트(Svelte)</svelte:fragment>
      <svelte:fragment slot="release">2016</svelte:fragment>
      <svelte:fragment slot="img">
        <img src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
      </svelte:fragment>
    </Child>
    <Child>
      <svelte:fragment slot="name" >리액트(React)</svelte:fragment>
      <svelte:fragment slot="release">2013</svelte:fragment>
      <svelte:fragment slot="img">
        <img src="https://ko.legacy.reactjs.org/favicon.ico" alt="리액트(React)" height="50" />
      </svelte:fragment>
    </Child>
  </div>
  ```

### 06) $$Slots
`$$slots`를 활용하여 자식 컴포넌트에서 정의한 slot의 name을 부모 컴포넌트에서 지정하여 전달했는지 여부를 확인할 수 있다.
당연히 부모 컴포넌트에서 전달했는지를 확인하는 문법이므로 자식 컴포넌트에서 접근이 가능하다.  
`$$slots` 객체 안에 부모 컴포넌트에서 전달한 name이 속성으로 구성되므로 `$$slots.별칭` 으로 접근할 경우 전달 여부를 boolean 타입으로 반환받는다.

#### 기본 문법 및 예제
기본 문법은 간단하다.  
기존 자식 컴포넌트 내에 전달하려는 태그 대신 `<svelte:fragment>` 태그에 내용을 감싼다.  

- Parent.svelte
  ```svelte
  <script>
    import Child from "./Child.svelte";
  </script>
  <div>
    <Child>
      <svelte:fragment slot="name">스벨트(Svelte)</svelte:fragment>
    </Child>
    <Child>
      <svelte:fragment slot="release">2016</svelte:fragment>
    </Child>
    <Child>
      <svelte:fragment slot="img">
        <img src="https://svelte.dev/_app/immutable/assets/svelte-logo.5c5d7d20.svg" alt="스벨트(Svelte)" height="50" />
      </svelte:fragment>
    </Child>
  </div>
  ```
- Child.svelte
  ```svelte
  <div class="box">
    <h4>
      {#if $$slots.name}
        이름 : <slot name="name"/>
      {:else}
        전달받은 이름이 없습니다.
      {/if}
    </h4>
    <p>
      {#if $$slots.release}
        배포년도 : <slot name="release"/>년
      {:else}
        전달받은 배포년도가 없습니다.
      {/if}
    </p>
    {#if $$slots.img}
      <slot name="img"/>
    {:else}
      전달받은 이미지가 없습니다.
    {/if}
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

위와 같이 간단한 경우는 fallback으로 처리가 가능하다.  
컴파일 결과 관점에서는 slot fallback이 더 단순하게 동작하기 때문에 단순 기본값이면 fallback을 쓰는 것이 더 자연스러운 패턴이다.  
(실제 성능 측면에서 비용 차이는 미미하다.)  
여러개의 slot이 모두 존재할때 해당 영역을 모두 보여주거나, DOM 구조를 변경할 때 즉, 전혀 다른 내용의 dom을 보여줄때 사용하는것을 권장한다.  
- Child.svelte
  ```svelte
  {#if $$slots.name && $$slots.release && $$slots.img}
  <div class="box">
    <h4>이름 : <slot name="name"/></h4>
    <p>배포년도 : <slot name="release"/>년</p>
    <slot name="img"/>
  </div>
  {:else}
  <h4>name에 해당하는 모든 슬롯을 전달해야 출력됩니다.</h4>
  {/if}
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black; margin-bottom: 20px;
    }
  </style>
  ```

</details>
<br>

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
