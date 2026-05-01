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
  (fallback 속성을 사용하기 위해서는 Custom Transition을 구현해야한다)
</details>
<br>

## Custom Transition
<details>
<summary>접기/펼치기</summary>
<br>

1. 트랜지션 함수
2. CSS 트랜지션
3. tick을 통한 JS 트랜지션 처리
4. crossfade fallback 적용

### 트랜지션 함수
Svelte에서 제공하는 트랜지션 외의 트랜지션이 필요할 때, 개발자가 직접 만들 수 있다.  
커스텀 트랜지션은 CSS와 JS를 사용하여 제작할 수 있고, crossfade에서 추가할 수도 있다.  

#### 기본 문법
```svelte
<script>
  function 트랜지션함수명(HTML요소, {파라미터}) {
    return {
      파라미터,
      css: (t, u) => {}, // css 트랜지션 사용시 처리
      tick: (t, u) => {}, // js 트랜지션 사용시 처리
  }
}
</script>
<태그 transition:트랜지션함수명={파라미터}/>
<태그 in:트랜지션함수명={파라미터} out:트랜지션함수명={파라미터}/>
```

### CSS 트랜지션
#### css 속성 문법
```js
{
  css: (t, u) => { /* css 코드 리턴 */ }
}
```
매개변수 t와 u는 Svelte가 매 프레임마다 CSS함수에 전달하는 값이다.
##### 매개변수 t, u
- t  
 Transition Progrss로 트랜지션의 진행률이다.  
 duration에 따라 Svelte가 자동으로 계산해서 넘겨준다.
  - in(나타날때): `0.00 → 0.01` → ... → `0.99 → 1.00`
  - out (사라질 때): `1.00 → 0.99` → ... → `0.01 → 0.00`
예를들어 `duration: 1000`일 경우 1초동안 약 60번(60fps) 호출되면서 t가 점진적으로 변한다.  
- u: 1-t (t의 반대 값)  
  별도 계산 없이 반대값을 바로 쓸 수 있도록 제공해주는 파라미터이다.  

### Tick(JS) 트랜지션
#### tick 속성 문법
```js
{
  tick: (t, u) => { /* js 코드 리턴 */ }
}
```
매개변수 t와 u는 css 트랜지션과 동일한 원리를 갖는다.  

### crossfade와 fallback
Svelte 내장 트랜지션 중, 커스텀 트랜지션을 정의하여 사용 가능한 트랜지션 효과로 crossfade가 있으며, crossfade의 이러한 기능을 fallback이라고 정의한다.  

crossfade는 `A영역 → B영역`으로 혹은 `B영역 → A영역`으로 와 같이 두 요소가 쌍으로 짝을지어 한쪽 위치에서 사라지고 다른쪽 위치에서 나타날때 적용되는 효과이다.

이때, 두 요소 중, 한쪽에서 신규로 추가되거나 제거될때에는 crossfade 효과를 줄 수 없다.  
이와 같이 짝을 짓지 못하는 경우 대신 사용할 트랜지션을 등록하도록 제공하는 기능이 fallback이다.  

```svelte
<script>
  import { crossfade } from 'svelte/transition'
  const [send, recieve] = crossfade({
    /*파라미터 */
    , fallback (node, params) {
      return {
        css: (t, u) => {}, // css 트랜지션 사용시 처리
        tick: (t, u) => {}, // js 트랜지션 사용시 처리
      }
    }
  })
</script>
```
위와 같이 파라미터 객체 안에 속성정의가 아닌 fallback이라는 이름의 함수형태로 정의하여 바로 사용할 수 있다.  
첫번쨰 매개변수 `node`는 현재 crossfade가 적용된 요소의 node객체이며,  
두번째 매개변수 `params`는 recieve 혹은 send에 할당한 파라미터 객체이다.  

</details>
<br>

## 이벤트와 수식어
<details>
<summary>접기/펼치기</summary>
<br>

1. 트랜지션 이벤트
2. 트랜지션 

### 트랜지션 이벤트
Svelte는 자바스크립트에서는 제공하지 않는 트랜지션 이벤트(Transition Events)를 제공한다.  

