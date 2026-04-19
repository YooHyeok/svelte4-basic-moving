<script>
  import BucketItem from "./BucketItem.svelte";
  export let initialBuckets;
</script>
<div class="bucketlist">
  {#each initialBuckets as bucket (bucket.id)}
    <BucketItem {bucket}/>
  {/each}
</div>