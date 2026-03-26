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
# *Ch07) 마크업 반복문 Each Block*
<details>
<summary>접기/펼치기</summary>
<br>

1. 기본 문법
2. index(순번)
3. 객체 배열과 구조분해 할당
4. key(고유값)

## Each Block
script 영역 뿐만 아니라 마크업 영역에서도 반복작업이 필요하다.  
예를들어 쇼핑몰의 경우 상품목록이 매우 많다.  
상품 목록을 일일이 하드코딩으로 나열하지 않고 반복문을 통해 한 작업만 처리하고 나머지는 반복하여 출력한다.  

### 01) 기본 문법
`{#each} ~ {/each}` 형태로 구성되어 있으며, 중괄호 내 #each 우측으로 배열로 구성된 데이터를 선언하고, as키워드와 함께 해당 배열을 순회며 반복적으로 값을 할당받을 임의의 변수를 선언한다.  
```svelte
{#each datas as data}
  {data}
{/each}
```

#### 예제) select option 반복
```svelte
<script>
  let weekDays = ['일', '월', '화', '수', '목', '금', '토'] 
</script>
<div>
  <select>
    {#each weekDays as weekday}
    <option>{weekday}요일</option>
    {/each}
  </select>
</div>
```

### 02) index(인덱스)
순회할 배열의 인덱스 순번을 부여하여 관리한다.  
아래와 같이 기본 문법의 배열 순회 데이터를 할당할 변수에 쉼표(콤마)로 구분한 뒤 변수를 선언하면 해당 변수를 인덱스로 받아 사용할 수 있다.  
```svelte
{#each datas as data, index}
{/each}
```

#### 예제) 2023 KBO 정규리그 순위 예제
```svelte
<script>
  let teams = ['LG 트윈스','KT 위즈','SSG 랜더스','NC 다이노스','두산 베어스','KIA 타이거즈','롯데 자이언츠','삼성 라이온즈','한화 이글스','키움 히어로즈'];
</script>
<div>
  <h3>2023 KBO 정규리그순위</h3>
  {#each teams as team, i}
  <p>{i + 1}위 : {team}</p>
  {/each}
</div>
```
당연히 인덱스 접근으로도 가능하다.  
```svelte
<div>
  {#each teams as team, i}
  <p>{i + 1}위 : {teams[i]}</p>
  {/each}
</div>
```

### 03) 객체 배열 반복처리
```svelte
<script>
  let langs = [{ id: 1, name: '스벨트(Svelte)', release: 2016, src: '~', }, ];
</script>
<div>
  {#each langs as lang}
    <div style="bolder: 2px solid black; width: 200px; padding: 10px;">
      <h4>이름 : {lang.name}</h4>
      <h4>배포년도 : {lang.release}</h4>
      <img src={lang.src} alt={lang.name} height="50">
    </div>
  {/each}
</div>
```
#### 객체 구조분해 할당
배열 내 객체를 구조분해 할당도 가능하다.  
as 키워드 우측으로 중괄호 내에 객체의 속성들을 나열한다.  
```svelte
<script>
  let langs = [{ id: 1, name: '스벨트(Svelte)', release: 2016, src: '~', }, ];
</script>
<div>
  {#each langs as {id, name, release, src}} <!-- 객체 속성 나열 -->
    <div style="bolder: 2px solid black; width: 200px; padding: 10px;">
      <h4>이름 : {name}</h4>
      <h4>배포년도 : {release}</h4>
      <img src={src} alt={name} height="50">
    </div>
  {/each}
</div>
```

### 04) key(고유값)
each 블록에 key를 사용하는 것은 데이터 목록이 변경(삭제/추가) 될 때 DOM 노드를 효율적으로 재사용 혹은 업데이트하여 성능을 최적화 하고 오류를 방지하기 위해 필요하다.  
이 경우 index를 사용할 수도 있으나, index를 사용할 경우 시점문제로 고유값이 중복처리 되는 등 렌더링 버그가 발생할 수 있다.  
실제로, React나 Vue에서도 index를 key로 사용할 경우 컴포넌트의 깊이가 매우 깊을 때 변경되는 시점의 차이로 인해 key가 꼬여 렌더링에 버그가 발생하는 경우가 발생한다.  
```svelte
<script>
  let datas = [{id: 1}]
</script>
{#each datas as data, index (data.id)}
{/each}
```

key를 지정할 때 index를 생략할 수는 있지만 선언부 위치를 바꿀 수는 없다
```svelte
<script>
  let datas = [{id: 1}]
</script>
{#each datas as data (data.id)}
{/each}
```
</details>
<br>

# *[Ch08) Bind01 - input (value, checked, group)](../Ch08_Bind01/README.md)*
# *[Ch09) Bind02 - select (multiple), textarea, media](../Ch09_Bind02/README.md)*
# *[Ch10) Bind03 - this, component, dimension](../Ch10_Bind03/README.md)*
# *[Ch11) Slot - 기본문법, Fallback, named, props, fragment, $$Slots](../Ch11_Slot/README.md)*
# *[Ch12) LifeCycle01: Hook - onMount, onDestroy, beforeUpdate, afterUpdate](../Ch12_LifeCycle01_Hook/README.md)*
# *[Ch13) LifeCycle02: 응용 - elizabot 활용 채팅, tick](../Ch13_LifeCycle02/README.md)*
# *[Ch14) PropDrilling과 ContextAPI](../Ch14_ContextAPI/README.md)*
# *[Ch15) Store](../Ch15_Store/README.md)*
# *[Ch16) CustomStore와 bind, ContextAPI 결합](../Ch16_CustomStore/README.md)*
# *[Ch17) CssClass](../Ch17_CssClass/README.md)*
# *[Ch18) rollup-sass](/Ch18_rollup-sass/README.md)*