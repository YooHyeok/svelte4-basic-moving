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
# *Ch12) LifeCycle Hook - onMount, onDestroy, beforeUpdate, afterUpdate*
<details>
<summary>접기/펼치기</summary>
<br>

## 개념
컴포넌트의 생명주기(LifeCycle)은 컴포넌트가 화면에 마운트(출력) 되거나, 업데이트 되거나 언마운트(제거)되는 과정을 말한다.  
생명주기마다 사용할 수 있는 method가 존재하며, 이를 hook이라고 부른다.
hook은 갈고리라는 뜻을 가지고 있어 마치 프로그래밍에서 '원래 존재하는 어떤 기능에 갈고리를 거는 것 처럼 끼어 들어가 같이 수행하는 것' 을 의미한다.  
생명주기마다 메소드를 실행할 수 있다.
생명주기 호출 순서는 자식컴포넌트부터 실행된다.


Vue의 경우엔 아래 8가지 종류로 구성된다.
- #### beforeCreate
- #### created
- #### beforeMount
- #### mounted
- #### beforeUpdate
- #### updated
- #### beforeDestory
- #### destoryed

반면 Svelte는 좀더 간단하게 4가지 종류로 구성된다.  
- #### beforeUpdate
  컴포넌트가 DOM에 마운트(구현)되면 실행
- #### onMount
  DOM이 업데이트된 직후에 호출(가장 많이 사용되는 훅 - 데이터 패치에 사용)
- #### afterUpdate
  DOM이 업데이트되기 직전에 호출
- #### onDestroy
  캄포넌트가 제거되었을 때 호출

```svelte
<script>
  import { beforeUpdate, onMount, afterUpdate, onDestroy} from 'svelte'
  beforeUpdate(()=>console.log("beforeUpdate"))
  onMount(()=>console.log("onMount"))
  afterUpdate(()=>console.log("afterUpdate"))
  onDestroy(()=>console.log("onDestroy"))
</script>
```

### Update 훅 (LifeCycle03 참조)
beforeUpdate와 afterUpdate 훅은 컴포넌트가 마운트 되는 시점인 처음부터 호출된다.  
실제로 컴포넌트에 적용해보면 상태값이 컴포넌트가 초기 렌더링 될때 부터 호출된다.  

Vue와 비교했을 때 update 훅이 실행되는 원리는 아래와 같다.  

beforeUpdate와 afterUpdate 훅은 컴포넌트가 마운트 되는 시점인 처음부터 호출된다.  
Vue에서 update 훅은 실제로 Virtual Dom(가상돔)이 생성/수정 되는 시점(render effect)을 기준으로 전/후에 실행된다.  
dom 영역에 할당되지 않고 상태값만 변경된다면 훅이 실행되지 않는다.  
반면 Svelte에서는 Virtual Dom이 존재하지 않지만 Dom이 생성/수정 되는 시점(render effect) 기준으로 전/후에 실행되는것은 같다.  
하지만 dom 영역에 할당되지 않고 순수 상태값만 변경하더라도 훅이 실행된다.  

### 생명주기 순서 (LifeCycle04 참조)
부모 beforeUpdate에서 자식컴포넌트를 렌더링 (v-if 혹은 {#if} flag 변경)할 경우 updated가 되기전에 자식의 훅이 먼저 실행된다.  
만약 props로 자식컴포넌트에게 데이터를 보낸 후 부모컴포넌트에서 props값을 변경한다면 이 역시 자식 updated가 먼저 변경된다.  
이는, Vue의 렌더링 흐름이 안쪽에서 바깥쪽으로 흐르기 때문이다.  
자식 DOM이 먼저 변경되고, 부모 DOM이 바뀌는 구조이다.  

destroy 관련 훅은 서버 렌더링시 호출되지 않는다.  
beforeDestroy의 경우 뷰 인스턴스가 제거되기 직전에 호출되며 원래 모습과 모든 기능들을 가지고 있기 때문에, 이벤트 리스너를 제거할때 사용하는것이 제격이다.  
destroyed는 거의 사용하지 않거나, 매우 특수한 경우(예: 외부 시스템에 '컴포넌트 종료 완료' 알림) 등에만 활용된다.


</details>
<br>

# *[Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick](../Ch13_LifeCycle02/README.md)*
# *[Ch14) PropDrilling과 ContextAPI](../Ch14_ContextAPI/README.md)*
# *[Ch15) Store](../Ch15_Store/README.md)*
# *[Ch16) CustomStore와 bind, ContextAPI 결합](../Ch16_CustomStore/README.md)*
# *[Ch17) CssClass](../Ch17_CssClass/README.md)*