import type {z} from "zod";
import {z as schema} from "zod";

const valueSchema = schema.object({
  label: schema.string(),
  value: schema.number(),
  unit: schema.string(),
});

const sceneSchema = schema.object({
  id: schema.string(),
  startSeconds: schema.number().min(0),
  endSeconds: schema.number().positive(),
  kind: schema.enum([
    "none",
    "lower-third",
    "quote",
    "stat-card",
    "bar-chart",
    "flowchart",
  ]),
  headline: schema.string(),
  body: schema.string(),
  values: schema.array(valueSchema),
  placement: schema.enum(["left", "lower-left", "right", "center"]).default("left"),
  items: schema.array(schema.string()).default([]),
  flow: schema.enum(["sequence", "branches"]).default("sequence"),
  presentation: schema.enum(["full", "split-video-left", "split-video-right"]).default("full"),
});

const themeSchema = schema.object({
  background: schema.string(),
  surface: schema.string(),
  primary: schema.string(),
  secondary: schema.string(),
  text: schema.string(),
  mutedText: schema.string(),
  fontFamily: schema.string(),
  displayFontFamily: schema.string(),
});

const captionsSchema = schema.array(
  schema.object({
    startMs: schema.number().min(0),
    endMs: schema.number().positive(),
    text: schema.string(),
    timestampMs: schema.number().nullable(),
    confidence: schema.number().nullable(),
  }),
);

export const Root = schema.object({
  sourceVideo: schema.string(),
  durationSeconds: schema.number().min(0.1).max(3600),
  showCaptions: schema.boolean(),
  captions: captionsSchema,
  scenes: schema.array(sceneSchema),
  theme: themeSchema,
});

export type RootShape = z.infer<typeof Root>;
export type ThemeShape = z.infer<typeof themeSchema>;
