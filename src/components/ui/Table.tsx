import { useState, useMemo, type ReactNode } from 'react'
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

type SortDirection = 'asc' | 'desc'

interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render?: (row: T) => ReactNode
  className?: string
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  onSelectionChange?: (selected: T[]) => void
  getRowId: (row: T) => string | number
  pageSize?: number
  striped?: boolean
  loading?: boolean
  emptyState?: ReactNode
  className?: string
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  )
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  selectable = false,
  onSelectionChange,
  getRowId,
  pageSize = 10,
  striped = false,
  loading = false,
  emptyState,
  className = '',
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [page, setPage] = useState(0)

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (aVal == null) return 1
      if (bVal == null) return -1
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(page, totalPages - 1)
  const paginated = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleRow = (id: string | number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
    onSelectionChange?.(data.filter((r) => next.has(getRowId(r))))
  }

  const toggleAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set())
      onSelectionChange?.([])
    } else {
      const ids = new Set(paginated.map((r) => getRowId(r)))
      setSelectedIds(ids)
      onSelectionChange?.(data.filter((r) => ids.has(getRowId(r))))
    }
  }

  const allSelected = paginated.length > 0 && selectedIds.size === paginated.length

  if (loading) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {selectable && <th className="w-10 px-4 py-3" />}
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} cols={columns.length + (selectable ? 1 : 0)} />
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
        {emptyState || (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 rounded-full bg-gray-100 p-3 text-gray-400">
              <Loader2 size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">No data available</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-gray-200 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {selectable && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                    aria-label="Select all rows"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 ${
                    col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                  } ${col.className ?? ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (
                      <>
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          )
                        ) : (
                          <ChevronsUpDown size={14} className="text-gray-300" />
                        )}
                      </>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.map((row, idx) => {
              const id = getRowId(row)
              const selected = selectedIds.has(id)
              return (
                <tr
                  key={id}
                  className={`transition-colors hover:bg-amber-50/40 ${
                    selected ? 'bg-amber-50/60' : ''
                  } ${striped && idx % 2 === 1 ? 'bg-gray-50/30' : ''}`}
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleRow(id)}
                        className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                        aria-label="Select row"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 text-sm text-gray-700 ${col.className ?? ''}`}>
                      {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-500">
            Showing {safePage * pageSize + 1}–{Math.min((safePage + 1) * pageSize, sorted.length)} of{' '}
            {sorted.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`min-w-[32px] rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                  i === safePage
                    ? 'bg-amber-500 text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label={`Page ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
