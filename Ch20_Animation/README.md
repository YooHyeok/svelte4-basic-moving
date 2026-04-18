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
# Ch20) Animation
<details>
<summary>접기/펼치기</summary>
<br>

1. animate: 지시문과 flip 효과
2. 커스텀 애니메이션
3. 애니메이션 사용 주의사항

## 1) animate: 지시문과 flip 효과
Svelte는 animate: 지시문을 이용하여 애니메이션 효과를 간편하게 사용할 수 있게 해준다.
animate: 지시문은 transition: 지시문과 유사한 문법으로 사용한다.  

- animate: 문법
  ```svelte
  <script>
    import { 애니메이션명 } from 'svelte/animate'
  </script>
  <태그 animate:애니메이션명={파라미터} />
  ```

### flip
트랜지션은 매우 많은 효과를 지원하지만, 애니메이션은 flip 단 하나의 효과만 지원한다.  
flip이란 First, Last, Invert, Play의 약어로 애니메이션 기법 중 하나이다.  
시작 위치와 마지막 위치를 계산하고 애니메이션을 적용하여 x 및 y를 변환한다.  
요소가 한 위치에서 다른 위치로 전환되는 과정을 애니메이션 처리하여 부드럽게 만들어 준다.  

- flip 파라미터 종류
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 애니메이션을 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 애니메이션 효과의 지속시간이다.<br>기본값은 d => Math.sqrt(d)*120이고, 함수 혹은 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |

## 2) 커스텀 애니메이션

```js
function 애니메이션명(요소, {트랜지션파라미터}) {
  return {
    트랜지션파라미터,
	css: (t, u) => {},
	tick: (t, u) => {},
  }
}

```

## 3) animate: 사용 주의사항
key가 있는 Each 블록 안에서만 사용이 가능하다.  
Each 블록의 배열이 재정렬될 때에만 애니메이션이 동작된다.  
Each 블록의 바로 직계 자손 요소에만 적용이 가능하다.  
</details>
<br>

# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*
