<script>
	import BucketHeader from './components/BucketHeader.svelte';
	import BucketList from './components/BucketList.svelte';
	import BucketCreate from './components/BucketCreate.svelte'
	import { initialBuckets } from "./bucketData"
</script>
<div class="bucketbox">
	<BucketHeader />
	<BucketList {initialBuckets} />
	<BucketCreate />
</div>