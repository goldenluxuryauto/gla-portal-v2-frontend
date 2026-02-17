import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/admin-layout";
import { buildApiUrl } from "@/lib/queryClient";
import { FileText, Download, File, Shield, ScrollText, Car } from "lucide-react";

interface Document {
  id: number;
  carId: number | null;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  category: string;
  createdAt: string;
  carMake: string | null;
  carModel: string | null;
  carYear: number | null;
}

const categoryIcons: Record<string, React.ReactNode> = {
  contract: <ScrollText className="w-5 h-5" />,
  agreement: <FileText className="w-5 h-5" />,
  insurance: <Shield className="w-5 h-5" />,
  registration: <Car className="w-5 h-5" />,
  other: <File className="w-5 h-5" />,
};

const categoryColors: Record<string, string> = {
  contract: '#DAA520',
  agreement: '#a855f7',
  insurance: '#22c55e',
  registration: '#3b82f6',
  other: '#666',
};

export default function OwnerDocuments() {
  const { data, isLoading } = useQuery<{ success: boolean; data: Document[] }>({
    queryKey: ["/api/client/documents"],
    queryFn: async () => {
      const res = await fetch(buildApiUrl("/api/client/documents"), { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const documents = data?.data || [];

  // Group by category
  const grouped = documents.reduce((acc, doc) => {
    const cat = doc.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, Document[]>);

  return (
    <AdminLayout>
      <div className="space-y-6 pb-8">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6" style={{ color: '#DAA520' }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#DAA520' }}>Documents</h1>
            <p className="text-sm text-gray-400 mt-1">Contracts, agreements, and insurance for your vehicles</p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl animate-pulse" style={{ background: '#1a1a1a' }} />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl p-12 text-center" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No documents yet</p>
            <p className="text-gray-500 text-sm mt-1">Your contracts, agreements, and insurance documents will appear here once uploaded by GLA.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, docs]) => (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div style={{ color: categoryColors[category] || '#666' }}>
                    {categoryIcons[category] || categoryIcons.other}
                  </div>
                  <h3 className="text-sm font-semibold text-white capitalize">{category}s</h3>
                  <span className="text-xs text-gray-500">({docs.length})</span>
                </div>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-800/30 transition"
                      style={{ background: '#1a1a1a', border: '1px solid #333' }}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{doc.title}</p>
                        {doc.description && <p className="text-xs text-gray-400 mt-0.5">{doc.description}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          {doc.carMake && (
                            <span className="text-xs text-gray-500">
                              {doc.carYear} {doc.carMake} {doc.carModel}
                            </span>
                          )}
                          <span className="text-xs text-gray-600">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 p-2 rounded-lg hover:bg-gray-700 transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
