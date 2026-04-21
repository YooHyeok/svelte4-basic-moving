<script>
	import BucketHeader from './components/BucketHeader.svelte';
	import BucketList from './components/BucketList.svelte';
	import BucketCreate from './components/BucketCreate.svelte'
	import { initialBuckets } from "./bucketData"

	let buckets = initialBuckets;
	$:chkCount = buckets.filter(bucket => !bucket.chk).length;

  const onToggle = () => {
  	buckets = buckets; // 재할당으로 반응성 트리거
	}

	const onRemove = (id) => {
		buckets = buckets.filter(bucket => bucket.id !== id)
	}

	let editMode = ''

	/** 수정모드 시작 */
	const onEditMode = id => editMode = id
	/** 수정모드 종료 (수정시점에 수정 후 호출) */
	const offEditMode = () => editMode = ''
	/** 수정한 값을 buckets에 담는 함수 (keyup 함수에서 호출) */
	const onEditItem = (editBucket) => {
		buckets = buckets.map(bucket => {
			if (bucket.id === editBucket.id) {
				bucket = editBucket
			}
			return bucket;
		})
		offEditMode();
	}
	/** input에서 enter시 데이터 수정 및 수정상태 완료 처리 함수 */
	const onEditKeyup = (e, editBucket) => {
		if (e.keyCode === 13) {
			onEditItem(editBucket);
		}
	}

	import { v4 as uuidv4 } from 'uuid'
  let bucketText = '';
  const onSubmit = (e) => {
    e.preventDefault();
    if (bucketText) {
      const bucket = {
        id: uuidv4(),
        text: bucketText,
        chk: false
      }
      buckets = [...buckets, bucket]
    }
  }
	
</script>
<div class="bucketbox">
	<BucketHeader {chkCount} />
	<BucketList 
		{buckets} {onToggle} {onRemove} 
		{editMode} {onEditMode} {onEditKeyup}
	/>
	<BucketCreate 
		bind:bucketText {onSubmit}
	/>
</div>
