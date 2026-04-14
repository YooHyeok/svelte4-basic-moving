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
# Ch23) SpecialElement
<details>
<summary>접기/펼치기</summary>
<br>

Svelte는 특별한 요소를 지원해준다.  
컴포넌트가 자기 자신을 호출하거나, window 혹은 document 객체를 직접적으로 선택할 수 있다.  
요소들을 내장해서 기능들을 지원함으로써 복잡해질 수 있는 코드를 간결하게 처리한다.  
`<svelte:요소>` 형태로 사용하며 `요소` 에 적용할 수 있는 종류는 아래와 같다.

1. self, component, element
2. window, document, body
3. head, option, fragment

## 01) self, component, element
<details>
<summary>접기/펼치기</summary>
<br>

### self
`<svelte:self>` 형태로 사용하며, 컴포넌트가 자기 자신을 재귀적으로 호출할 수 있게 된다.  
마크업의 최상위 영역에서는 사용이 불가능하며, 무한 호출을 방지하기 위해서는 If 블록이나 Each 블록 내부에 위치하거나 컴포넌트의 slot에 전달되어야 한다.  

#### 예제) 5 → 1 카운트 1 감소 예제
- Self.svelte
  ```svelte
  <script>
    import Recursive from "./Recursive.svelte";
  </script>
  <div>
    <Recursive count={ 5 }/>
  </div>
  ```
- Recursive.svelte
  ```svelte
  <script>
    // import Recursive from "./Recursive.svelte";
    export let count;
  </script>
  <div>
    {#if count > 0}
      <p>카운트다운... {count}</p>
      <!-- <Recursive count={ count - 1 }/> -->
      <svelte:self count={ count - 1 }/>
    {:else}
      <p>발사!</p>
    {/if}
  </div>
  ```

#### 결과
```
카운트다운... 5
카운트다운... 4
카운트다운... 3
카운트다운... 2
카운트다운... 1
발사!
```

### component
`<svelte:component>` 형태로 사용하며, 변수에 담긴 컴포넌트를 동적으로 렌더링할 수 있게 된다.  
`<svelte:component this={js표현식}/>`과 같이 this 속성으로 지정된 컴포넌트 속성을 사용하여 컴포넌트를 동적으로 구현한다.  
이때 component 태그의 this속성은 렌더링 할 컴포넌트를 동적으로 선택하는 전용 속성이므로 bind:this와는 전혀 관계가 없다.

| 구분 | 역할 |
|------|------|
| `bind:this={변수}` | DOM 요소를 변수에 할당 |
| `<svelte:component this={컴포넌트}>` | 어떤 컴포넌트를 렌더링할지 지정 |

this값에는 렌더링 할 컴포넌트를 할당한다.
만약 this값이 거짓이라면 컴포넌트를 반환히지 않는다.  

#### 예제) 선택된 컴포넌트 렌더링
- Food01.svelte
  ```svlete
  <h4>햄버거를 선택했습니다.</h4>
  ```
- Food02.svelte
  ```svlete
  <h4>피자를 선택했습니다.</h4>
  ```
- Food03.svelte
  ```svlete
  <h4>치킨을 선택했습니다.</h4>
  ```
##### if 블록 활용
```svelte
<script>
  import Food01 from "./Food01.svelte";
  import Food02 from "./Food02.svelte";
  import Food03 from "./Food03.svelte";
  const options = [
    { name: '햄버거' },
    { name: '피자' },
    { name: '치킨' },
  ]
  let selected = options[0]
</script>
<div>
  <h3>음식을 선택하세요.</h3>
  <select bind:value={selected}>
    {#each options as option (option.name)}
      <option value={option}>{option.name}</option>
    {/each}
  </select>
  {#if selected.name == '햄버거'} 
    <Food01 />
  {:else if selected.name == '치킨'}
    <Food02 />
  {:else}
    <Food03 />
  {/if}
</div>
```
##### component 태그 활용
```svelte
<script>
  import Food01 from "./Food01.svelte";
  import Food02 from "./Food02.svelte";
  import Food03 from "./Food03.svelte";
  const options = [
    { name: '햄버거', component: Food01 },
    { name: '피자', component: Food02 },
    { name: '치킨', component: Food03 },
  ]
  let selected = options[0]
</script>
<div>
  <h3>음식을 선택하세요.</h3>
  <select bind:value={selected}>
    {#each options as option (option.name)}
      <option value={option}>{option.name}</option>
    {/each}
  </select>
  <svelte:component this={selected.component} />
</div>
```

