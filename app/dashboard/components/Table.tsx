'use client';

import React from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface Dataset {
  id: string;
  title: string;
  category?: string;
  _count: {
    likes: number;
    comments: number;
  };
  isVerified: boolean;
  contributor: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    role: string;
    contributions: number;
    createdAt: string;
  };
}

interface ContributionTableProps {
  datasets: Dataset[];
}

const ContributionTable: React.FC<ContributionTableProps> = ({ datasets }) => {
  const router = useRouter();

  return (
  <div className="rounded-xl border border-neutral-700 bg-white/5 p-6 w-full overflow-x-auto">
    <h3 className="text-lg font-semibold text-white mb-4">Contribution Table</h3>

    <table className="min-w-full table-auto text-sm text-white">
      <thead className="border-b border-neutral-700 text-left text-neutral-400">
        <tr>
          <th className="py-3 px-4">Title</th>
          <th className="py-3 px-4">Category</th>
          <th className="py-3 px-4">Likes</th>
          <th className="py-3 px-4">Comments</th>
          <th className="py-3 px-4">Verified</th>
          <th className="py-3 px-4">Contributor</th>
        </tr>
      </thead>

      <tbody>
        {datasets.slice(0, 3).map((dataset) => (
          <tr key={dataset.id} className="border-b border-neutral-800 last:border-none">
            <td className="py-3 px-4">{dataset.title}</td>
            <td className="py-3 px-4">{dataset.category || '-'}</td>
            <td className="py-3 px-4">{dataset._count.likes}</td>
            <td className="py-3 px-4">{dataset._count.comments}</td>
            <td className="py-3 px-4">
              {dataset.isVerified ? (
                <IconCheck size={18} className="text-white" />
              ) : (
                <IconX size={18} className="text-white" />
              )}
            </td>
            <td className="py-3 px-4">{dataset.contributor?.name || 'Unknown'}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div className="text-right">
      <button
        onClick={() => router.push('/datasets')}
        className="rounded-md px-4 py-2 hover:text-white transition-colors font-medium cursor-pointer border border-white/30 text-white text-xs hover:bg-white/20 hover:shadow-[0_0_10px_rgba(255,255,255,0.3)]"
      >
        View More...
      </button>
    </div>
  </div>
);

};

export default ContributionTable;
