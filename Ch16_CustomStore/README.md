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
# *Ch16) Custom Store와 bind, ConetxtAPI 결합*
<details>
<summary>접기/펼치기</summary>
<br>

Store 모듈 개발시 subscribe를 갖는 객체를 만들면 커스텀 스토어가 된다.  

외부에서 store를 제어하지 않고 모듈 내에서 기능별로 함수를 미리 구현하여 상태 변경을 통제함으로써 캡슐화, 상태 일관성 보장, 유지보수성 향상, 재사용성 증가 등의 장점을 갖는다.  

```js
import { 스토어 } from "svelte/store"

const createXX스토어 = () => {
  const { subscribe, /* update, set */ } = 스토어(초기값)

  const storeUtil = () => {
    /* store 값 초기화 등 외부 접근 유틸 함수 */
    console.log("storeUtil 동작")
  }
  return {
    subscribe,
    /* update, set, */
    storeUtil
  }
}

export const xx스토어 = createXX스토어();
```
위와같이 함수를 subscribe를 필수속성으로 갖는 객체를 반환해야만 한다.  

```svelte
<script>
  import { xx스토어 } from "./store/custom"
</script>
<p>{ $xx스토어 }</p>
<button on:click={xx스토어.storeUtil}>스토어 유틸 동작</button>
```

### store bind
store도 마크업 영역에서 bind문법을 통해 바인딩이 가능하다.  
단, 내부적으로 set을 통해 초기화하기 때문에 set이 존재하는 writable 스토어만 가능하다.  

```js
import { writable } from "svelte/store"

export const store = writable(초기값)
```
```svelte
<script>
  import { store } from "./store/custom"
</script>
<p>{ $store }</p>
<input type="text" bind:value={$store} />
```

이때 초기값은 무조건 primitive 타입이어야 한다.  
만약 객체타입으로 초기값을 지정한 후 특정 속성에 도트연산으로 접근하여 bind할 경우 내부적으로 set이 호출되면서 전체 객체가 교체되어 다른 속성이 존재한다면 접근한 속성 외 다른 속성은 모두 사라지게 된다.  
```js
import { writable } from "svelte/store"

export const store = writable({a: '', b: ''})
```
```svelte
<script>
  import { store } from "./store/custom"
</script>
<p>{ $store }</p>
<input type="text" bind:value={$store.a} /> <!-- 메롱 입력 -->
```
아래와 같이 b 속성이 삭제된다.
```json
{
  "a": "메롱 입력"
}
```

##### Readable store의 set을 반환한다면?
아래와 같이 Custom store를 통해 subscribe와 set을 함께 넘긴다면 가능하다.  
내부 콜백함수의 매개변수로 받는 set 함수를 store 내 지역변수에 초기화 한 후 store 객체 내부 속성으로 할당하는 방식이다.  
(writable이 있기 때문에 실무에서 추천되는 방식은 아니다.)
```js
import { readable } from "svelte/store";

const createStore = () => {
  const initValue = ''
  let set
  const { subscribe } = readable(initValue, (_set) => {
    set = _set;
    /* 클린업 */
    return () => set(initValue)
  });
  return {
    subscribe,
    set: (v) => set(v)
  }
}

export const store = createStore();
```

### Context API + Store 결합으로 Context API의 반응성 보완
앞서 Ch14 챕터에서 Context API는 반응성이 없다.  
컴포넌트가 초기화될 때 setContext() 함수를 통해 한번 만 값을 세팅하기 때문에 let 반응성 변수를 context로 넘기면 이후에 값이 변경되더라도 하위 컴포넌트가 리랜더링 되지 않는다.  
따라서 기본적으로는 반응성이 필요없는 변하지 않는 설정값 공유용 데이터만 가능한 기능에서 사용할 수 있다.  

그러나 Context API에 writable 같은 Store를 담은 후 자식 컴포넌트에서 꺼낸다면, 반응성을 유지할 수 있다.  
사실 Store는 그 자체만으로 전역 상태 관리가 가능하기 때문에 억지스러울 수 있으나, 상태 스코프(범위) 격리 측면에서 봤을때 정석 패턴으로 볼수도 있다.  

일반 Store의 경우 앱 전체에서 공유되는 완전한 전역(Global)이 되지만, Context와 Store를 결합할 경우 특정 부모-자식 컴포넌트 내에서만 공유되는 지역(Scoped)적인 상태를 만들 수 있다.  
만약 Context를 쓰지 않고 전역 Store만 쓰게 되면, 같은 컴포넌트를 화면에 여러 번 재사용 할 때 상태가 서로 충돌될 수 있다.  
(특히 Svelte Kit등을 이용한 SSR 환경에서는 사용자 간 상태가 공유되어 버리는 치명적 문제가 발생할 수 있다.)  

- 최상위 컴포넌트
  ```svelte
  <script>
    import { writable } from 'svelte/store'
    import { setContext } from "svelte";
    import ContextFather from "./ContextFather.svelte";

    // let num = 1;
    let num = writable(1);
    setContext("num", num)
  </script>

  <div>
    <h4>Grand 구역</h4>
    <button on:click={() => $num++}>1씩 증가</button>
    <p>기본 숫자 : {$num}</p>
    <hr />
    <ContextFather />
  </div>
  ```

- 1Depth 하위 컴포넌트
  ```svelte
  <script>
    import ContextChild from "./ContextChild.svelte";
  </script>

  <div>
    <h2>Father 구역</h2>
    <hr />
    <ContextChild />
  </div>
  ```
- 2Depth 하위 컴포넌트
  ```svelte
  <script>
    import { getContext } from "svelte";
    let num = getContext("num");
    // $:square = num * num
    $:square = $num * $num
  </script>

  <div>
      <h3>Child 구역</h3>
      <p>제곱 숫자 : {$num}</p>
      <p>제곱 숫자 : {square}</p>
  </div>
  ```

</details>
<br>

# *[Ch17) CssClass](../Ch17_CssClass/README.md)*
# *[Ch18) Rollup 기반 Sass 적용](../Ch18_rollup-sass/README.md)*
# *[Ch19) Transition](../Ch19_Transition/README.md)*
# *[Ch20) Animation](../Ch20_Animation/README.md)*
# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
