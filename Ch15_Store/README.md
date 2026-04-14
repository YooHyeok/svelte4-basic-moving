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
# *Ch15) Store*
<details>
<summary>접기/펼치기</summary>
<br>

1. Store란?
2. Writable
3. Readable
4. Derived

## Store란?
데이터를 따로 관리하여 언제 어디서든 데이터를 쉽게 전달/조작이 가능하다.  
전역으로 관리하게 되며 데이터를 전달받고 싶거나, 데이터 변경을 요청할 때 사용한다.  
Context API 보다 데이터 관리를 효율적으로 할 수 있다.  

Vue의 경우 상태 관리 라이브러리로 vuex 혹은 pinia를 공식 지원하여 Store를 관리한다.  
React는 외부 라이브러리인 Redux나 Justand, MobX, Recoil 등등을 통해 Store를 관리한다.  

Vue와 React는 모두 해당 라이브러리들을 install 해야하지만 Svelte는 내부에 Store를 포함하고 있어, 라이브러리 설치 없이 쉽게 사용할 수 있다.  

Store 종류로 3가지를 학습해본다.  
- Writable
- Readable
- Derived

### Writable
읽기/쓰기가 모두 가능한 Store(객체) 이다.  
가장 기본이고 가장 많이 사용된다.  

여러 컴포넌트에서 사용할 수 있기 때문에 Store는 컴포넌트가 아닌 일반 js 파일에 따로 선언하여 모듈처럼 관리한다.  

#### 지원 메소드
- get: 값 조회  
- set: 값 초기화
  react의 useState setter에 값을 직접 초기화 하는것처럼 DOM 업데이트를 배치 처리한다.  
  (내부 동작방식은 다르며, React는 script, dom 모두 배치 처리되지만 스벨트는 script는 동기, dom만 배치 처리)
- update: 값 수정  
  react의 useState setter에 콜백 함수를 통해 값을 초기화하는것 처럼 이전 값 기반으로 처리 한다.  
  (내부 동작방식은 다름)
- subscribe: 값 반응성 형태로 조회  
  Svelte는 기본적으로 구독을 통해 반응성을 유지하며 값을 조회한다.

#### 기본문법

- store모듈
  ```js
  import { writable } from 'svelte/store';
  export const exStore = writable(0/*기본값*/)
  ```

- 컴포넌트
  ```svelte
  <script>
    import { exStore } from './store/index.js'

    const inc1 = () => $exStore = $exStore + 1 /* $키워드는 자동 구독/해제 */
  </script>
  {$exStore}
  ```

#### 예제) 카운터 증가,감소
- Counter.vue
  ```svelte
  <script>
    import { count } from '../store/writable'
    import Increment from './Increment.svelte'
    import Decrement from './Decrement.svelte'
    import Reset from './Reset.svelte'
  </script>
  <div>
    <h1>01) Writable</h1>
    <h4>값: { $count }</h4>
    <Increment/>
    <Decrement/>
    <Reset/>
  </div>
  ```
- Increment.vue
  ```svelte
  <script>
    import { count } from '../store/writable'
    const increment = () => count.update(n => n + 1)
  </script>
  <button on:click={increment}>+</button>
  ```
- Decrement.vue
  ```svelte
  <script>
    import { count } from '../store/writable'
    const decrement = () => count.update(n => n - 1)
  </script>
  <button on:click={decrement}>+</button>
  ```
- reset
  ```svelte
  <script>
    import { count } from '../store/writable'
    const reset = () => count.set(0)
  </script>
  <button on:click={reset}></button>
  ```

#### writable 구독 방식 차이
- 컴포넌트(수동 구독)
  ```svelte
  <script>
    import { exStore } from "./store/index.js"

    let es

    const unsubscribe = exStore.subscribe(value => {
      es = value
    })
    const inc1 = () => exStore.set(es + 1)
    const inc2 = () => exStore.update(es => es + 1)
    onDestroy(unsubscribe) // 구독 해제
  </script>
  {es}
  ```

- 컴포넌트(자동 구독)
  ```svelte
  <script>
    import { exStore } from './store/index.js'

    const inc1 = () => $exStore = $exStore + 1 /* $키워드는 자동 구독/해제 */
  </script>
  {$exStore}
  ```
  
  위 코드는 내부적으로 아래와 같이 컴파일된다.  
  ```svelte
  <script>
    import { exStore } from './store/index.js'
    let $exStore;
    const unsubscribe = exStore.subscribe(value => $exStore = value)
    const inc1 = () => exStore.set($exStore + 1)
    onDestory(() => unsubcribe())
  </script>
  {$exStore}
  ```

  `$exStore = $exStore + 1`는 update가 아닌 set으로 적용처리된다.  


#### set과 update의 차이

