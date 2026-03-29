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
# *Ch19) Transition*
<details>
<summary>접기/펼치기</summary>
<br>

1. fade
2. blur & slide
3. scale & fly
4. draw & crossfade
5. custom transition

## Transition
트랜지션은 HTML 요소에서 화면전환 효과(나타나거나 사라지는) 기능이다.  
jQuery의 fadeIn/fadeOut, slideDown/slideUp과 같은 효과이다.

## fade
<details>
<summary>접기/펼치기</summary>
<br>

1. transition 지시문
2. fade 기본 예제
3. fade 파라미터
4. in: & out: 지시문 활용

### transition 지시문
Svelte는 `transition:` 지시문을 이용하여 콘텐츠 요소의 화면전환 효과를 준다.  

`transition:` 지시문은 `bind:`나 `let:` 혹은 `class:` 처럼 사용되는 지시문이다.  

지시문은 특정 명령을 저장하고 있는 것인데, `transition:`은 나타나고 사라지는 화면전환을 주는 명령을 갖고 있다.  

```svelte
<script>
  import { 트랜지션명 } from 'svelte/transition';
</script>
<태그요소 transition:트랜지션명={{파라미터}} />
```

모든 transition은 요소가 DOM에 추가/제거 될 때 동작하므로, `{#if}` 또는 `{#each}`와 같이 요소가 생성/소멸 되는 블록과 함께 사용해야 한다.  
(이는 Vue와 React도 마찬가지다.)  

#### 트랜지션 종류

| 트랜지션명 | 설명 |
|-----------|------|
| fade | 요소의 투명도를 이용해 애니메이션한다. |
| blur | 요소의 블투명도와 함께 흐림필터를 애니메이션에 적용한다. |
| slide | 요소를 상단 혹은 좌측 기준으로 나타나거나 사라지한. |
| scale | 요소의 블투명도와 크기에 애니메이션을 적용한다. |
| fly | 요소의 x, y 위치와 블투명도에 애니메이션을 전환한다. |
| draw | SVG요소를 애니메이션 적용한다. |

### fade 기본
```svelte
<태그요소 transition:fade />
```
fade 효과는 사라지면서 발생하는 효과이다.  
다른 transition 효과와 같이 if 블록과 함께 사용된다.  
if 블록으로 조건에의해 출력/미출력시 fade가 적용된다.

아래는 체크박스를 선택 여부에 따라 출력/해제로 인한 fade효과를 적용한 코드이다.  

#### 예제)
```svelte
<script>
  import { fade } from 'svelte/transition'
  let visible = false
</script>
<div>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
    <p transition:fade>Svelte Fade Effect</p>
  {/if}
</div>
```

### fade 파라미터
fade 효과에 세부 옵션을 지정하는 방식이다.  
객체 형태로 옵션을 할당한다.  

```svelte
<태그요소 transition:fade={{파라미터}} />
```
파라미터는 object 형태이기 때문에 중괄호를 2번 작성해야 한다.  

- fade 파라미터 종료
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |

