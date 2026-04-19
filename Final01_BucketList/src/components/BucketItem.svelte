<script>
  import Icon from "@iconify/svelte"
  import { v4 as uuidv4 } from 'uuid'

  let chkId = uuidv4();
  export let bucket;
</script>
<div class="bucketitem">
  <!-- 화면 밖으로 날림 -->
  <input type="checkbox" id={chkId} bind:checked={bucket.chk}>
  <label for={chkId} class="checkcircle">
    <Icon icon="ic:round-check" />
  </label>
  <p>
    {bucket.text}
  </p>
  <button class="remove">
    <Icon icon="gridicons:trash" />
  </button>
</div>