##### get/set의 lostupdate 현상
아래 로직은 reset 버튼을 5초 이내에 빠르게 두번 클릭할 경우 10으로 초기화 되어야 하지만 5로 초기화된다.  
5초가 끝나기 전에 중간에 5를 더하는 과정을 잃게 된다.  
두번째 get으로 상태값을 가지고오는 타이밍이 첫번째 호출당시 5로 업데이트 하기 전에 가져오기 때문이다.  
get은 클릭하는 시점에 값을 가져오는데, 5초를 기다리기까지 set을 하지 않기 때문에 5초 이내에 다시 값을 읽을 경우 get은 0을 읽게된다.
따라서 5를 두번 업데이트하지만, 업데이트 하는 대상 값은 0이기 때문에 최종적으로 10이 아닌 5가 할당된다.  
```svelte
<script>
  import { count, subscribe } from '../store/writable'
  import { get } from 'svelte/store'
  let val2
  unsubsribe = subscribe (v => val2 = v)
  const delay = () => new Promise(r => setTimeout(r, 5000))
  const reset = async() => {
    const val = get(count)
    count.set(0)
    await delay()
    count.set(val + 5)
  }
</script>
<button on:click={reset}>reset</button>
```

##### subscribe로 최신값 유지
아래와같이 subscribe를 사용할 경우 최신 값을 유지할 수 있게 된다.  
subscribe는 react의 useEffect나 vue의 watch와 유사하게 writable의 상태 값이 변경될 때 마다 감지하여 콜백함수를 실행하기 때문이다.  
set 0 으로 변경될 때 실행되어 컴포넌트의 상태변수에 다시 초기화해준다.
```svelte
<script>
  import { count, subscribe } from '../store/writable'
  import { get } from 'svelte/store'
  let val
  unsubsribe = subscribe (v => val = v)
  const delay = () => new Promise(r => setTimeout(r, 5000))
  const reset = async() => {
    count.set(0)
    await delay()
    count.set(val + 5)
  }
</script>
<button on:click={reset}>reset</button>
```

하지만 subscribe도 비동기 흐름을 완벽하게 이해하지 못한다면 예측이 어려울 수 있다.  
아래와 같이 [A] → [force100] → [A] 순서로 5초 이내에 클릭할경우 
store 상태값의 기대값이 110 이지만 실제 결과값은 10이 된다.  

```svelte
<script>
  import { count } from "./store.js";

  let val;

  count.subscribe(v => {
    val = v;
    console.log("subscribe update →", v);
  });

  const delay = () => new Promise(r => setTimeout(r, 5000));

  const inc = async (name) => {
    count.set(0)
    await delay();
    count.set(val + 5);
  };

  const force = () => {
    console.log("force set 100");
    count.set(100);
  };
</script>

<button on:click={() => inc()}>inc</button>
<button on:click={force}>force 100</button>
```

- 실행 순서
  1) inc:   [1번째] 0초기화 → 5초간 대기   <상태: 0>
  2) force: 100 증가                    <상태: 100>
  3) inc:   [2번째] 0초기화 → 5초간 대기   <상태: 0>
  4) inc:   [1번째] 5초대기 종료 → 5 증가  <상태: 5>
  5) inc:   [2번째] 5초대기 종료 → 10 증가 <상태: 10>


이에 대한 대안으로 update를 사용한다.  
update 역시 subscribe처럼 항상 최신 값을 읽기 때문에 변경을 여러번 할 경우엔 update로만 하고  
set 함수는 콜스택에 쌓이는 함수 내에서 초기화 즉, 딱 1회성으로만 할당을 하도록 해야한다.
```svelte
<script>
  import { count } from '../store/writable'

  const delay = () => new Promise(r => setTimeout(r, 5000))

  const reset = async () => {
    count.update(v => v + 1)   // 현재값 기반 증가
    await delay()
    count.set(5)               // 이전값과 무관한 값 설정
  }
</script>
```
```svelte
<script>
  import { count } from '../store/writable'

  const delay = () => new Promise(r => setTimeout(r, 5000))

  const reset = async () => {
    count.set(5)               // 값 초기화
    await delay()
    count.update(v => v + 1)   // 5 + 1 
  }
</script>
```

자동 구독 문법에서는 delay를 주더라도 실시간 값을 읽기 때문에 문제는 발생하지 않는다.

```svelte
<script>
  const reset = async () => {
    $count = 0
    await delay()
    $count = $count + 5        // 똑같이 덮어쓰기 문제 발생
  }
</script>
```


### Readable
읽기 전용 Store로 현재 시간, 사용자 위치, 마우스 위치 등 수정이 필요하지 않은Store 를 선언할 때 사용한다.  

(읽기 전용이지만 readable 내부 set 콜백으로는 값 변경이 가능하므로, 외부에서 접근할때만 읽기 전용으로 사용 가능하다.)