### element
`<svelte:element>` 형태로 사용하며, 문자열로 지정한 HTML 태그를 동적으로 렌더링할 수 있게 된다.  
element태그에 유일하게 지원되는 바인딩은 bind:this이다.  
Svelte가 빌드시 수행하는 요소 유형별 바인딩은 동적 태그를 이용해서 작동하지 않기 때문이다.  
여기서 말하는 요소 유형별 바인딩의 예시는 입력 요소에 대한 bind:value를 예로 들 수 있다. 있다.  
(Svelte는 컴파일 타임에 태그를 인식하여 bind:value를 적절히 처리할 수 있으나 element의 경우 런타임에 결정되기 때문에 bind:this외의 바인딩은 불가능하다.)  
this에 null값이 있으면 요소와 해당 하위 요소가 렌더링되지 않는다.  

#### 선택된 select option 태그
```svelte
<script>
  const options = ['h1', 'h3', 'p']
  let selected = options[0]
</script>
<div>
  <h3>음식을 선택하세요.</h3>
  <select bind:value={selected}>
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
  <svelte:element this={selected}>
    현재 요소는 {selected} 입니다.
  </svelte:element>
</div>
```

</details>
<br>

## 02) window, document, body
<details>
<summary>접기/펼치기</summary>
<br>

### window
`<svelte:window />` 요소를 사용하면 컴포넌트가 삭제될 때 이벤트 리스너를 제거하거나, 서버 측 렌더링 시 창의 존재 여부를 확인할 필요 없이 창 개체에 이벤트 리스너를 추가한다.  
`<svelte:window on:이벤트명={이벤트 핸들러} />` 형태로 window 객체에 이벤트를 적용시킬 수 있게 된다.  
`<svelte:self>`와 반대로 컴포넌트의 최상위 수준에만 나타날 수 있으며, 특정 요소 하위에 선언되어서는 안된다.  

#### 예제) 키보드 입력 반환
```svelte
<script>
  let key, keyCode;
  
  const handleKeydown = e => {
    key = e.key;
    keyCode = e.keyCode;
  }

</script>
<svelte:window on:keydown={handleKeydown}/>
<div>
  {#if key}
    <kbd>{ key === '' ? 'space' : key }</kbd>
    <p>keyCode: { keyCode }</p>
  {:else}
    <p>창을 클릭 후 키보드를 눌러주세요.</p>
  {/if}
</div>

<style>
  div{
    display: flex; height: 100%; 
    text-align: center; align-items: center;
    justify-content: center; flex-direction: column;
  }
  kbd{
    background-color: #eee; border-radius: 3px;
    border: 1px solid #b4b4b4;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2),
    0 2px 0 0 rgba(255, 255, 255, 0.7) inset;
    color: #333; display: inline-block;
    font-size: 0.85em; font-weight: 700;
    line-height: 1; padding: 0.2em 0.5em;
    font-size: 20px; white-space: nowrap;
  }
</style>
```

#### 속성 바인딩 문법
`<svelte:window bind:속성={값} />` 형태로 여러 속성들에 상태변수 혹은 값을 바인딩 할 수 있다.  
window 객체 접근하여 얻을수 있는 속성 값들을 태그를 통해 반환받는 방법이다.  
아래 속성들에 상태변수를 바인딩함으로써, 상태변수의 값에 해당 값을 읽어들일 수 있게 된다.  

#### window 요소 속성 종류
| 속성명 | 설명 |
|--------|------|
| innerWidth | 창의 가로 폭 속성이다. (스크롤바나 상태표시줄 등 제외한 영역) |
| innerHeight | 창의 세로 높이 속성이다. (스크롤바나 상태표시줄 등 제외한 영역) |
| outerWidth | 창의 가로 폭 속성이다. (스크롤바나 상태표시줄 등 포함한 영역) |
| outerHeight | 창의 세로 높이 속성이다. (스크롤바나 상태표시줄 등 포함한 영역) |
| scrollX | 가로 스크롤바의 좌측 좌표를 반환한다. |
| scrollY | 세로 스크롤바의 상단 좌표를 반환한다. |
| online | `window.navigator.onLine`과 같다. <br> 페이지가 인터넷에 연결되어 있는지를 확인한다. |
| devicePixelRatio | 현재 디스플레이 장치에 대한 '물리적 픽셀' 해상도와 'CSS 픽셀' 해상도의 비율을 반환한다. |


#### 예제) 속성 바인딩: 스크롤바 좌표 반환
`bind:scrollY` 속성에 반응형 변수를 할당함으로써 좌표를 얻는다.  
```svelte
<script>
  let y;
</script>
<svelte:window bind:scrollY={y}/>
<div>
  <div></div>
  <h3>스크롤바 좌표 : {y}</h3>
</div>

<style>
    div{ height: 2000px; }
    h3{ position: fixed; right: 10px; top: 10px; }
</style>
```

