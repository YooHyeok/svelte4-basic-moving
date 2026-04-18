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
Ch25) Lib_UUID
<details>
<summary>접기/펼치기</summary>
<br>

UUID란 Universally Unique Identifier의 약어로 범용 고유 식별자 이다.  
간단하게 말하면, 네트워크 상에서 고유성이 보장되는 id를 만들기 위한 표준 규약이다.  

UUID는 128비트의 숫자이며, 32자리의 16진수로 표현된다.  
UUID 버전은 1,3,4,5,7이 있으며 이중 가장 많이 쓰이는 버전은 1과 4버전이다.  

## uuid 라이브러리 설치
```bash
npm install uuid
```

## v4 기본 문법
```js
import { v4 as uuidv4 } from 'uuid'
uuidv4({/* options */});
```
v4의 options 객체에는 random과 rng 두가지 속성이 있다.  
- random: 16바이트 랜덤 값을 직접 지정(Unit8Array)  
- rng: 랜덤 값을 생성하는 함수를 직접 지정  
options 객체를 생략하여 사용하는것이 일반적이며, 생략할 경우 `crypto.getRandomValues()`을 사용해 16바이트 랜덤 값을 자동 생성한다.  

uuid 라이브러리의 v4의 options 설정 속성들과 그 외 버전 및 함수들에 대한 모든 속성들을 이해하기 위해서는 uuid의 개념과 js에서 기본적으로 지원하는 함수에 대한 이해가 필요하다.  
[uuid 공식 Docs](https://github.com/uuidjs/uuid#readme)
[MDN 공식 Docs](https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID)


```svelte
<script>
	import { v4 as uuidv4 } from 'uuid'

  let test = uuidv4();
  const tests = [
    {
      id: uuidv4(),
      name: '김범수'
    },
    {
      id: uuidv4(),
      name: '박효신'
    },
    {
      id: uuidv4(),
      name: '나얼'
    },
  ];
</script>

<h1>{ uuidv4() }</h1>
<h1>{ test }</h1>

<ul>
  {#each tests as test}
    <li>{test.id}<br>{test.name}</li>
  {/each}
</ul>
```

</details>
<br>

# *[Ch26) Router](../Ch26_Router/README.md)*
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*