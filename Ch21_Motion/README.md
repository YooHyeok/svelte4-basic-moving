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
# Ch21) Motion
<details>
<summary>접기/펼치기</summary>
<br>

Svelte 변수는 상태값이기 때문에 변수 값이 변경되면 자동으로 DOM이 업데이트된다.
이때 변수 값의 변화에 애니메이션을 적용할 수 있는 Motion 기능을 제공한다.
Motion은 store기반으로 동작하며, 값이 변경될 때 즉시 반영하지 않고 점진적으로 보간하여 애니메이션 효과를 만드는 원리이다.  
Motion은 크게 tweened와 spring 두가지 효과로 나뉜다.  

1. 모션 tweened 효과
2. 모션 spring 효과

## 1) tweened 효과
정해진 duration 동안 균일하게(혹은 easing에 따라) 보간되는 모션이다.  
- motion tweened 문법
  ```svelte
  <script>
    import { tweened } from 'svelte/motion'
    const store명 = tweened(값, 옵션)
  </script>
  ```
  첫번째 매개변수인 값은 변경될 값이며, 초기값을 지정한다.  
  두번째 매개변수인 옵션에는 객체 타입으로, 각각의 파라미터들을 지정한다.  
  `store.set()`과 `store.update()`를 통해 두 번째 매개변수의 옵션을 전달할 수 있다.  
  
- tweened 파라미터 종류
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 애니메이션을 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 애니메이션 효과의 지속시간이다.<br>기본값은 d => Math.sqrt(d)*120이고, 함수 혹은 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | interpolate | 두 값 사이를 보간하여 보다 더 부드럽게 보여주기 위해 사용되는 옵션이다. |

## 2) spring 효과
spring 함수는 값이 변경될 때 스프링처럼 관성을 이용해 움직이는 모션이다.  

- motion spring 문법
  ```svelte
  <script>
    import { spring } from 'svelte/motion'
    const store명 = spring(값, 옵션)
  </script>
  ```
  
- spring 파라미터 종류
  | 파라미터명 | 설명 |
  |-----------|------|
  | stiffness | 관성이라는 뜻으로 수치가 높을수록 뻣뻣함이 사라져 모션이 반영된다.<br>움직임의 기본 값은 0.15이고, 0~1 사이 숫자로 작성하면 된다. |
  | damping | 스프링처럼 튕기는 모션 범위이다.<br>값이 낮을수록 범위가 넓어진다.<br>기본값은 0.8이고, 0~1 사이 숫자로 작성하면 된다. |
  | precision | 스프링처럼 튕기는 동작이 정착된 것으로 간주하는 값이다.<br>값이 클수록 스프링처럼 튕겨지는 횟수가 줄어든다.<br>기본값은 0.01이다. |
  

</details>
<br>

# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*