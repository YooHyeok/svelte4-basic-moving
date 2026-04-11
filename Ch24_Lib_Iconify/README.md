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
<details>
<summary>접기/펼치기</summary>
<br>

Iconify는 많은 무료 아이콘을 제공해주는 사이트이다.  
디자인 이미지를 직접적으로 받을 수도 있고, SVG 파일도 제공하며, 각각의 프론트엔드 언어에 맞게 사용법도 제공한다.  
특히 웹 프론트엔드 React, Vue, Svelte를 모두 지원하기 때문에 매우 유용하다.  


## 디펜던시 설치
```bash
npm install @iconify/svelte@4
```

## 기본문법
```svelte
<script>
  import Icon from '@iconify/svelte'
</script>
<Icon icon='파일주제선정'/>
```

## Iconify공식 사이트
- [Iconify 아이콘 주제 사이트](https://icon-sets.iconify.design)
- [Iconify Bootstrap Icon](https://icon-sets.iconify.design/bi)

### 예제01)
- App.svelte
  ```svelte
  <script>
    import Icon from '@iconify/svelte'
  </script>
  <Icon icon='bi:airplane-engines-fill'/>
  <Icon icon='bi:arrow-through-heart-fill'/>
  ```

### 예제02)
- App.svelte
  ```svelte
  <script>
    import Icon from '@iconify/svelte'
  </script>
  <div class="box01">
    <Icon icon='bi:airplane-engines-fill'/>
  </div>
  <div class="box02">
    <Icon icon='bi:arrow-through-heart-fill'/>
  </div>
  <style>
  .box01 svg, .box02 svg{ width: 100px; height: 100px;}
  .box01 path { fill: red; }
  .box02 path { fill: blue; }
  </style>
  ```

- App.svelte
  ```svelte
  <script>
    import Icon from '@iconify/svelte'
  </script>
  <div class="box01">
    <Icon icon='bi:airplane-engines-fill'/>
  </div>
  <div class="box02">
    <Icon icon='bi:arrow-through-heart-fill'/>
  </div>
  ```

- global.css
  ```css
  .box01 svg, .box02 svg{ width: 100px; height: 100px;}
  .box01 path { fill: red; }
  .box02 path { fill: blue; }
  ```

</details>
<br>
