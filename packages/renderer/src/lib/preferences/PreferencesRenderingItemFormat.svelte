<script lang="ts">
import {
  ConfigurationRegistry,
  IConfigurationPropertyRecordedSchema,
} from '../../../../main/src/plugin/configuration-registry';

let invalidEntry = false;
let invalidText = undefined;
export let showUpdate = false;
export let invalidRecord = (error: string) => {};
export let validRecord = () => {};

export let record: IConfigurationPropertyRecordedSchema;

let currentRecord: IConfigurationPropertyRecordedSchema;

let recordValue;
let checkboxValue: boolean = false;
$: if (currentRecord !== record) {
  if (record.scope === ConfigurationRegistry.DEFAULT_SCOPE) {
    window.getConfigurationValue(record.id, record.scope).then(value => {
      recordValue = value;
      if (recordValue === true) {
        checkboxValue = true;
      }
    });
  } else if (record.default) {
    recordValue = record.default;
  }

  currentRecord = record;
  invalidText = undefined;
  invalidEntry = false;
}

function invalid() {
  // call the callback
  invalidRecord(invalidText);
}

function valid() {
  validRecord();
}

function checkValue(record: IConfigurationPropertyRecordedSchema, event: any) {
  const userValue = event.target.value;
  if (record.type === 'number') {
    const numberValue = parseFloat(userValue);
    if (userValue === '') {
      invalidEntry = true;
      invalidText = `Expecting a number`;
      return invalid();
    }
    if (isNaN(numberValue)) {
      invalidEntry = true;
      invalidText = `${userValue} is not a number`;
      return invalid();
    }

    // check range
    if (record.minimum && numberValue < record.minimum) {
      invalidEntry = true;
      invalidText = 'Minimun value is ' + record.minimum;
      return invalid();
    }
    if (record.maximum && numberValue > record.maximum) {
      invalidEntry = true;
      invalidText = 'Maximum value is ' + record.maximum;
      return invalid();
    }
  }
  valid();
  invalidEntry = false;
  invalidText = undefined;
}

function update(record: IConfigurationPropertyRecordedSchema) {
  // reset invalid
  invalidEntry = false;

  let value: any = recordValue;
  if (record.type === 'number') {
    value = parseFloat(value);
  } else if (record.type === 'boolean') {
    value = checkboxValue;
  }

  // save the value
  try {
    window.updateConfigurationValue(record.id, value, record.scope);
  } catch (error) {
    invalidEntry = true;
    invalidText = error;
  }
}
</script>

<div class="flex flex-row mb-2 px-4">
  <div class="flex flex-col mx-2 flex-1 pf-c-form__group-control">
    {#if record.type === 'boolean'}
      <input
        on:input="{event => checkValue(record, event)}"
        class="pf-c-check__input"
        bind:checked="{checkboxValue}"
        name="{record.id}"
        type="checkbox"
        readonly="{!!record.readonly}"
        id="input-standard-{record.id}"
        aria-invalid="{invalidEntry}"
        aria-label="{record.description}" />
    {:else}
      <input
        on:input="{event => checkValue(record, event)}"
        class="pf-c-form-control"
        name="{record.id}"
        type="text"
        bind:value="{recordValue}"
        readonly="{!!record.readonly}"
        id="input-standard-{record.id}"
        aria-invalid="{invalidEntry}"
        aria-label="{record.description}" />
    {/if}

    {#if invalidEntry}
      <p class="pf-c-form__helper-text pf-m-error text:red" id="form-help-text-address-helper" aria-live="polite">
        {invalidText}.
      </p>
    {/if}
  </div>
  {#if showUpdate}
    {#if !!record.readonly === false && !invalidEntry}
      <button on:click="{() => update(record)}" class="pf-c-button pf-m-primary w-40 px-4" type="button">
        <span class="pf-c-button__icon pf-m-start">
          <i class="fas fa-save" aria-hidden="true"></i>
        </span>
        Update
      </button>
    {/if}
  {/if}
</div>