### document
`<svelte:document>` 요소는 `<svelte:window>`와 사용법이 비슷하다.  
하지만 창에서 실행되지 않는 `visibilitychange`, `selectionchange` 등과 같은 document객체의 이벤트에 리스너를 추가할 수 있다.  
`<svelte:window>` 와 동일하게 `<svelte:self>`와 반대로 컴포넌트의 최상위 수준에만 나타날 수 있으며, 특정 요소 하위에 선언되어서는 안된다.  

`<svelte:document on:이벤트명={이벤트핸들러} use:액션명 />`
위와 같이 `on` 디렉티브로 이벤트를 바인딩할 수 있으며, `use` 디렉티브를 활용해 Action을 사용할수도 있다.  
`<svelte:document bind:속성={값} />`
window 요소처럼 `bind` 디렉티브로 속성에 값이나 변수를 할당할수도 있다.  

#### document 속성 바인딩 종류
- fullscreenElement
- visibilityState

#### 예제) 마우스 드래그 텍스트 값 반환
```svelte
<script>
  let selection = '';

  const handleSelectionChange = e => (selection = document.getSelection());
</script>
<svelte:document on:selectionchange={handleSelectionChange} />
<div>
  <h3>이 글자를 드래그선택하면 아래 그대로 반환됩니다.</h3>
  <hr />
  <p>선택된 글자: {selection}</p>
</div>
```

### body
document.body와 같은 요소이다.  
window에서 실행되지 않는 `mouseenter` 혹은 `mouseleave` 등의 document.body 이벤트에 리스터를 추가할 수 있다.

`<svelte:window>` 혹은 `<svelte:document>` 와 동일하게 `<svelte:self>`와 반대로 컴포넌트의 최상위 수준에만 나타날 수 있으며, 특정 요소 하위에 선언되어서는 안된다.  

#### 문법
`<svelte:body on:이벤트명={이벤트핸들러} use:액션명 />`
`<svelte:body bind:속성={값} />`

#### body 속성 바인딩 종류
| 속성 | 설명 |
|------|------|
| `activeElement` | 현재 포커스된 요소 |
| `fullscreenElement` | 현재 전체화면 모드인 요소 |
| `pointerLockElement` | 포인터 잠금이 적용된 요소 |
| `visibilityState` | 문서 가시성 상태 (`visible`, `hidden`) |


#### 예제) body 마우스오버시 글자 렌더링
```svelte
<script>
  import { fade } from 'svelte/transition'
  let visible = false;

  const handleMouseenter = e => (visible = true);
  const handleMouseleave = e => (visible = false);
</script>
<svelte:body on:mouseenter={handleMouseenter} on:mouseleave={handleMouseleave} />
<div>
  {#if visible}
    <div class="centered" out:fade>
      {#each 'SVELTE' as char, i}
        <span in:fade|global={{ delay: i * 150, duration: 800 }}>{ char }</span>
      {/each}
    </div>
  {/if}
</div>
<style>
  .centered {
    font-size: 20vw; position: absolute;
    left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Overpass';
    letter-spacing: 0.12em;
    color: #676778; font-weight: 400;
  }
  .centered span { will-change: filter; }
</style>
```

</details>
<br>

## head, options, fragment
<details>
<summary>접기/펼치기</summary>
<br>

### head
`<svelte:window>` 혹은 `<svelte:document>`, `<svelte:body>` 와 동일하게 `<svelte:self>`와 반대로 컴포넌트의 최상위 수준에만 나타날 수 있으며, 특정 요소 하위에 선언되어서는 안된다.  

#### 예제) 외부 스타일시트, 파비콘 추가
```svelte
<svelte:head>
  <title>Svelte 특수 요소</title>
  <link rel="stylesheet" href="build/dark-theme.css">
  <link rel="shortcut icon" href="https://svelte.dev/favicon.png" type="image/x-icon">
</svelte:head>
<div>
  <h3>Hello world!</h3>
</div>
```

### options
`<svelte:options>` 형태로 사용하며, 컴포넌트에 지정된 컴파일 옵션을 지정할 수 있다.  

#### 옵션 종류
| 옵션명 | 설명 |
|--------|------|
| `immutable={true}` | 변하지 않는 데이터를 사용할 것이라고 컴파일러에게 알려주는 옵션입니다.<br>컴파일러는 간단한 검사로 참조 값이 변경되었는지 검사합니다. |
| `immutable={false}` | 기본값입니다. 좀 더 엄격하게 값이 변경되었는지 확인하는 옵션입니다. |
| `accessors={true}` | 컴포넌트의 props에 getter와 setter를 추가합니다. |
| `accessors={false}` | 기본값입니다. 컴포넌트의 props에 getter와 setter를 안 줍니다. |
| `namespace="..."` | 컴포넌트가 사용될 네임스페이스입니다. 일반적으로 svg에서 사용됩니다. |
| `tag="..."` | 컴포넌트를 사용자가 정의한 요소로 컴파일할 때 사용되는 옵션입니다. |

