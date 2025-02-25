<script lang="ts">
import { onDestroy, onMount } from 'svelte';
import { filtered, searchPattern } from '../stores/containers';

import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import ContainerIcon from './ContainerIcon.svelte';
import { router } from 'tinro';
import type { ContainerInfoUI } from './container/ContainerInfoUI';
import ContainerActions from './container/ContainerActions.svelte';
import ContainerEmptyScreen from './container/ContainerEmptyScreen.svelte';
import Modal from './dialogs/Modal.svelte';
import { ContainerUtils } from './container/container-utils';
import { providerInfos } from '../stores/providers';
import NoContainerEngineEmptyScreen from './image/NoContainerEngineEmptyScreen.svelte';
import moment from 'moment';
import type { Unsubscriber } from 'svelte/store';
import NavPage from './ui/NavPage.svelte';

const containerUtils = new ContainerUtils();
let openChoiceModal = false;

let containers: ContainerInfoUI[] = [];
let searchTerm = '';
$: searchPattern.set(searchTerm);

function fromExistingImage(): void {
  openChoiceModal = false;
  window.location.href = '#/images';
}

let multipleEngines = false;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

let refreshTimeouts: NodeJS.Timeout[] = [];

const SECOND = 1000;
function refreshUptime() {
  containers = containers.map(containerUiInfo => {
    return { ...containerUiInfo, uptime: containerUtils.refreshUptime(containerUiInfo) };
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshUptime, newInterval));
}

function computeInterval(): number {
  // no container running, no refresh
  if (!containers.some(container => container.state === 'RUNNING')) {
    return -1;
  }

  // limit to containers running
  const runningContainers = containers.filter(container => container.state === 'RUNNING');

  // do we have containers that have been started in less than 1 minute
  // if so, need to update every second
  const containersStartedInLessThan1Mn = runningContainers.filter(
    container => moment().diff(container.startedAt, 'minutes') < 1,
  );
  if (containersStartedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for containers started less than 1 hour
  const containersStartedInLessThan1Hour = runningContainers.filter(
    container => moment().diff(container.startedAt, 'hours') < 1,
  );
  if (containersStartedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for containers started less than 1 day
  const containersStartedInLessThan1Day = runningContainers.filter(
    container => moment().diff(container.startedAt, 'days') < 1,
  );
  if (containersStartedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}

let containersUnsubscribe: Unsubscriber;
onMount(async () => {
  containersUnsubscribe = filtered.subscribe(value => {
    containers = value.map((containerInfo: ContainerInfo) => {
      return containerUtils.getContainerInfoUI(containerInfo);
    });

    // multiple engines ?
    const engineNamesArray = containers.map(container => container.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }

    // compute refresh interval
    const interval = computeInterval();
    refreshTimeouts.push(setTimeout(refreshUptime, interval));
  });
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (containersUnsubscribe) {
    containersUnsubscribe();
  }
});

function openDetailsContainer(container: ContainerInfoUI) {
  router.goto(`/containers/${container.id}/logs`);
}

function keydownChoice(e: KeyboardEvent) {
  e.stopPropagation();
  if (e.key === 'Escape') {
    toggleCreateContainer();
  }
}

function toggleCreateContainer(): void {
  openChoiceModal = !openChoiceModal;
}

function fromDockerfile(): void {
  openChoiceModal = false;
  router.goto('/images/build');
}
</script>

<NavPage
  bind:searchTerm
  title="containers"
  subtitle="Hover over a container to view action buttons; click to open up full details.">
  <button
    slot="additional-actions"
    on:click="{() => toggleCreateContainer()}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start">
      <i class="fas fa-plus-circle" aria-hidden="true"></i>
    </span>
    Create container
  </button>

  <table
    slot="table"
    class="min-w-full divide-y divide-gray-800 border-t border-t-zinc-700"
    class:hidden="{containers.length === 0}">
    <tbody class="bg-zinc-800 divide-y divide-zinc-700">
      {#each containers as container}
        <tr class="group h-12 hover:bg-zinc-700">
          <td class="px-4 whitespace-nowrap hover:cursor-pointer" on:click="{() => openDetailsContainer(container)}">
            <div class="flex items-center">
              <div class="flex-shrink-0 w-3 py-3">
                <ContainerIcon state="{container.state}" />
              </div>
              <div class="ml-4">
                <div class="flex flex-nowrap">
                  <div class="text-sm text-gray-200 overflow-hidden text-ellipsis" title="{container.name}">
                    {container.name}
                  </div>
                  <div class="pl-2 text-sm text-violet-400 overflow-hidden text-ellipsis" title="{container.image}">
                    {container.image}
                  </div>
                </div>
                <div class="flex flex-row text-xs font-extra-light text-gray-500">
                  <div>{container.state}</div>
                  <!-- Hide in case of single engines-->
                  {#if multipleEngines}
                    <div class="mx-2 px-2 inline-flex text-xs font-extralight rounded-sm bg-zinc-700 text-slate-400">
                      {container.engineName}
                    </div>
                  {/if}
                  <div class="pl-2 pr-2">{container.port}</div>
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap w-10">
            <div class="flex items-center">
              <div class="ml-2 text-sm text-gray-400">{container.uptime}</div>
            </div>
          </td>
          <td class="px-6 whitespace-nowrap">
            <div class="flex flex-row justify-end opacity-0 group-hover:opacity-100 ">
              <ContainerActions container="{container}" />
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <ContainerEmptyScreen slot="empty" containers="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen slot="empty" />
    {/if}
  </div>
</NavPage>

{#if openChoiceModal}
  <Modal
    on:close="{() => {
      openChoiceModal = false;
    }}">
    <div
      class="pf-c-modal-box pf-m-sm modal z-50 "
      tabindex="{0}"
      autofocus
      aria-modal="true"
      on:keydown="{keydownChoice}"
      aria-labelledby="modal-title-modal-basic-example-modal"
      aria-describedby="modal-description-modal-basic-example-modal">
      <button
        class="pf-c-button pf-m-plain"
        type="button"
        aria-label="Close dialog"
        on:click="{() => toggleCreateContainer()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
      <header class="pf-c-modal-box__header" on:keydown="{keydownChoice}">
        <h1 class="pf-c-modal-box__title">Create a new container</h1>
      </header>
      <div class="pf-c-modal-box__body">
        <ul class="list-disc">
          <li>Create a container from a Containerfile description. Browse a local content description.</li>
          <li>Or create a container from an existing image stored in the local registry.</li>
        </ul>
      </div>
      <footer class="pf-c-modal-box__footer">
        <button class="pf-c-button pf-m-primary" type="button" on:click="{() => fromDockerfile()}"
          >From Containerfile/Dockerfile</button>
        <button class="pf-c-button pf-m-secondary" type="button" on:click="{() => fromExistingImage()}"
          >From existing image</button>
      </footer>
    </div>
  </Modal>
{/if}
