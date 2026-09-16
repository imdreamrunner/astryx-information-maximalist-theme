// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file icons.tsx
 * @input Heroicons 24/outline glyphs and the Astryx IconRegistry type
 * @output Exports informationMaximalistIconRegistry
 * @position Icon layer of the Information Maximalist theme; consumed by
 *   informationMaximalistTheme.ts
 *
 * Maps Astryx's semantic icon names onto Heroicons' 24px outline set. The set
 * is chosen for its uniform 1.5px stroke: at the small sizes a dense portal
 * uses, a constant hairline stroke keeps glyphs legible next to the 1px
 * separators the theme draws everywhere else, where a filled or variable-stroke
 * set would read as a heavier second visual language.
 *
 * Heroicons is a peer dependency of this integration, so a consumer that
 * installs the package already has it — the theme adds no new dependency.
 */

/** @jsxRuntime automatic */
/** @jsxImportSource react */

import type {IconRegistry} from '@astryxdesign/core/Icon';
import {
  ArrowDownIcon,
  ArrowsUpDownIcon,
  ArrowUpIcon,
  Bars3Icon,
  CalendarIcon,
  CheckCircleIcon,
  CheckIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FunnelIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  StopIcon,
  ArrowTopRightOnSquareIcon,
  TableCellsIcon,
  WrenchIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * Sized in `em` rather than px so every glyph tracks the type scale it sits in.
 * That is what lets the theme tighten typography globally and have icons follow
 * without a second set of overrides.
 */
const glyph = {
  width: '1em',
  height: '1em',
  'aria-hidden': true as const,
};

export const informationMaximalistIconRegistry: IconRegistry = {
  close: <XMarkIcon {...glyph} />,
  chevronDown: <ChevronDownIcon {...glyph} />,
  chevronLeft: <ChevronLeftIcon {...glyph} />,
  chevronRight: <ChevronRightIcon {...glyph} />,
  chevronsLeft: <ChevronDoubleLeftIcon {...glyph} />,
  chevronsRight: <ChevronDoubleRightIcon {...glyph} />,
  check: <CheckIcon {...glyph} />,
  success: <CheckCircleIcon {...glyph} />,
  error: <XCircleIcon {...glyph} />,
  warning: <ExclamationTriangleIcon {...glyph} />,
  info: <InformationCircleIcon {...glyph} />,
  calendar: <CalendarIcon {...glyph} />,
  clock: <ClockIcon {...glyph} />,
  externalLink: <ArrowTopRightOnSquareIcon {...glyph} />,
  menu: <Bars3Icon {...glyph} />,
  moreHorizontal: <EllipsisHorizontalIcon {...glyph} />,
  search: <MagnifyingGlassIcon {...glyph} />,
  arrowUp: <ArrowUpIcon {...glyph} />,
  arrowDown: <ArrowDownIcon {...glyph} />,
  arrowsUpDown: <ArrowsUpDownIcon {...glyph} />,
  funnel: <FunnelIcon {...glyph} />,
  eyeSlash: <EyeSlashIcon {...glyph} />,
  viewColumns: <TableCellsIcon {...glyph} />,
  copy: <ClipboardDocumentIcon {...glyph} />,
  // Heroicons has no double-check glyph; the single check reads the same at
  // the sizes this theme uses, and leaving the name unmapped would fall back
  // to the core default and break the stroke language.
  checkDouble: <CheckIcon {...glyph} />,
  wrench: <WrenchIcon {...glyph} />,
  stop: <StopIcon {...glyph} />,
  microphone: <MicrophoneIcon {...glyph} />,
};
