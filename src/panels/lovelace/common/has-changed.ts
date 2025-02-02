import { HassEntity } from "home-assistant-js-websocket";
import { PropertyValues } from "lit";
import { EntityRegistryEntry } from "../../../data/entity_registry";
import { HomeAssistant } from "../../../types";
import { processConfigEntities } from "./process-config-entities";

function hasConfigChanged(element: any, changedProps: PropertyValues): boolean {
  if (changedProps.has("_config")) {
    return true;
  }

  const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
  if (!oldHass) {
    return true;
  }

  if (
    oldHass.connected !== element.hass!.connected ||
    oldHass.themes !== element.hass!.themes ||
    oldHass.locale !== element.hass!.locale ||
    oldHass.localize !== element.hass.localize ||
    oldHass.config.state !== element.hass.config.state
  ) {
    return true;
  }
  return false;
}

function compareEntityState(
  oldHass: HomeAssistant,
  newHass: HomeAssistant,
  entityId: string
) {
  const oldState = oldHass.states[entityId] as HassEntity | undefined;
  const newState = newHass.states[entityId] as HassEntity | undefined;

  return oldState !== newState;
}

function compareEntityEntryOptions(
  oldHass: HomeAssistant,
  newHass: HomeAssistant,
  entityId: string
) {
  const oldEntry = oldHass.entities[entityId] as
    | EntityRegistryEntry
    | undefined;
  const newEntry = newHass.entities[entityId] as
    | EntityRegistryEntry
    | undefined;

  return (
    oldEntry?.options?.sensor?.display_precision !==
      newEntry?.options?.sensor?.display_precision ||
    oldEntry?.options?.sensor?.suggested_display_precision !==
      newEntry?.options?.sensor?.suggested_display_precision
  );
}

// Check if config or Entity changed
export function hasConfigOrEntityChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (hasConfigChanged(element, changedProps)) {
    return true;
  }

  const oldHass = changedProps.get("hass") as HomeAssistant;
  const newHass = element.hass as HomeAssistant;

  return (
    compareEntityState(oldHass, newHass, element._config!.entity) ||
    compareEntityEntryOptions(oldHass, newHass, element._config!.entity)
  );
}

// Check if config or Entities changed
export function hasConfigOrEntitiesChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (hasConfigChanged(element, changedProps)) {
    return true;
  }

  const oldHass = changedProps.get("hass") as HomeAssistant;
  const newHass = element.hass as HomeAssistant;

  const entities = processConfigEntities(element._config!.entities, false);

  return entities.some((entity) => {
    if (!("entity" in entity)) {
      return false;
    }

    return (
      compareEntityState(oldHass, newHass, entity.entity) ||
      compareEntityEntryOptions(oldHass, newHass, entity.entity)
    );
  });
}
