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
# *Ch18) Rollup 기반 Sass 적용*
<details>
<summary>접기/펼치기</summary>
<br>

Rollup 기반 Svelte 프로젝트에서 Sass 설정법을 위주로 가이드 한다.

## rollup 이란?
webpack과 같은 번들러(Bundler)이다.  
webpack은 초기에 나온 번들러로 설정이 복잡하고 빌드 속도가 느림 등 여러 단점이 있어 Svelte4에서는 공식적으로 rollup을 제공한다.  
(Svelte 초기 설치시 rollup 설정파일인 rollup.config.js이 자동으로 생성됨)
webpack rollup 둘 다 지원을 하기 때문에 외부 플러그인 설치할 때 webpack 방식인지 rollup 방식인지 확인을 하면 된다.  
각각에 따라 명령어가 구분되지만, 대부분의 외부 플러그인 제공 사이트에서는 가이드를 제공하므로 가이드 기준으로 입력해 주면 된다.  

## SASS
SASS는 CSS처럼 일반적인 코드를 작성할 수 없기 때문에 외부 플러그인을 설치해야 한다.
React나 Vue에서도 마찬가지로 외부 플러그인을 설치해야 한다.  


### svelte-process-sass 설치
- 터미널 명령
  ```bash
  npm install -D svelte-preprocess-sass
  ```

### sass 설정
- rollup.config.js 
  ```js
  import { sass } from 'svelte-preprocess-sass' // 추가
  export default {
    /* 생략 */
    plugins: [
      svelte({
        /* 생략 */
        preprocess: { // 추가
          style: sass()
        }
      }),
      /* 생략 */
    ]
    /* 생략 */
  }
  ```

### style 태그 속성 설정
```svelte
<style type="text/scss"></style>
<!-- 혹은 -->
<style lang="sass"></style>
```


- 예제) 컴포넌트 적용
  ```svelte
  <button>버튼 클릭!</button>

  <style type="text/scss">
    // 변수 색상 지정
    $primary:red;
    button {
      color: $primary;
      border-color:$primary;
    }
  </style>
  ```

</details>
<br>

# *[Ch19) Transition](../Ch19_Transition/README.md)*
# *[Ch20) Animation](../Ch20_Animation/README.md)*
# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
