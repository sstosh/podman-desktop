<script lang="ts">
export let title: string;
export let subtitle: string = '';
export let searchTerm = '';
</script>

<div class="flex flex-col min-h-full">
  <div class="min-w-full">
    <div class="flex">
      <div class="pt-5 px-5">
        <p class="text-xl capitalize">{title}</p>
        <p class="text-sm text-gray-400">
          {subtitle}
        </p>
      </div>
    </div>
    <div class="flex flex-row">
      <div class="pt-2 px-5 lg:w-[35rem] w-[22rem]">
        <div class="flex items-center bg-gray-700 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 ml-2 mr-2 "
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            bind:value="{searchTerm}"
            type="text"
            name="containerSearchName"
            placeholder="Search {title}...."
            class="w-full py-2 outline-none text-sm bg-gray-700" />
        </div>
      </div>
      <div class="flex flex-1 justify-end">
        <div class="py-5 px-5">
          <slot name="additional-actions">&nbsp;</slot>
        </div>
      </div>
    </div>

    <slot name="table" />
  </div>

  <div class="flex flex-col container flex-1">
    <slot name="empty" />
  </div>
</div>
