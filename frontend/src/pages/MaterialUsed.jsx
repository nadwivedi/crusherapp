import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../utils/api';

const TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 2200
};

const initialFormData = {
  vehicle: '',
  materialType: '',
  usedQty: '',
  usedDate: new Date().toISOString().slice(0, 10),
  notes: ''
};

function MaterialUsedForm({
  formData,
  setFormData,
  vehicles,
  materials,
  loading,
  editingId,
  onSave,
  onClose
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-900">{editingId ? 'Edit Material Used' : 'Add Material Used'}</p>
          <p className="mt-1 text-sm text-slate-500">Track purchased material consumption and reduce stock automatically.</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close popup"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Vehicle No</span>
          <select
            value={formData.vehicle}
            onChange={(event) => setFormData((prev) => ({ ...prev, vehicle: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">Select vehicle (optional)</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.vehicleNo}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Material Type</span>
          <select
            value={formData.materialType}
            onChange={(event) => setFormData((prev) => ({ ...prev, materialType: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            <option value="">Select material</option>
            {materials.map((material) => (
              <option key={material._id} value={material._id}>
                {material.name}{material.unit ? ` (${material.unit})` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Used Qty</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={formData.usedQty}
            onChange={(event) => setFormData((prev) => ({ ...prev, usedQty: event.target.value }))}
            placeholder="Enter used quantity"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-slate-700">Used Date</span>
          <input
            type="date"
            value={formData.usedDate}
            onChange={(event) => setFormData((prev) => ({ ...prev, usedDate: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-semibold text-slate-700">Notes</span>
        <textarea
          rows="3"
          value={formData.notes}
          onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Optional notes"
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
      </label>

      <div className="mt-5 flex flex-wrap justify-end gap-3">
        {editingId && (
          <button
            type="button"
            onClick={() => setFormData(initialFormData)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Saving...' : editingId ? 'Update Material Used' : 'Save Material Used'}
        </button>
      </div>
    </div>
  );
}

export default function MaterialUsed({ modalOnly = false, onModalFinish = null }) {
  const [entries, setEntries] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState('');
  const [error, setError] = useState('');

  const selectedMaterial = useMemo(
    () => materials.find((material) => material._id === formData.materialType) || null,
    [formData.materialType, materials]
  );

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId('');
  };

  const fetchEntries = async (searchValue = search) => {
    try {
      setFetching(true);
      setError('');
      const response = await apiClient.get('/material-used', { params: { search: searchValue } });
      setEntries(response.data || []);
    } catch (err) {
      setError(err.message || 'Error fetching material used entries');
    } finally {
      setFetching(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [vehicleResponse, materialResponse] = await Promise.all([
        apiClient.get('/vehicles'),
        apiClient.get('/products')
      ]);
      setVehicles(vehicleResponse || []);
      setMaterials(materialResponse.data || materialResponse || []);
    } catch (err) {
      setError(err.message || 'Error loading material options');
    }
  };

  useEffect(() => {
    fetchEntries('');
    fetchOptions();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchEntries(search);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [search]);

  const handleSave = async () => {
    if (!formData.materialType) {
      toast.error('Material type is required', TOAST_OPTIONS);
      return;
    }

    if (!(Number(formData.usedQty) > 0)) {
      toast.error('Used quantity must be greater than 0', TOAST_OPTIONS);
      return;
    }

    const payload = {
      vehicle: formData.vehicle || null,
      materialType: formData.materialType,
      usedQty: Number(formData.usedQty),
      usedDate: formData.usedDate || undefined,
      notes: formData.notes
    };

    try {
      setLoading(true);
      if (editingId) {
        await apiClient.put(`/material-used/${editingId}`, payload);
        toast.success('Material used entry updated successfully', TOAST_OPTIONS);
      } else {
        await apiClient.post('/material-used', payload);
        toast.success('Material used entry added successfully', TOAST_OPTIONS);
      }
      resetForm();
      await fetchEntries();
      await fetchOptions();
      if (modalOnly && onModalFinish) {
        onModalFinish();
      }
    } catch (err) {
      toast.error(err.message || 'Error saving material used entry', TOAST_OPTIONS);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({
      vehicle: entry.vehicle?._id || '',
      materialType: entry.materialType?._id || '',
      usedQty: entry.usedQty || '',
      usedDate: entry.usedDate ? new Date(entry.usedDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      notes: entry.notes || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material used entry?')) {
      return;
    }

    try {
      await apiClient.delete(`/material-used/${id}`);
      toast.success('Material used entry deleted successfully', TOAST_OPTIONS);
      if (editingId === id) {
        resetForm();
      }
      await fetchEntries();
      await fetchOptions();
    } catch (err) {
      toast.error(err.message || 'Error deleting material used entry', TOAST_OPTIONS);
    }
  };

  const pageContent = (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,243,255,0.96),rgba(238,242,255,0.94))] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-500">Voucher</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Material Used</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Use this voucher when purchased material is consumed. Stock reduces automatically against the selected material.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Entries</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{entries.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Unit</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{selectedMaterial?.unit || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <MaterialUsedForm
        formData={formData}
        setFormData={setFormData}
        vehicles={vehicles}
        materials={materials}
        loading={loading}
        editingId={editingId}
        onSave={handleSave}
        onClose={modalOnly ? onModalFinish : null}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-bold text-slate-900">Material Usage History</p>
            <p className="mt-1 text-sm text-slate-500">Search by vehicle number, material name, or notes.</p>
          </div>
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search material used..."
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-100 md:max-w-xs"
          />
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="border-y border-slate-200 px-4 py-3 font-semibold">Used Date</th>
                <th className="border-y border-slate-200 px-4 py-3 font-semibold">Vehicle No</th>
                <th className="border-y border-slate-200 px-4 py-3 font-semibold">Material Type</th>
                <th className="border-y border-slate-200 px-4 py-3 font-semibold">Used Qty</th>
                <th className="border-y border-slate-200 px-4 py-3 font-semibold">Notes</th>
                <th className="border-y border-slate-200 px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500">Loading material used entries...</td>
                </tr>
              ) : entries.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-10 text-center text-slate-500">No material used entries found.</td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-700">
                      {entry.usedDate ? new Date(entry.usedDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{entry.vehicleNo || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.materialTypeName || entry.materialType?.name || '-'}</td>
                    <td className="px-4 py-3 text-slate-700">{entry.usedQty} {entry.unit || entry.materialType?.unit || ''}</td>
                    <td className="px-4 py-3 text-slate-600">{entry.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(entry)}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry._id)}
                          className="rounded-lg border border-rose-200 px-3 py-1.5 font-medium text-rose-700 transition hover:bg-rose-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (modalOnly) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
        <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] bg-slate-100 p-4 md:p-6">
          {pageContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.12),transparent_25%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_42%,#f8fafc_100%)] px-4 py-6">
      {pageContent}
    </div>
  );
}
