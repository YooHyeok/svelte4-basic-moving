<script>
  import { count } from '../store/writable'
  import Increment from './Increment.svelte'
  import Decrement from './Decrement.svelte'
  import Reset from './Reset.svelte'
</script>
<div>
  <h1>01) Writable - 자동 구독</h1>
  <h4>값: { $count }</h4>
  <Increment/>
  <Decrement/>
  <Reset/>
</div>