[Svelte 가이드: easing](https://svelte.dev/docs/svelte/svelte-easing)

#### 예제)
아래 코드는 파라미터로 fade 효과의 세부 설정을 하며, easing을 추가 적용한다.  
- delay 500을 통해 0.5 초 기다린 후 출력
- duration 1000을 통해 1초동안 변화 진행
- easing의 경우 slide나 fly등 움직이는 효과에 주는것이 더 디테일하게 보인다.  
  fade는 위치를 유지하며 출력되는 효과이므로, 움직임이 없어 다이나믹한 효과를 기대하기 어렵다.
```svelte
<script>
  import { fade } from 'svelte/transition'
  import { elasticInOut } from 'svelte/easing'
  
  let visible = false
</script>
<div>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    transition:fade={{
      delay: 500, // 0.5초 딜레이 후 출력
      duration: 1000, // 1초간 변화
      easing: elasticInOut, // 
    }}
  >Svelte Fade Effect</p>
  {/if}
</div>
```

### fade 파라미터와 in: & out:
fade가 적용되는 시점과 해제되는 시점 각각을 다르게 파라미터로 설정할 수 있다.  
적용되는 시점은 in 지시문을, 해제되는 시점은 out 지시문을 transiton지시문 대신 사용한다.  

```svelte
<태그요소 
  in:fade={{파라미터}} 
  out:fade={{파라미터}} 
/>
```

#### 예제)
```svelte
<script>
  import { fade } from 'svelte/transition'
  let visible = false
</script>
<div>
  <h4>fade - in: out:</h4>
  <label>
    <input type="checkbox" bind:checked={visible} />보임
  </label>
  {#if visible}
  <p 
    in:fade={{ duration:400 }}
    out:fade={{ duration:0 }}
  >Svelte Fade Effect</p>
  {/if}
</div>
```
</details>
<br>

## Blur & Slide
<details>
<summary>접기/펼치기</summary>
<br>

1. blur의 파라미터
2. blur의 in: & out: 지시문
3. slide의 파라미터
4. slide의 in: & out: 지시문

### Blur
요소의 불투명도와 흐름을 사용해서 나타나거나 사라지게 한다.  
fade효과처럼 간단하게 blur로만 호출할 수도 있고, 파라미터를 통해 세부적으로 표현할 수도 있다.  

```svelte
<태그요소 transition:blur>
<태그요소 transition:blur={{파라미터}}>
```

- blur 파라미터 종료
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | opacity | 애니메이션의 투명도 값을 지정할 수 있다.<br>기본 값은 0이다. |
  | amount | blur의 size를 지정한다. 기본값은 5이다.<br>일반적으로 수치로 지정하지만 css의 단위를 사용하면 문자열이라 따옴표 내부에 사용한다. |

### blur 파라미터와 in: & out:
fade와 같이 적용되는 시점과 해제되는 시점 각각을 다르게 파라미터로 설정할 수 있다.  
적용되는 시점은 in 지시문을, 해제되는 시점은 out 지시문을 transiton지시문 대신 사용한다.  
```svelte
<태그요소 
  in:blur={{파라미터}} 
  out:blur={{파라미터}} 
/>
```

### Slide
요소를 상단 혹은 좌측 기준으로 나타나거나 사라지게 한다.  
fade와 blur 효과처럼 파라미터를 적용할 수 있다.   

```svelte
<태그요소 transition:slide>
<태그요소 transition:slide={{파라미터}}>
```

- slide 파라미터 종료
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | axis | 전환이 발생되는 축이다. 기본값은 y이므로 상단으로부터 시작한다.<br>값은 x 혹은 y 모두 가능하며, 문자을이므로 따옴표 내부에 작성해야 한다. |

### slide 파라미터와 in: & out:
fade와 같이 적용되는 시점과 해제되는 시점 각각을 다르게 파라미터로 설정할 수 있다.  
적용되는 시점은 in 지시문을, 해제되는 시점은 out 지시문을 transiton지시문 대신 사용한다.  
```svelte
<태그요소 
  in:slide={{파라미터}} 
  out:slide={{파라미터}} 
/>
```

</details>
<br>

## Scale & Fly
<details>
<summary>접기/펼치기</summary>
<br>

1. scale의 파라미터
2. scale의 in: & out: 지시문
3. fly의 파라미터
4. fly의 in: & out: 지시문

### Scale
요소의 불투명도와 크기에 애니메이션을 적용한다.  
fade, blur, slide 효과처럼 간단하게 scale로만 호출할 수도 있고, 파라미터를 통해 세부적으로 표현할 수 있다.

```svelte
<태그요소 transition:scale>
<태그요소 transition:scale={{파라미터}}>
```

- scale 파라미터 종료
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | start | 최소로 작아지는 크기 값을 지정한다.<br>기본 값은 0이고, 0~1사이로 수치를 작성한다. |

### scale 파라미터와 in: & out:
fade와 같이 적용되는 시점과 해제되는 시점 각각을 다르게 파라미터로 설정할 수 있다.  
적용되는 시점은 in 지시문을, 해제되는 시점은 out 지시문을 transiton지시문 대신 사용한다.  
```svelte
<태그요소 
  in:scale={{파라미터}} 
  out:scale={{파라미터}} 
/>
```

### Fly
요소의 x,y 위치와 불투명도에 애니메이션을 전환한다.   
fade, blur, slide, sclae 효과처럼 간단하게 scale로만 호출할 수도 있고, 파라미터를 통해 세부적으로 표현할 수 있다.  


```svelte
<태그요소 transition:fly>
<태그요소 transition:fly={{파라미터}}>
```

- fly 파라미터 종료
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | x | 요소의 x offset값이다.<br>기본 값은 0이므로 속성값을 변화하지 않으면 움직이지 않는다. |
  | y | 요소의 y offset값이다.<br>기본 값은 0이므로 속성값을 변화하지 않으면 움직이지 않는다. |

### fly 파라미터와 in: & out:
fade와 같이 적용되는 시점과 해제되는 시점 각각을 다르게 파라미터로 설정할 수 있다.  
적용되는 시점은 in 지시문을, 해제되는 시점은 out 지시문을 transiton지시문 대신 사용한다.  
```svelte
<태그요소 
  in:fly={{파라미터}} 
  out:fly={{파라미터}} 
/>
```

</details>
<br>

## draw & crossfade
<details>
<summary>접기/펼치기</summary>
<br>

1. draw & 파라미터
2. crossfade란?
3. 버킷리스트 crossfade

### draw
SVG 요소에 애니메이션을 적용한다.  
마치 그림을 그리는 것과 같은 효과를 볼 수 있다.  
다른 프레임워크들은 해당 효과를 주기 위해 외부 플러그인을 설치해야 하지만 Svelte는 해당 기능을 내장하고 있다.  

- draw 파라미터 종류
  | 파라미터명 | 설명 |
  |-----------|------|
  | delay | 효과를 지연시키는 속성이다.<br>기본값은 0이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | duration | 변화가 일어나는 시간이다.<br>기본값은 400이고, 숫자로 작성한다.<br>단위는 밀리초 단위이다. |
  | easing | 변화에 속도감을 주는 속성이다.<br>easing함수명을 작성하면 된다.<br>기본값은 linear이다.<br>사용시 easing플러그인을 붙여줘야 한다. |
  | speed | 그려지는 속도를 의미한다. 길이/속도라고 보면 된다.<br>예를들어 speed값을 1로 주게 되면 1000px의 경로는 1000ms를 갖게 된다.<br>수치가 클수록 시간은 줄고, 수치가 작아질 수록 시간은 늘어난다. |

최종적으로 그림을 다 그리는 시간은 duration이기 때문에 초반에 속도가 빠르면 후반에 느려지게 된다.  

### crossfade
지금까지의 요소가 나타나거나 사라지게 하는 Transition 효과와는 다르다.  
전송과 수신이라는 한 쌍의 화면 전환 효과가 일어난다.  

A영역과 B영역이 있다고 가정한다.  
A영역에서 crossfade를 받은 요소를 B영역으로 전송하면 B영역에서 수신하게 되고, 이때 화면전환전환 효과가 발생한다.  

```svelte
<script>
  import { crossfade } from 'svelte/transition'
  const [send, receive] = crossfade({/* 파라미터 */})
</script>
<A구역요소 out:send={{key}}></A구역요소>
<A구역요소 out:recieve={{key}}></A구역요소>
```
key는 이동할 요소에 해당한다.  

- crossfade 파라미터
  delay, duration, easing 이외에 fallback이라는 파라미터가 추가된다.  
  fallback은 이동할 대상이 없는 경우 실행되는 트래지션을 정의한다.  
  (fallback 속성을 사용하기 위해서는 Custon Transition을 구현해야한다)
</details>
<br>

</details>
<br>