```svelte
<script>
  readable(초기값, function start(set) {
    // 초기 store 값 호출시 코드
    set(변경값)
    return function stop() { // cleanup
      // store 값 제거시 코드
      set(초기값)
    }
  })
</script>
```
초기값이 필요없는 경우는 null이나 undefind를 전달하면 된다.  
함수 선언식은 익명 화살표 함수로도 대응이 가능하다.  

```svelte
<script>
  readable(초기값, (set) => {
    // 초기 store 값 호출시 코드
    set(변경값)
    return () => { // cleanup
      // store 값 제거시 코드
      set(초기값)
    }
  })
</script>
```
set은 관찰되고 있는 값을 변경하는 콜백함수이다.  


#### 예제) 타이머

1초 주기로 실시간 현재 시간을 출력하는 예제이다.  
writable로 구현하면 아래와 같다.

#### writable
```js
import { writable } from 'svelte/store'

export const time = writable(new Date()); // 초기값 new Date() 로 지정
```

```svelte
<script>
  import { onDestroy } from 'svelte'
  import { time } from './store/writable'
  let $time
  const unsubscribe = time.subscribe((value) => $time = value)
  let interval = setInterval(() => time.set(new Date()), 1000)

  onDestroy(() => {
    if (unsubscribe != null) unsubscribe()
    if (interval != null) clearInterval(interval)
  })

  const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	})
</script>
<div>
	<h4>현재 시각: {formatter.format($time)}</h4>
</div>
```

#### Readable
```js
import { readable } from "svelte/store";

export const time = readable(new Date(), function start(set) {
  const interval = setInterval(() => set(new Date()), 1000) // 1초에 한번씩 초기화

  /* 클린업 */
  return function stop() {
    clearInterval(interval);
  }
});
```
```svelte
<script>
	import { time } from '../store/readable'
	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	})
</script>
<div>
	<h4>현재 시각: {formatter.format($time)}</h4>
</div>
```

### Derived
Derived란 파생된, 유래된 뜻을 가진다.  
기존 Store 값에서 파생된 값을 가공해서 사용할 수 있게 하는 기능이다.  
즉, 기존에 있는 Store 값을 이용해서 새로운 값을 생성해주는 기능을 한다.  
이때, 참조한 store의 값에는 아무런 영향을 주지 않는다.  
구독 기반 계산을 통해 가장 최신의 store 값을 읽은 후 계산할 수 있다.  
내부 구현방식은 다르지만 Vue의 computed와 비슷한 기능으로 캐싱 기능도 있다.  

- 기본 문법
  ```js
  import { 다른스토어, derived } from 'svelte/store';
  const 기존스토어명 = 다른스토어(/* 생략 */)
  export const derivedEx = derived(기존스토어명, $기존스토어명 => {
    $기존스토어명(변경코드반환)
  })
  ```
  derived 내에서 참조할 store와 콜백 함수를 매개변수로 받아 콜백 함수 내에서 조작한 후 반환하는 형태가 된다.  
  이때 콜백 함수 내에서 참조할 store를 사용할 때는 store 변수 앞에 $기호를 작성해야 한다.  
  (자동 구독 되어 실시간으로 store의 현재값을 반환받는다.)  


예를들어 auth라는 로그인 인증 store를 writable로 구현하였을때 로그인 여부를 매번 auth store에 $auth.인증토큰 으로 접근하여  
값이 존재하는지 존재하지않는지를 체크하는것 보다 미리 계산시켜두고 계산된값만 구독하여 사용할수 있도록 편하게 사용할 수 있다.  
```js
import { writable, derived } from 'svelte/store';
export const auth = writable({Authorization: null, /* 생략 */})
export const isLogin = derived(auth, $auth => $auth.Authorization ? true:false)
```

#### 예제) 타이머와 경과시간
```js
import { readable, derived } from "svelte/store";

const start = new Date(); /* 시작 시간 */

export const time = readable(start, function start(set) {
  const interval = setInterval(() => set(new Date()), 1000) // 1초에 한번씩 초기화

  /* 클린업 */
  return function stop() {
    clearInterval(interval);
  }
});

/* 경과시간(Derived Store) : (현재시간 - 시작시간) / 초단위 */
export const elapsed = derived(time, $time => Math.round(($time - start) / 1000))
```

```svelte
<script>
	import { time, elapsed } from '../store/derived'
	const formatter = new Intl.DateTimeFormat('en', {
		hour12: true,
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit'
	})
</script>
<div>
	<h4>현재 시각: {formatter.format($time)}</h4>
	<p>현재 페이지가 열린지 {$elapsed}초가 지났습니다.</p> <!-- 경과 시간 elapsed -->
</div>
```

</details>
<br>

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
