<script lang="ts">
import { contributions } from '../../stores/contribs';
let ociImage: string;

let installInProgress: boolean = false;
let errorInstall: string = '';
let logs: string[] = [];

async function installDDExtensionFromImage() {
  logs.length = 0;
  installInProgress = true;
  // download image
  await window.ddExtensionInstall(
    ociImage,
    (data: string) => {
      logs = [...logs, data];
    },
    (error: string) => {
      installInProgress = false;
      errorInstall = error;
    },
  );
  logs = [...logs, '☑️ installation finished !'];
  installInProgress = false;
  ociImage = '';
}

function deleteContribution(extensionName: string) {
  window.ddExtensionDelete(extensionName);
}
</script>

<div class="flex flex-col h-min">
  <div class="flex flex-1 flex-col p-2 ">
    <p class="capitalize text-xl">Docker Desktop Extensions</p>
    <p class="text-xs">There is an ongoing support of Docker Desktop UI extensions from Podman Desktop.</p>
    <p class="text-xs italic">
      You may try to install some of these extensions by providing the image providing the extension.
    </p>
    <p class="text-xs italic">
      Example: aquasec/trivy-docker-extension:latest for Trivy extension or redhatdeveloper/openshift-dd-ext:latest for
      the OpenShift extension.
    </p>

    <div class="container mx-auto w-full mt-4 flex-col">
      <div class="flex flex-col mb-4">
        <label for="ociImage" class="block mb-2 text-sm font-medium text-gray-300">Image name:</label>
        <input
          name="ociImage"
          id="ociImage"
          bind:value="{ociImage}"
          placeholder="Name of the Image"
          class="text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
          required />
      </div>

      <button
        on:click="{() => installDDExtensionFromImage()}"
        disabled="{ociImage === undefined || ociImage === '' || installInProgress}"
        class="pf-c-button pf-m-primary"
        type="button">
        {#if installInProgress}
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        {/if}
        <span class="pf-c-button__icon pf-m-start ">
          <i class="fas fa-arrow-circle-down ml-6" aria-hidden="true"></i>
        </span>
        Install extension from the OCI image
      </button>

      {#if errorInstall !== ''}
        <div class="bg-red-300 text-gray-900 m-4">
          {errorInstall}
        </div>
      {/if}

      {#if logs.length > 0}
        <div class="bg-zinc-700 text-gray-200 m-4 ">
          {#each logs as log}
            <p class="font-light text-sm">{log}</p>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  {#if $contributions.length > 0}
    <div class="flex border-t-2 border-purple-500 flex-1 flex-col m-4 p-2">
      <p>Installed extensions:</p>
      <div class="grid gap-4 grid-cols-4 py-4">
        {#each $contributions as contribution, index}
          <div class="flex flex-col bg-purple-700 h-[100px]">
            <div class="flex justify-end flex-wrap ">
              <button
                class="inline-block text-gray-100 dark:text-gray-100 hover:text-gray-400 dark:hover:text-gray-400 focus:outline-none rounded-lg text-sm p-1.5"
                type="button">
                <i
                  class="fas fa-times"
                  on:click="{() => deleteContribution(contribution.extensionId)}"
                  aria-hidden="true"></i>
              </button>
            </div>
            <div class="flex flex-col p-3">
              <p class="text-sm">{index + 1}. {contribution.extensionId}</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