##### `immutable={true}`  
불필요한 렌더링을 막는 욥선이다.  
컴포넌트는 재사용가능한 UI이기 때문에 재사용 하다 보면 한 인스턴스에서 명령을 줬음에도 모든 인스턴스가 명령을 받는 경우가 있다.  
이 경우 불필요한 렌더링이 발생되므로 메모리를 많이 차지하며, 이를 방지할 때 사용할 수 있다.  
React의 useCallback()과 React.memo()를 사용하는 것과 유사하다.  
#### 예제) 버튼 클릭 하트 채움 전환
동일한 컴포넌트로 구성된 여러개의 버튼을 각각 클릭시 모든 버튼이 리랜더링 되는 부분에 대해 불필요한 랜더링을 막도록 적용한 예제이다.
```svelte
<svelte:options immutable={true}/>
<script>
  import { afterUpdate } from 'svelte';
  export let lang;
  afterUpdate(() => {
    console.log(lang.text + ' : ' + lang.like);
  });
</script>

<button on:click>
  {#if lang.like}
    <span>♥</span>
  {:else}
    <span>♡</span>
  {/if}
  {lang.text}
</button>
```
```svelte
<script>
  import Heart from "./Heart.svelte";
  let langs = [
    { id: 1, like: false, text: 'Svelte' },
    { id: 2, like: false, text: 'React' },
    { id: 3, like: false, text: 'Vue' }
  ];
  const toggle = id => {
    langs = langs.map(lang => {
      if(lang.id === id) {
        return {
          id: lang.id,
          like: !lang.like,
          text: lang.text
        };
      }
      return lang;
    });
  }
</script>
<div>
  {#each langs as lang}
    <Heart lang={lang} on:click={() => toggle(lang.id)} />
  {/each}
</div>
```

### fragment
파편 이라는 의미를 가진다.  
slot으로 특정 컴포넌트를 재사용할 경우 slot의 name을 작성하려면 div 태그 요소 같은 원래 DOM 태그요소를 작성하고 slot name을 작성해야 한다.  
`<svelte:fragment>` 요소를 사용하면 DOM 요소를 작성하지 않아도 된다.  
fragment는 파편이라는 의미를 가지며, 특정 노드를 그룹으로 묶어주는 역할을 해주며, 
예를들어 `span` 태그로 slot name을 바인딩할 경우 `span` 태그에 원하지 않는 스타일이 들어가 디자인 수정을 다시 해야하는 불편함이 사라진다.  

(해당 내용은 앞서 [Ch11) Slot](../Ch11_Slot/README.md) 에서도 다룬바 있다.)  

#### 예제)

- Child03.svelte
  ```svelte
  <div class="box">
    <h4>
      이름 : 
      <slot name="name">
        전달받은 이름이 없습니다.
      </slot>
    </h4>
    <p>
      배포년도 : 
      <slot name="release">
        전달받은 배포년도 없습니다. 
      </slot>
    </p>
  </div>
  <style>
    .box{
      width: 300px; padding: 10px;
      border: 2px solid black;   
      margin-bottom: 20px;
    }
  </style>
  ```

- SlotParent03.svelte
  ```svelte
  <script>
    import Child03 from "./Child03.svelte";
  </script>

  <Child03>
    <span slot="name">스벨트(Svelte)</span>
    <span slot="release">2016</span>
  </Child03>
  <Child03></Child03>
  ```
- SlotParent03.svelte
  ```svelte
    <script>
      import Child03 from "./Child03.svelte";
    </script>
    <Child03>
      <svelte:fragment slot="name">앵귤러(Angular)</svelte:fragment>
      <svelte:fragment slot="release">2010</svelte:fragment>
    </Child03>
    <Child03></Child03>
  ```

두 코드는 실제 렌더링시 아래와 같은 차이를 갖는다.  

- 결과1) span태그에 name을 적용
  ```html
  <div class="box">
    <h4>
      "이름 : "
      <span slot="name">
        스벨트(Svelte)
      </slot>
    </h4>
    <p>
      배포년도 : 
      <span slot="release">
        2016
      </slot>
    </p>
  </div>
  ```
- 결과2) svelte:fragment에 name을 적용
  ```html
  <div class="box">
    <h4>
      "이름 : "
      "앵귤러(Angular)"
    </h4>
    <p>
      "배포년도 : "
      "2010"
    </p>
  </div>
  ```



</details>
<br>

</details>
<br>
