<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

export let provider: ProviderInfo;
let updateInProgress = false;

async function performUpdate(provider: ProviderInfo) {
  updateInProgress = true;

  await window.updateProvider(provider.internalId);

  updateInProgress = false;
}
</script>

{#if provider.updateInfo && provider.updateInfo.version}
  <button
    disabled="{updateInProgress}"
    on:click="{() => performUpdate(provider)}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start ">
      {#if updateInProgress}
        <div class="mr-20">
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        </div>
      {:else}
        <i class="fas fa-box-open" aria-hidden="true"></i>
      {/if}
    </span>
    Update to {provider.updateInfo.version}
  </button>
{/if}