트랜지션 이벤트는 트랜지션이 언제 시작되고 끝나는지 알려준다.  

- 트랜지션 이벤트 종류
  | 이벤트명 | 설명 |
  |-----------|------|
  | introstart | 요소가 나타나는 트랜지션의 시작 이벤트이다. |
  | introend | 요소가 나타나는 트랜지션의 종료 이벤트이다. |
  | outrostart | 요소가 사라지는 트랜지션의 시작 이벤트이다. |
  | outroend | 요소가 사라지는 트랜지션의 종료 이벤트이다. |

```svelte
<태그 on:트랜지션이벤트명={실행 문장 혹은 함수}>
```

### 트랜지션 수식어(Modifier)
Svelte에서 이벤트 바인딩 문법을 사용할때 이벤트 옆에 파이프 문자(|)를 붙이고 수식어를 작성한다.

```svelte
<태그 on:트랜지션이벤트명|수식어={실행 문장 혹은 함수}>
```

#### 수식어 local
트랜지션 이벤트에 존재하는 수식어로 local이 있다.  
상위 템플릿 블록({#if} 혹은 {#each} 등)에 요소가 추가될 경우에만 트랜지션이 동작한다.  
(여기서 말하는 상위 템플릿 블록은 트랜지션과 local이 적용된 요소가 속한 템플릿 블록의 상위 템플릿 블록을 말한다.)
```svelte
<태그 on:트랜지션이벤트명|local={실행 문장 혹은 함수}>
```

아래 예제는 체크박스와 range를 통해 트랜지션 효과를 부여한 예제이다.  
slide이벤트이 local을 적용함으로써 showItems가 적용된 블록에서는 transition이 적용되지 않게 처리했다.  
```svelte
<script>
  import { slide } from 'svelte/transition';

  let showItems = true;
  let i = 5;
  let items = ['첫', '두', '세', '네', '다섯'];
</script>

<label>
  <input type="checkbox" bind:checked={showItems}> 전부 보이게 처리
</label>
<label>
  <input type="range" bind:value={i} max=5>
</label>

{#if showItems}
  {#each items.slice(0, i) as item}
    <div transition:slide|local>{item}번째 리스트</div>
  {/each}
{/if}
```

</details>
<br>

</details>
<br>

# *[Ch20) Animation](../Ch20_Animation/README.md)*
# *[Ch21) Motion](../Ch21_Motion/README.md)*
# *[Ch22) Action](../Ch23_SpecialElement/README.md)*
# *[Ch23) SpecialElement](../Ch23_SpecialElement/README.md)*
# *[Ch24) Lib_Iconify](../Ch24_Lib_Iconify/README.md)*
# *[Ch25) Lib_UUID](../Ch25_Lib_UUID/README.md)*
# *[Ch26) Router](../Ch26_Router/README.md)*
# *[Ch27) HttpAxios](../Ch27_HttpAwaitBlock/README.md)*

# *부록) Key Block*
<details>
<summary>접기/펼치기</summary>
<br>

## Key Block이란?
`{#key}` 블록은 표현식 값이 변경될 때 블록 내부의 마크업과 컴포넌트를 **파괴하고 재생성**하는 기능이다.  
주로 트랜지션을 다시 실행시키거나, 특정 값에 종속된 컴포넌트를 강제로 다시 초기화하고 싶을 때 사용한다.  

Vue의 경우 `:key` 속성을 변경하여 컴포넌트를 강제로 재마운트하는 패턴과 동일한 개념이다.  
```vue
<script setup>
  import Counter from './Counter.vue'
  import { ref } from 'vue'
  const resetKey = ref(0)
  const reset = () => resetKey.value++
</script>
<template>
  <button @click="reset">초기화</button>
  <Counter :key="resetKey" />
</template>
```

React 또한 컴포넌트의 `key` prop을 변경하면 React가 해당 컴포넌트를 unmount/mount 처리한다.  
```jsx
import { useState } from 'react'
import Counter from './Counter'

function App() {
  const [resetKey, setResetKey] = useState(0)
  return (
    <>
      <button onClick={() => setResetKey(k => k + 1)}>초기화</button>
      <Counter key={resetKey} />
    </>
  )
}
```

Svelte는 이를 마크업 영역에서 블록 형태로 제공한다는 점이 다르다.  

```svelte
{#key 표현식}
  <!-- 표현식이 변경될 때마다 파괴 후 재생성되는 마크업 -->
{/key}
```

표현식 값이 바뀌면 블록 내부의 DOM과 컴포넌트가 새로 생성되며, `onMount` 등 라이프사이클 훅도 다시 실행된다.  

## 사용 시나리오

### 1) 트랜지션 재실행
일반적으로 트랜지션은 요소가 DOM에 추가되거나 제거될 때만 실행된다.  
값이 변경되더라도 같은 요소가 유지되면 트랜지션이 다시 실행되지 않는다.  
`{#key}`로 감싸면 값 변경 시 요소가 파괴/재생성되어 진입 트랜지션이 다시 실행된다.  

```svelte
<script>
  import { fade } from 'svelte/transition'
  let count = 0
</script>

<button on:click={() => count++}>증가</button>
{#key count}
  <div in:fade={{duration: 500}}>현재 값: {count}</div>
{/key}
```

버튼 클릭 시마다 `count` 값이 변경되면서 fade 트랜지션이 매번 재실행된다.  

### 2) 컴포넌트 강제 재초기화
자식 컴포넌트의 내부 상태를 초기 상태로 되돌리고 싶을 때 사용할 수 있다.  
컴포넌트가 새로 생성되므로 내부의 `let` 변수들이 초기값으로 재설정된다.  

```svelte
<script>
  import Counter from './Counter.svelte'
  let resetKey = 0
  const reset = () => resetKey++
</script>

<button on:click={reset}>초기화</button>
{#key resetKey}
  <Counter />
{/key}
```

`Counter` 컴포넌트 내부에 어떤 상태가 있더라도 버튼 클릭 시 새로 생성되어 모든 내부 상태가 초기화된다.  

### 3) 외부 라이브러리 인스턴스 재생성
차트 라이브러리나 지도 라이브러리처럼 외부 인스턴스를 사용하는 컴포넌트의 경우, 데이터가 변경되어도 자체적으로 갱신되지 않는 경우가 있다.  
이 때 `{#key}`로 감싸 데이터 변경 시 컴포넌트를 재생성하면 인스턴스도 함께 새로 만들어진다.  

```svelte
<script>
  import Chart from './Chart.svelte'
  export let chartData
</script>

{#key chartData}
  <Chart data={chartData} />
{/key}
```

## 주의사항
`{#key}`는 블록 내부를 통째로 파괴/재생성하기 때문에 비용이 큰 작업이다.  
단순 값 동기화에는 적합하지 않으며, 반응성이 필요한 경우 `$:` 반응성 구문을 우선 고려해야 한다.  

```svelte
<!-- 잘못된 사용: 단순 값 변경에 key block 사용 -->
{#key user}
  <p>{user.name}</p>  <!-- $: 으로도 충분히 갱신됨 -->
{/key}

<!-- 올바른 사용: 트랜지션, 외부 인스턴스, 강제 재초기화 등 -->
{#key user.id}
  <Profile {user} />  <!-- user 변경 시 Profile을 새로 생성 -->
{/key}
```

## 다른 프레임워크와의 비교

| 프레임워크 | 문법 | 동작 |
|-----------|------|------|
| Svelte | `{#key 값}...{/key}` | 마크업 영역의 블록을 파괴/재생성 |
| Vue | `<Component :key="값"/>` | 컴포넌트 props로 key 전달 시 재마운트 |
| React | `<Component key={값}/>` | 컴포넌트 props로 key 전달 시 unmount/mount |

Vue와 React는 컴포넌트 단위로만 가능하지만, Svelte의 `{#key}`는 **컴포넌트가 아닌 마크업 영역에도 적용 가능**하다는 차이가 있다.  

</details>
<br>
