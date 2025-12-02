/**
 * Neogma OGM Models Registry
 *
 * Central registry for all OGM models in the application.
 * Uses lazy initialization to ensure neogma is ready before models are created.
 *
 * Usage in server functions:
 *   const notification = await args.Models.Notification.findByUserId(userId, args.session);
 *
 * Usage in TypeScript files:
 *   import { Models } from "~/lib/models";
 *   const notification = await Models.Notification.createOne(data, { session });
 */

import { getNotificationModel } from "./example/NotificationModel";

/**
 * Central model registry with lazy initialization
 *
 * Each model is created on first access to avoid initialization order issues
 * and ensure neogma driver is ready.
 */
export const Models: Record<string, any> = {
  /**
   * Notification Model
   *
   * Example model for user notifications
   */
  get Notification() {
    return getNotificationModel();
  },

  // Add more models here as you create them:
  //
  // get User() {
  //   return getUserModel();
  // },
  //
  // get YouTubeChannel() {
  //   return getYouTubeChannelModel();
  // },
  //
  // get YouTubePlaylist() {
  //   return getYouTubePlaylistModel();
  // },
};

/**
 * Type-safe model registry type
 */
export type ModelRegistry = typeof Models;

/**
 * Register a model dynamically
 *
 * Allows hjson server functions to register models in the global registry
 *
 * @param modelName - Name of the model
 * @param modelFactory - Factory function that creates the model
 *
 * @example
 * ```javascript
 * // In hjson server function
 * const { ModelFactory } = await import("neogma");
 * const neogma = await args.getNeogmaInstance();
 *
 * const CacheModel = ModelFactory({ ... }, neogma);
 *
 * // Register for reuse
 * args.registerModel("Cache", () => CacheModel);
 *
 * // Now available globally
 * const cache = await args.Models.Cache.findOne(...);
 * ```
 */

export function registerModel(modelName: string, modelFactory: () => any): void {
  if (Models[modelName]) {
    console.warn(`Model "${modelName}" is already registered. Overwriting.`);
  }

  // Store the factory function
  Models[modelName] = modelFactory;

  // Add getter to Models object if it doesn't exist
  if (!(modelName in Models)) {
    Object.defineProperty(Models, modelName, {
      get() {
        return Models[modelName]();
      },
      enumerable: true,
      configurable: true,
    });
  }
}

/**
 * Check if a model is registered
 */
export function hasModel(modelName: string): boolean {
  return modelName in Models || modelName in Models;
}

/**
 * Get list of all registered model names
 */
export function getRegisteredModels(): string[] {
  const staticModels = Object.keys(Models);
  return Array.from(new Set([...staticModels]));
}

/**
 * Re-export common types and utilities
 */
export * from "./base/types";
export * from "./base/BaseModel";
export type {
  NotificationProperties,
  NotificationInstance,
  NotificationModelType,
} from "./example/NotificationModel";
export { createNotification } from "./example/NotificationModel";
