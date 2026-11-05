import React from 'react';
import { Inbox } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item, index) => item.id || item.code || item.immatriculation || item.matricule || index,
  emptyMessage = 'Aucun élément trouvé',
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto w-full border border-slate-200/90 rounded-2xl bg-white shadow-xs ${className}`}>
      <table className="min-w-full divide-y divide-slate-200/80 text-left text-sm">
        <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase text-[11px] tracking-wider">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className={`px-5 py-3.5 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-12 text-center text-sm text-slate-400 font-medium"
              >
                <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>{emptyMessage}</p>
              </td>
            </tr>
          ) : (
            data.map((item, rowIdx) => (
              <tr
                key={keyExtractor(item, rowIdx)}
                className="hover:bg-blue-50/25 transition-colors"
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`px-5 py-3.5 whitespace-nowrap text-slate-700 text-xs sm:text-sm ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(item, rowIdx) : item[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
