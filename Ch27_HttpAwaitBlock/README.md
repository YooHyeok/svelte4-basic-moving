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
# Ch27) Ch27_HttpAwaitBlock
<details>
<summary>접기/펼치기</summary>
<br>

## REST API
웹 앱 개발시 필수적인 기능 중 하나가 서버와의 통신이다.  
데이터를 임의적으로 표현할 수 없기 때문에 데이터를 가져와 화면에 보여 줘야 한다.  
보통은 REST API라는 통신 방법을 사용해 서버와 통신한다.  
REST API는 웹 주소를 이용하여 서버와의 통신하는 방법 중 하나라고 보면 된다.  

웹 주소를 입력하는 방법으로 데이터를 등록, 조회, 수정, 제거 할 수 있다.  

REST API의 4가지 함수는 다음과 같다.  

| 함수 | 설명 | 주소입력방식 |
|------|------|-------------|
| POST | 데이터 등록 | /test |
| GET | 데이터 조회 | /test 또는 /test/1 |
| PUT | 데이터 수정 | /test/1 |
| DELETE | 데이터 삭제 | /test/1 |

위 4가지 함수 외에도 PATCH, HEAD와 같은 함수도 존재한다.  

## Axios
자바스크립트에서 서버와 통신하기 위해 XHR(XMLHttpRequest)이 사용되었으나, 사용법이 복잡하여 jQuery Ajax, Axios 같은 라이브러리가 등장했다.

이후 브라우저 표준으로 fetch API가 추가되면서 별도 라이브러리 없이도 간편한 통신이 가능해졌다.
별도 라이브러리 없이 fetch로 충분한 경우가 많지만 인터셉터, 자동 JSON 파싱, 요청 취소 등 편의 기능이 더 많은 axios가 여전히 많이 쓰이고 있다.  

### axios 설치 코드
```bash
npm install axios
```

### axios 함수 문법1
```js
axios.get(url[, config])
axios.post(url[, data[, config]])
axios.put(url[, data[, config]])
axios.put(url[, config])
```
### axios 함수 문법2
```js
axios({
  method: '',
  url: '',
  data: {

  }
})
```
#### 예제) Axios와 each~else 블록
기존 fetch 함수로 적용된 로직대신 axios를 호출하여 데이터를 출력하는 예제이다.  
`each~else` 블록: 반복하려는 변수의 데이터가 0일 경우 else를 호출한다.

```svelte
<script>
  import axios from 'axios'
  import { onMount } from 'svelte';

  let comments = [];

  const search = async () => {
    try {
      /* const res = await fetch(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
      comments = await res.json(); */
      const res = await axios.get(`https://jsonplaceholder.typicode.com/comments?_limit=21`);
      comments = await res.data
    } catch (error) {
      throw new Error(error);
    }
  }
  onMount(async () => {
    await search();
  });
  
</script>
<div>
  {#each comments as comment}
      <article>
          <h4>이름 : {comment.name}</h4>
          <h4>이메일 주소 : {comment.email}</h4>
      </article>
  {:else}
      <p>loading...</p>
  {/each}
</div>
```

</details>
<br>
