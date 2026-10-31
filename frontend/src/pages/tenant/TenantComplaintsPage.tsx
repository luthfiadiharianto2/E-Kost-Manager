import React, { useState } from 'react';
import { TenantLayout } from '../../components/TenantLayout';
import { Plus, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export const TenantComplaintsPage: React.FC = () => {
  const [complaintText, setComplaintText] = useState('');
  const [complaints, setComplaints] = useState([
    { id: 1, title: 'AC Tidak Dingin', description: 'AC di kamar tidak dingin sejak kemarin', status: 'pending', priority: 'high', date: '2024-01-10' },
    { id: 2, title: 'WiFi Lambat', description: 'Koneksi WiFi sangat lambat di malam hari', status: 'in_progress', priority: 'medium', date: '2024-01-08' },
    { id: 3, title: 'Kebocoran Air', description: 'Ada kebocoran air di kamar mandi', status: 'resolved', priority: 'high', date: '2024-01-05' },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) {
      toast.error('Mohon isi aduan terlebih dahulu');
      return;
    }

    // TODO: Implement submit complaint functionality
    const newComplaint = {
      id: complaints.length + 1,
      title: complaintText.split('\n')[0] || 'Aduan Baru',
      description: complaintText,
      status: 'pending',
      priority: 'medium',
      date: new Date().toISOString().split('T')[0],
    };

    setComplaints([newComplaint, ...complaints]);
    setComplaintText('');
    toast.success('Aduan berhasil dikirim');
  };

  return (
    <TenantLayout>
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Aduan</h2>
          </div>
        </div>

        {/* Add Complaint Form */}
        <div className="mb-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tulis Aduan Baru</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Isi Aduan
              </label>
              <textarea 
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                rows={4}
                placeholder="Tuliskan aduan Anda di sini..."
                required
              />
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Kirim Aduan
              </button>
            </div>
          </form>
        </div>

        {/* Complaint List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daftar Aduan Anda</h3>
          {complaints.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada aduan. Tulis aduan pertama Anda di atas.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{complaint.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                    <p className="text-xs text-gray-500">Tanggal: {complaint.date}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                      {complaint.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </TenantLayout>
  );
};

