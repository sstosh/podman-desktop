<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPlayCircle, faTerminal } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faExternalLinkSquareAlt } from '@fortawesome/free-solid-svg-icons';
import type { ContainerInfoUI } from './ContainerInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let container: ContainerInfoUI;
export let backgroundColor = 'bg-zinc-800';

async function startContainer(containerInfo: ContainerInfoUI) {
  await window.startContainer(containerInfo.engineId, containerInfo.id);
}

async function restartContainer(containerInfo: ContainerInfoUI) {
  await window.restartContainer(containerInfo.engineId, containerInfo.id);
}

async function stopContainer(containerInfo: ContainerInfoUI) {
  await window.stopContainer(containerInfo.engineId, containerInfo.id);
}
function openBrowser(containerInfo: ContainerInfoUI): void {
  window.openExternal(containerInfo.openingUrl);
}

async function deleteContainer(containerInfo: ContainerInfoUI): Promise<void> {
  await window.deleteContainer(containerInfo.engineId, containerInfo.id);
  router.goto('/containers/');
}
function openTerminalContainer(containerInfo: ContainerInfoUI): void {
  router.goto(`/containers/${container.id}/terminal`);
}
</script>

<ListItemButtonIcon
  title="Open Browser"
  onClick="{() => openBrowser(container)}"
  hidden="{!(container.state === 'RUNNING' && container.hasPublicPort)}"
  backgroundColor="{backgroundColor}"
  icon="{faExternalLinkSquareAlt}" />
<ListItemButtonIcon
  title="Open Terminal"
  onClick="{() => openTerminalContainer(container)}"
  hidden="{!(container.state === 'RUNNING')}"
  backgroundColor="{backgroundColor}"
  icon="{faTerminal}" />
<ListItemButtonIcon
  title="Start Container"
  onClick="{() => startContainer(container)}"
  hidden="{container.state === 'RUNNING'}"
  backgroundColor="{backgroundColor}"
  icon="{faPlayCircle}" />
<ListItemButtonIcon
  title="Stop Container"
  onClick="{() => stopContainer(container)}"
  hidden="{!(container.state === 'RUNNING')}"
  backgroundColor="{backgroundColor}"
  icon="{faStopCircle}" />
<ListItemButtonIcon
  title="Restart Container"
  onClick="{() => restartContainer(container)}"
  backgroundColor="{backgroundColor}"
  icon="{faArrowsRotate}" />
<ListItemButtonIcon
  title="Delete Container"
  onClick="{() => deleteContainer(container)}"
  backgroundColor="{backgroundColor}"
  icon="{faTrash}" />
