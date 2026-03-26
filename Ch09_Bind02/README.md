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
# *Ch09) Bind02 - select, textarea, media*
<details>
<summary>접기/펼치기</summary>
<br>

## select, textarea, media

### select, textarea 바인딩
#### bind:value
select와 textarea에도 값을 할당활때 value속성에 할당한다.
<br>

#### 예제01) select 기본
select의 경우 option에 부여된 value값이 select의 value에 할당한 변수에 값이 초기화된다.  
```svelte
<script>
  let portals = [
    { name: '사이트선택', url: null },
    /* 생략... */
  ];
  let selected;
  const selectChange = (event) => {
    console.log(selected === event.target.value)
    if (selected != null) {
      window.open(selected)
    }
  }
</script>
<div>
  <select bind:value={selected} on:change={selectChange}>
    {#each portals as portal}
      <option value={portal.url}>{portal.name}</option>
    {/each}
  </select>
</div>
```
#### 예제02) select multiple
select의 multiple은 여러개의 값을 ctrl로 선택하므로 선택된 복수개의 데이터를 bind:value 속성에 할당된 변수에 배열로 받게된다.
```svelte
<script>
  let foods = ['떡볶이','순대','오뎅','튀김'];
  let selected = []; // select의 multiple을 통한 복수 데이터 관리
  const selectChange = (event) => {
    console.log(event.target.value)
    if (selected != null) {
      window.open(selected)
    }
  }
</script>
<div>
  <select multiple bind:value={selected} on:change={selectChange}>
    {#each foods as food}
      <option value={food}>{food}</option>
    {/each}
  </select>
  #{#if selected.length = 0}
     <p>주문하실 메뉴를 선택해 주세요.</p>
  {:else}
     <p>선택메뉴: {selected}</p>
  {/if}
</div>

```
#### 예제03) textarea
textarea는 기본적으로 텍스트 노드 혹은 value 속성에 내용을 할당할 수 있다.  
svelte에서는 bind:value를 활용하여 값을 할당한다.
```svelte
<script>
  let text = '내용을 입력하세요.'
</script>
<div>
  <textarea value="value속성으로 텍스트 할당" rows="5" /><>
  <textarea rows="5">텍스트노드로 텍스트 할당</textarea>
  <textarea bind:value={text} rows="5"/>
  <p>{text}</p>
</div>
```

### media 바인딩
media에는 video태그와 audio태그 등이 있다.

#### media bind 속성 종류
- 읽기전용 속성
  |     속성      |          설명                                                 |
  |--------------|--------------------------------------------------------------|
  |  duration    | 총 재생 길이(초단위)                                            |
  |  buffered    | {start, end} 객체들의 배열, 버퍼 된 위치                         |
  |  seekable    | {start, end} 객체들의 배열, 위치를 찾을 수 있는 범위               |
  |  played      | {start, end} 객체들의 배열, 재생했던 위치                        |
  |  seeking     | 찾는중 여부 (true/false)                                       |
  |  ended       | 재생 종료 여부 (true/false)                                    |
  |  videoWidth  | video태그의 너비 (video만 사용 가능, audio는 사용 불가능)         |
  |  videoHeight | video태그의 높이 (video만 사용 가능, audio는 사용 불가능)         |

- 읽기/쓰기 속성
  |     속성      |          설명                                                 |
  |--------------|--------------------------------------------------------------|
  | currentTime  | 현재 재생 위치 (초단위)                                         |
  | playbackRate | 재생 속도 (normal: 1)                                          |
  | paused       | 일시정지 여부 (true/false)                                      |
  | volume       | 음량 크기 (0 ~ 1 사이 값)                                       |


#### 예제04) video 재생/정지/초기화 기능 및 총 재생시간, 현재 재생위치
duration, currentTime, paused 속성에 대한 bind를 적용하며, 재생/정지/초기화 기능을 구현한다.
```svelte
<script>
  let duration; // 총 재생시간
  let currentTime = 0; // 현재 재생 시간
  let paused = true; // 영상 재생 상태 (재생:false/정지:true)
  const onPlay = () => paused = false;
  const onPause = () => paused = true;
  const onInitial = () => {
    paused = true;
    currentTime = 0;
  }
</script>
<div>
  <p>From <a href="https://studio.blender.org/films">Blender Studio</a>. CC-BY</p>
  <video
    poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
    src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
    width="500"
    bind:duration={duration}
    bind:currentTime={currentTime}
    bind:paused={paused}
  >
    <track kind="captions" />
  </video>
  <br />
  <button on:click={onPlay}>재생</button>
  <button on:click={onPause}>정지</button>
  <button on:click={onInitial}>초기화</button>
  <p>총 재생시간 : { Number(duration).toFixed(0) }초</p>
  <p>현재 재생위치 : {currentTime}초</p>
</div>
```

</details>
<br>

# *[Ch10) Bind03 - this, component, dimension](../Ch10_Bind03/README.md)*
# *[Ch11) Slot - 기본문법, Fallback, named, props, fragment, $$Slots](../Ch11_Slot/README.md)*
# *[Ch12) LifeCycle01: Hook - onMount, onDestroy, beforeUpdate, afterUpdate](../Ch12_LifeCycle01_Hook/README.md)*
# *[Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick](../Ch13_LifeCycle02/README.md)*
# *[Ch14) PropDrilling과 ContextAPI](../Ch14_ContextAPI/README.md)*
# *[Ch15) Store](../Ch15_Store/README.md)*
# *[Ch16) CustomStore와 bind, ContextAPI 결합](../Ch16_CustomStore/README.md)*
# *[Ch17) CssClass](../Ch17_CssClass/README.md)*
# *[Ch18) rollup-sass](/Ch18_rollup-sass/README.md)*