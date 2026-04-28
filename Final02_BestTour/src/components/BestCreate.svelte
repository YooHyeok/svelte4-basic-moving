<script>
  import Icon from "@iconify/svelte"
  import { v4 as uuidv4 } from "uuid"
  const id01 = uuidv4();
  const id02 = uuidv4();
  const id03 = uuidv4();
  const id04 = uuidv4();
  let open = false;
  const onToggle = () => open = !open 
</script>
<div>
  <form class="createform" class:active={open}>
    <fieldset>
      <legend>여행 추가하기</legend>
      <label for={id01}>여행명 : </label>
      <input type="text" id={id01} name="name" required>
      <label for={id02}>가격 : </label>
      <input type="text" id={id02} name="price" required placeholder="숫자로만 입력하세요">
      <label for={id03}>이미지경로 : </label>
      <input type="text" id={id03} name="image" required>
      <br>
      <label for={id04} class="dlabel">설명 : </label>
      <textarea row="5" name="descript" id={id04} required/>
      <br>
      <button type="submit">여행추가하기</button>
    </fieldset>
  </form>
  <button class="circlebox" on:click={onToggle}>
    <Icon icon="ic:round-add" />
  </button>
</div>