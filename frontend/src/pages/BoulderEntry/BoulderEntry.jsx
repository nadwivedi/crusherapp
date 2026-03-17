import { useState, useEffect } from 'react';
import { X, Truck, Scale, Image } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';

const initialFormData = {
  vehicleId: '',
  vehicleNo: '',
  vehicleWeight: '',
  netWeight: '',
  boulderWeight: '',
  slipImg: ''
};

export default function BoulderEntry({ modalOnly = false, onModalFinish = null }) {
  const [formData, setFormData] = useState(initialFormData);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [boulders, setBoulders] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchBoulders();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles');
      setVehicles(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchBoulders = async () => {
    try {
      const response = await apiClient.get('/boulders');
      setBoulders(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching boulders:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === 'vehicleId') {
      const selectedVehicle = vehicles.find(v => v._id === value);
      if (selectedVehicle) {
        setFormData((prev) => ({ ...prev, vehicleNo: selectedVehicle.vehicleNumber || '' }));
      }
    }
  };

  const calculateNetWeight = () => {
    const vw = parseFloat(formData.vehicleWeight) || 0;
    const nw = parseFloat(formData.netWeight) || 0;
    if (nw > 0 && vw > 0) {
      const bw = nw - vw;
      setFormData((prev) => ({ ...prev, boulderWeight: bw.toString() }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vehicleId || !formData.vehicleNo || !formData.vehicleWeight || !formData.netWeight) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId: formData.vehicleId,
        vehicleNo: formData.vehicleNo.toUpperCase(),
        vehicleWeight: parseFloat(formData.vehicleWeight),
        netWeight: parseFloat(formData.netWeight),
        boulderWeight: parseFloat(formData.boulderWeight) || (parseFloat(formData.netWeight) - parseFloat(formData.vehicleWeight)),
        slipImg: formData.slipImg
      };

      await apiClient.post('/boulders', payload);
      toast.success('Boulder entry created successfully');
      setFormData(initialFormData);
      fetchBoulders();
      if (onModalFinish) {
        onModalFinish();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating boulder entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (onModalFinish) {
      onModalFinish();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 text-white">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Boulder Entry</h2>
              <p className="text-xs text-slate-500">Register incoming boulder weight</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Vehicle <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  required
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.vehicleNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNo"
                  value={formData.vehicleNo}
                  onChange={handleChange}
                  placeholder="Auto-filled from vehicle"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Vehicle Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="vehicleWeight"
                  value={formData.vehicleWeight}
                  onChange={handleChange}
                  placeholder="Enter empty vehicle weight"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Net Weight (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="netWeight"
                  value={formData.netWeight}
                  onChange={handleChange}
                  onBlur={calculateNetWeight}
                  placeholder="Enter loaded vehicle weight"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Boulder Weight (kg)
                </label>
                <input
                  type="number"
                  name="boulderWeight"
                  value={formData.boulderWeight}
                  onChange={handleChange}
                  placeholder="Auto-calculated (Net - Vehicle)"
                  step="0.01"
                  min="0"
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                  readOnly
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Slip Image URL
                </label>
                <input
                  type="text"
                  name="slipImg"
                  value={formData.slipImg}
                  onChange={handleChange}
                  placeholder="Enter slip image URL"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-600 hover:to-fuchsia-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </form>

          {boulders.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">Recent Entries</h3>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Vehicle</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Vehicle Wt</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Net Wt</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Boulder Wt</th>
                      <th className="px-3 py-2 text-left font-semibold text-slate-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boulders.slice(0, 5).map((boulder, index) => (
                      <tr key={boulder._id || index} className="border-t border-slate-200">
                        <td className="px-3 py-2">{boulder.vehicleNo}</td>
                        <td className="px-3 py-2">{boulder.vehicleWeight}</td>
                        <td className="px-3 py-2">{boulder.netWeight}</td>
                        <td className="px-3 py-2 font-medium text-violet-600">{boulder.boulderWeight}</td>
                        <td className="px-3 py-2">{new Date(boulder.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
