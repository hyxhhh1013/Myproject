import { useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

/**
 * A small editor for a list of rows with named text columns, used by the admin
 * CMS for JSON list fields (metrics, linkedProjects, experience highlights…).
 * Value in / out is an array of plain objects keyed by the column keys.
 */

export type RowValue = Record<string, string>;

export interface RowsEditorColumn {
  key: string;
  label: string;
  placeholder?: string;
  /** Render a textarea instead of a single-line input. */
  multiline?: boolean;
  /** Width on a 6-column grid (sm and up). Defaults to an even split. */
  span?: 1 | 2 | 3 | 4 | 5 | 6;
}

interface RowsEditorProps {
  columns: RowsEditorColumn[];
  value: RowValue[];
  onChange: (rows: RowValue[]) => void;
  addLabel?: string;
  emptyText?: string;
  maxRows?: number;
}

// Static class names so Tailwind keeps them.
const SPAN_CLASS: Record<number, string> = {
  1: 'sm:col-span-1',
  2: 'sm:col-span-2',
  3: 'sm:col-span-3',
  4: 'sm:col-span-4',
  5: 'sm:col-span-5',
  6: 'sm:col-span-6',
};

const inputClass =
  'w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100';

const iconButtonClass =
  'p-1 rounded text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-800 dark:hover:text-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent';

let nextRowId = 1;

const RowsEditor = ({
  columns,
  value,
  onChange,
  addLabel = '添加一行',
  emptyText = '暂无条目',
  maxRows,
}: RowsEditorProps) => {
  // Stable per-row keys so inputs keep their identity when rows are reordered.
  const idsRef = useRef<number[]>([]);
  if (idsRef.current.length !== value.length) {
    idsRef.current = value.map(() => nextRowId++);
  }
  const ids = idsRef.current;

  const defaultSpan = Math.max(1, Math.min(6, Math.floor(6 / Math.max(1, columns.length))));

  const emptyRow = (): RowValue =>
    columns.reduce<RowValue>((row, col) => {
      row[col.key] = '';
      return row;
    }, {});

  const updateCell = (rowIndex: number, key: string, cell: string) => {
    onChange(value.map((row, i) => (i === rowIndex ? { ...row, [key]: cell } : row)));
  };

  const addRow = () => {
    idsRef.current = [...ids, nextRowId++];
    onChange([...value, emptyRow()]);
  };

  const removeRow = (rowIndex: number) => {
    idsRef.current = ids.filter((_, i) => i !== rowIndex);
    onChange(value.filter((_, i) => i !== rowIndex));
  };

  const moveRow = (rowIndex: number, delta: -1 | 1) => {
    const target = rowIndex + delta;
    if (target < 0 || target >= value.length) return;
    const rows = [...value];
    const nextIds = [...ids];
    [rows[rowIndex], rows[target]] = [rows[target], rows[rowIndex]];
    [nextIds[rowIndex], nextIds[target]] = [nextIds[target], nextIds[rowIndex]];
    idsRef.current = nextIds;
    onChange(rows);
  };

  const canAdd = maxRows === undefined || value.length < maxRows;

  return (
    <div className="space-y-2">
      {value.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 px-3 py-2 border border-dashed border-gray-200 dark:border-gray-600 rounded-lg">
          {emptyText}
        </p>
      )}

      {value.map((row, rowIndex) => (
        <div
          key={ids[rowIndex]}
          className="p-3 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-400 dark:text-gray-500">
              #{String(rowIndex + 1).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => moveRow(rowIndex, -1)}
                disabled={rowIndex === 0}
                className={iconButtonClass}
                title="上移"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => moveRow(rowIndex, 1)}
                disabled={rowIndex === value.length - 1}
                className={iconButtonClass}
                title="下移"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => removeRow(rowIndex)}
                className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="删除此行"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-2">
            {columns.map((col) => (
              <div key={col.key} className={SPAN_CLASS[col.span ?? defaultSpan]}>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-0.5">{col.label}</label>
                {col.multiline ? (
                  <textarea
                    value={row[col.key] ?? ''}
                    onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                    className={inputClass}
                    placeholder={col.placeholder}
                    rows={2}
                  />
                ) : (
                  <input
                    type="text"
                    value={row[col.key] ?? ''}
                    onChange={(e) => updateCell(rowIndex, col.key, e.target.value)}
                    className={inputClass}
                    placeholder={col.placeholder}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {canAdd && (
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {addLabel}
        </button>
      )}
    </div>
  );
};

export default RowsEditor;

/* ------------------------------------------------------------------ */
/* Helpers for the JSON-in-TEXT columns (stored as a JSON string).      */
/* ------------------------------------------------------------------ */

/** `metrics` rows: [{ value, label, labelEn }] — shared by projects, experience and skills. */
export const METRIC_COLUMNS: RowsEditorColumn[] = [
  { key: 'value', label: '数值', placeholder: '例如：46 / ~3 Days', span: 2 },
  { key: 'label', label: '说明（中文）', placeholder: '例如：可恢复编排工具', span: 2 },
  { key: 'labelEn', label: '说明（英文）', placeholder: 'e.g. Recoverable Tools', span: 2 },
];
export const METRIC_KEYS = METRIC_COLUMNS.map((col) => col.key);

/** JSON.parse that tolerates a double-encoded string ('"[...]"'); returns undefined on bad JSON. */
function parseJsonLoose(raw: string): unknown {
  try {
    let data: unknown = JSON.parse(raw);
    if (typeof data === 'string') data = JSON.parse(data);
    return data;
  } catch {
    return undefined;
  }
}

/** Parse a JSON array of objects defensively; bad / missing JSON → []. */
export function parseJsonRows(raw: unknown, keys: string[]): RowValue[] {
  const data: unknown = typeof raw === 'string' ? parseJsonLoose(raw) : raw;
  if (!Array.isArray(data)) return [];
  return data
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) =>
      keys.reduce<RowValue>((row, key) => {
        const cell = item[key];
        row[key] = cell === null || cell === undefined ? '' : String(cell);
        return row;
      }, {}),
    );
}

/** Trim cells, drop rows that are entirely empty, and serialise; an empty list → '' (clears the column). */
export function serializeRows(rows: RowValue[], keys: string[]): string {
  const cleaned = rows
    .map((row) =>
      keys.reduce<RowValue>((out, key) => {
        out[key] = (row[key] ?? '').trim();
        return out;
      }, {}),
    )
    .filter((row) => keys.some((key) => row[key] !== ''));
  return cleaned.length > 0 ? JSON.stringify(cleaned) : '';
}

/** Parse a JSON string[] defensively; a plain non-JSON string falls back to comma splitting. */
export function parseJsonStringList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((v) => String(v ?? '').trim()).filter(Boolean);
  if (typeof raw !== 'string' || raw.trim() === '') return [];
  const data = parseJsonLoose(raw);
  if (Array.isArray(data)) return data.map((v) => String(v ?? '').trim()).filter(Boolean);
  if (raw.trim().startsWith('[')) return [];
  return raw.split(/[,，]/).map((v) => v.trim()).filter(Boolean);
}

/** "a, b，c" → JSON string '["a","b","c"]'; nothing → '' (clears the column). */
export function serializeCommaList(text: string): string {
  const items = text.split(/[,，]/).map((v) => v.trim()).filter(Boolean);
  return items.length > 0 ? JSON.stringify(items) : '';
}
