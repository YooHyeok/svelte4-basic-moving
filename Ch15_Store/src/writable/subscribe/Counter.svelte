<script>
  import { count } from '../../store/writable'
  import Increment from './Increment.svelte'
  import Decrement from './Decrement.svelte'
  import Reset from './Reset.svelte'

  let countValue;
  const unsubscribe = count.subscribe((value) => countValue = value)
</script>
<div>
  <h1>01) Writable - 수동 구독</h1>
  <h4>값: { countValue }</h4>
  <Increment/>
  <Decrement/>
  <Reset/>
</div>