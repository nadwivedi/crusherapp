import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Eye, Loader2, Scale, Truck, Upload } from 'lucide-react';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';
import { handlePopupFormKeyDown } from '../../utils/popupFormKeyboard';
import { useFloatingDropdownPosition } from '../../utils/useFloatingDropdownPosition';
import AddVehiclePopup from '../Vehicle/component/AddVehiclePopup';

const formatDateForInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeForInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const hours = `${date.getHours()}`.padStart(2, '0');
  const minutes = `${date.getMinutes()}`.padStart(2, '0');
  return `${hours}:${minutes}`;
};

const initialFormData = {
  vehicleId: '',
  vehicleNo: '',
  boulderDate: formatDateForInput(),
  entryTime: '',
  exitTime: '',
  tareWeight: '',
  grossWeight: '',
  netWeight: '',
  slipImg: ''
};

export default function BoulderEntry({ onModalFinish = null, editingEntry = null }) {
  const [formData, setFormData] = useState(initialFormData);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMode, setOcrMode] = useState('');
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [isVehicleSectionActive, setIsVehicleSectionActive] = useState(false);
  const [vehicleListIndex, setVehicleListIndex] = useState(-1);
  const vehicleSectionRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const dateInputRef = useRef(null);
  const ocrFileInputRef = useRef(null);
  const ocrCameraInputRef = useRef(null);
  const inputClass = 'w-full rounded-lg border border-slate-400 bg-white px-2.5 py-1.5 text-[13px] text-gray-800 transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2';
  const labelClass = 'mb-1 block text-[11px] font-semibold text-gray-700 md:text-xs';
  const getVehicleDisplayName = (vehicle) => String(vehicle?.vehicleNumber || vehicle?.vehicleNo || '').trim();
  const isEditing = Boolean(editingEntry?._id);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      dateInputRef.current?.focus();
    });
  }, []);

  useEffect(() => {
    if (!editingEntry?._id) {
      setFormData(initialFormData);
      setVehicleQuery('');
      return;
    }

    const vehicleId = typeof editingEntry.vehicleId === 'object'
      ? editingEntry.vehicleId?._id || ''
      : editingEntry.vehicleId || '';
    const vehicleNo = getVehicleDisplayName(editingEntry.vehicleId) || editingEntry.vehicleNo || '';

    setFormData({
      vehicleId,
      vehicleNo,
      boulderDate: formatDateForInput(editingEntry.boulderDate || editingEntry.createdAt),
      entryTime: editingEntry.entryTime || formatTimeForInput(editingEntry.boulderDate || editingEntry.createdAt),
      exitTime: editingEntry.exitTime || '',
      tareWeight: editingEntry.tareWeight === 0 ? '0' : String(editingEntry.tareWeight || ''),
      grossWeight: editingEntry.grossWeight === 0 ? '0' : String(editingEntry.grossWeight || ''),
      netWeight: editingEntry.netWeight === 0 ? '0' : String(editingEntry.netWeight || ''),
      slipImg: editingEntry.slipImg || ''
    });
    setVehicleQuery(vehicleNo);
  }, [editingEntry]);

  const filteredVehicles = useMemo(() => {
    const search = vehicleQuery.trim().toLowerCase();
    if (!search) return vehicles;
    return vehicles.filter((vehicle) => getVehicleDisplayName(vehicle).toLowerCase().includes(search));
  }, [vehicles, vehicleQuery]);

  useEffect(() => {
    setVehicleListIndex(filteredVehicles.length > 0 ? 0 : -1);
  }, [filteredVehicles]);

  const vehicleDropdownStyle = useFloatingDropdownPosition(
    vehicleSectionRef,
    isVehicleSectionActive,
    [filteredVehicles.length, vehicleListIndex]
  );

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles', { params: { vehicleType: 'boulder' } });
      setVehicles(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const updateWeights = (nextValues) => {
    const tareWeight = parseFloat(nextValues.tareWeight) || 0;
    const grossWeight = parseFloat(nextValues.grossWeight) || 0;
    const netWeight = grossWeight > 0 && tareWeight > 0 ? Math.max(grossWeight - tareWeight, 0) : '';

    return {
      ...nextValues,
      netWeight: netWeight === '' ? '' : String(netWeight)
    };
  };

  const selectVehicle = (vehicle) => {
    if (!vehicle) return;

    const vehicleName = getVehicleDisplayName(vehicle);
    setFormData((prev) => updateWeights({
      ...prev,
      vehicleId: vehicle._id,
      vehicleNo: vehicleName,
      tareWeight: vehicle?.unladenWeight ?? prev.tareWeight
    }));
    setVehicleQuery(vehicleName);
    setIsVehicleSectionActive(false);
  };

  const openInlineVehicleForm = () => {
    setIsVehicleSectionActive(false);
    setShowVehicleForm(true);
  };

  const closeInlineVehicleForm = (shouldRefocusVehicle = true) => {
    setShowVehicleForm(false);

    if (!shouldRefocusVehicle) return;

    requestAnimationFrame(() => {
      vehicleInputRef.current?.focus();
      vehicleInputRef.current?.select?.();
      setIsVehicleSectionActive(true);
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => updateWeights({ ...prev, [name]: value }));
  };

  const handleVehicleFocus = () => {
    setIsVehicleSectionActive(true);
    setVehicleListIndex(filteredVehicles.length > 0 ? 0 : -1);
  };

  const handleVehicleInputChange = (event) => {
    const value = event.target.value;
    setVehicleQuery(value);
    setIsVehicleSectionActive(true);
    setFormData((prev) => ({
      ...prev,
      vehicleId: '',
      vehicleNo: value
    }));
  };

  const handleVehicleInputKeyDown = (event) => {
    if (event.key === 'Control' && !event.altKey && !event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      openInlineVehicleForm();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsVehicleSectionActive(true);
      setVehicleListIndex((prev) => {
        if (filteredVehicles.length === 0) return -1;
        return prev < filteredVehicles.length - 1 ? prev + 1 : 0;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setIsVehicleSectionActive(true);
      setVehicleListIndex((prev) => {
        if (filteredVehicles.length === 0) return -1;
        return prev > 0 ? prev - 1 : filteredVehicles.length - 1;
      });
      return;
    }

    if (event.key === 'Enter' && isVehicleSectionActive && filteredVehicles.length > 0) {
      event.preventDefault();
      const selectedVehicle = filteredVehicles[vehicleListIndex] || filteredVehicles[0];
      if (selectedVehicle) {
        selectVehicle(selectedVehicle);
      }
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vehicleId || !formData.vehicleNo || !formData.tareWeight || !formData.grossWeight) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        vehicleId: formData.vehicleId,
        vehicleNo: formData.vehicleNo.toUpperCase(),
        boulderDate: formData.boulderDate,
        entryTime: formData.entryTime,
        exitTime: formData.exitTime,
        tareWeight: parseFloat(formData.tareWeight),
        grossWeight: parseFloat(formData.grossWeight),
        netWeight: parseFloat(formData.netWeight),
        slipImg: formData.slipImg
      };

      if (isEditing) {
        await apiClient.put(`/boulders/${editingEntry._id}`, payload);
        toast.success('Boulder entry updated successfully');
      } else {
        await apiClient.post('/boulders', payload);
        toast.success('Boulder entry created successfully');
      }
      setFormData(initialFormData);
      setVehicleQuery('');
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

  const handleSlipUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingSlip(true);
      const body = new FormData();
      body.append('slip', file);

      const response = await apiClient.post('/uploads/slip', body, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setFormData((prev) => ({
        ...prev,
        slipImg: response?.url || response?.relativePath || ''
      }));
      toast.success('Slip uploaded successfully');
    } catch (error) {
      toast.error(error?.message || 'Error uploading slip');
    } finally {
      setUploadingSlip(false);
      event.target.value = '';
    }
  };

  const handleOcrFill = useCallback((data) => {
    if (!data) return;

    const ocrRaw = String(data.vehicleNo || '').trim().toUpperCase();
    const grossWeight = Number(data.grossWeight || 0);
    const tareWeight = Number(data.tareWeight || 0);
    const netWeight = Number(data.netWeight || 0) || Math.max(grossWeight - tareWeight, 0);
    const hasExtractedFields = Boolean(
      ocrRaw ||
      grossWeight > 0 ||
      tareWeight > 0 ||
      netWeight > 0 ||
      data.boulderDate ||
      data.entryTime ||
      data.exitTime
    );

    if (ocrRaw) {
      // --- Smart vehicle matching with last-4-digit fallback ---
      // 1. Exact match
      let matchedVehicle = vehicles.find(
        (v) => getVehicleDisplayName(v).toUpperCase() === ocrRaw
      );

      // 2. Last-4-digit match (handles OCR mistakes in prefix letters)
      if (!matchedVehicle) {
        const last4 = ocrRaw.replace(/\D/g, '').slice(-4); // last 4 digits only
        if (last4.length === 4) {
          matchedVehicle = vehicles.find((v) => {
            const vNo = getVehicleDisplayName(v).toUpperCase();
            const vLast4 = vNo.replace(/\D/g, '').slice(-4);
            return vLast4 === last4;
          });
        }
      }

      // 3. Partial string includes match (fallback)
      if (!matchedVehicle) {
        matchedVehicle = vehicles.find((v) =>
          getVehicleDisplayName(v).toUpperCase().includes(ocrRaw.slice(-4))
        );
      }

      const resolvedVehicleNo = matchedVehicle
        ? getVehicleDisplayName(matchedVehicle).toUpperCase()
        : ocrRaw;

      setVehicleQuery(resolvedVehicleNo);
      if (matchedVehicle) {
        selectVehicle(matchedVehicle);
      } else {
        setFormData((prev) => ({
          ...prev,
          vehicleNo: resolvedVehicleNo
        }));
      }
    }

    setFormData((prev) => updateWeights({
      ...prev,
      vehicleNo: ocrRaw || prev.vehicleNo,
      grossWeight: grossWeight > 0 ? grossWeight : prev.grossWeight,
      tareWeight: tareWeight > 0 ? tareWeight : prev.tareWeight,
      netWeight: netWeight > 0 ? netWeight : prev.netWeight,
      boulderDate: data.boulderDate || prev.boulderDate,
      entryTime: data.entryTime || prev.entryTime,
      exitTime: data.exitTime || prev.exitTime,
      slipImg: data.slipImg || prev.slipImg
    }));

    if (hasExtractedFields) {
      toast.success('Boulder slip data extracted!', { autoClose: 1500 });
    }
  }, [vehicles]);

  const uploadSlipFile = useCallback(async (file) => {
    const body = new FormData();
    body.append('slip', file);

    const response = await apiClient.post('/uploads/slip', body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response?.url || response?.relativePath || '';
  }, []);

  const sendImageToOcr = useCallback(async (file) => {
    if (!file) return;
    setIsOcrLoading(true);
    try {
      const slipImg = await uploadSlipFile(file);
      setFormData((prev) => ({
        ...prev,
        slipImg: slipImg || prev.slipImg
      }));
      const fd = new FormData();
      fd.append('image', file);
      const baseURL = String(apiClient.defaults.baseURL || '/api').replace(/\/+$/, '');
      const response = await fetch(`${baseURL}/ocr/extract-boulder`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'OCR failed' }));
        throw new Error(err.message || 'OCR failed');
      }

      const data = await response.json();
      handleOcrFill({ ...data, slipImg });
    } catch (error) {
      console.error('Boulder OCR error:', error);
      toast.error(error.message || 'Error scanning boulder slip');
    } finally {
      setIsOcrLoading(false);
      setOcrMode('');
    }
  }, [handleOcrFill, uploadSlipFile]);

  const handleOcrFileChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    await sendImageToOcr(file);
  }, [sendImageToOcr]);

  const handleOcrCameraChange = useCallback(async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    await sendImageToOcr(file);
  }, [sendImageToOcr]);

  const isSlipPreviewImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(String(formData.slipImg || ''));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-[2px] md:p-6" onClick={handleClose}>
      <div className="flex max-h-[88vh] w-full max-w-[30rem] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[linear-gradient(135deg,#2563eb_0%,#4338ca_55%,#7c3aed_100%)] px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold md:text-lg">{isEditing ? 'Edit Boulder Entry' : 'Add Boulder Entry'}</h2>
              <p className="text-[11px] text-white/80 md:text-xs">{isEditing ? 'Update boulder weight entry' : 'Register incoming boulder weight'}</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={ocrCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleOcrCameraChange}
                tabIndex={-1}
              />
              <input
                ref={ocrFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleOcrFileChange}
                tabIndex={-1}
              />
              <button
                type="button"
                onClick={() => { setOcrMode('camera'); ocrCameraInputRef.current?.click(); }}
                disabled={isOcrLoading}
                className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isOcrLoading && ocrMode === 'camera'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Camera className="h-3.5 w-3.5" />}
                {isOcrLoading && ocrMode === 'camera' ? 'Scanning...' : 'Scan Slip'}
              </button>
              <button
                type="button"
                onClick={() => { setOcrMode('upload'); ocrFileInputRef.current?.click(); }}
                disabled={isOcrLoading}
                className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isOcrLoading && ocrMode === 'upload'
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Upload className="h-3.5 w-3.5" />}
                {isOcrLoading && ocrMode === 'upload' ? 'Uploading...' : 'Upload Slip'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1.5 text-white transition hover:bg-white/20"
                aria-label="Close popup"
              >
                <svg className="h-5 w-5 md:h-6 md:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isOcrLoading && (
          <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-indigo-700">
              {ocrMode === 'camera' ? 'Reading captured boulder slip...' : 'Reading uploaded boulder slip...'}
            </p>
            <p className="text-xs text-slate-500">Extracting boulder entry with AI</p>
          </div>
        )}

        <form onSubmit={handleSubmit} onKeyDown={(e) => handlePopupFormKeyDown(e, handleClose)} className="flex flex-1 flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800 md:text-base">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">1</span>
                  Boulder Details
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <div className={`grid grid-cols-1 gap-3 ${formData.slipImg ? 'sm:grid-cols-3' : 'sm:grid-cols-1'}`}>
                    <div className="space-y-1">
                      <label className={labelClass}>Entry Date</label>
                      <input
                        ref={dateInputRef}
                        type="date"
                        name="boulderDate"
                        value={formData.boulderDate || ''}
                        onChange={handleChange}
                        className={`${inputClass} focus:ring-indigo-500`}
                        autoFocus
                      />
                    </div>

                    {formData.slipImg && (
                      <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                        <div className="space-y-1">
                          <label className={labelClass}>Entry Time</label>
                          <input
                            type="time"
                            name="entryTime"
                            value={formData.entryTime || ''}
                            onChange={handleChange}
                            className={`${inputClass} focus:ring-indigo-500`}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className={labelClass}>Exit Time</label>
                          <input
                            type="time"
                            name="exitTime"
                            value={formData.exitTime || ''}
                            onChange={handleChange}
                            className={`${inputClass} focus:ring-indigo-500`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Vehicle No</label>
                    <div
                      ref={vehicleSectionRef}
                      className="relative"
                      onFocusCapture={handleVehicleFocus}
                      onBlurCapture={(event) => {
                        const nextFocused = event.relatedTarget;
                        if (vehicleSectionRef.current && nextFocused instanceof Node && vehicleSectionRef.current.contains(nextFocused)) return;
                        setIsVehicleSectionActive(false);
                      }}
                    >
                      <div className="relative">
                        <Truck className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400" />
                        <input
                          ref={vehicleInputRef}
                          type="text"
                          value={vehicleQuery}
                          onChange={handleVehicleInputChange}
                          onKeyDown={handleVehicleInputKeyDown}
                          className={`${inputClass} pl-9 focus:ring-indigo-500`}
                          placeholder="Type to search vehicle..."
                          autoComplete="off"
                        />
                      </div>

                      {isVehicleSectionActive && vehicleDropdownStyle && (
                        <div
                          className="fixed z-[80] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                          style={vehicleDropdownStyle}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Vehicle List</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm">
                              {filteredVehicles.length}
                            </span>
                          </div>
                          <div className="overflow-y-auto py-1" style={{ maxHeight: vehicleDropdownStyle.maxHeight }}>
                            {filteredVehicles.length === 0 ? (
                              <div className="px-3 py-3 text-center text-[13px] text-slate-500">
                                No matching vehicles found.
                              </div>
                            ) : (
                              filteredVehicles.map((vehicle, index) => {
                                const isActive = index === vehicleListIndex;
                                const isSelected = String(formData.vehicleId || '') === String(vehicle._id);

                                return (
                                  <button
                                    key={vehicle._id}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setVehicleListIndex(index)}
                                    onClick={() => selectVehicle(vehicle)}
                                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                                      isActive
                                        ? 'bg-yellow-200 text-amber-950'
                                        : isSelected
                                        ? 'bg-yellow-50 text-amber-800'
                                        : 'text-slate-700 hover:bg-amber-50'
                                    }`}
                                  >
                                    <span className="truncate font-medium">{getVehicleDisplayName(vehicle)}</span>
                                    {isSelected && (
                                      <span className="shrink-0 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                        Selected
                                      </span>
                                    )}
                                  </button>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {isVehicleSectionActive ? (
                      <div className="mt-1 text-[11px] text-indigo-600">
                        Press <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[10px]">Ctrl</span> to create new vehicle
                      </div>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Slip Upload</label>
                    <input
                      id="boulder-slip-upload"
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={handleSlipUpload}
                      disabled={uploadingSlip}
                      className="hidden"
                    />
                    <label
                      htmlFor="boulder-slip-upload"
                      className={`flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-3 py-2 text-center text-[13px] font-semibold transition ${
                        uploadingSlip
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-500 opacity-75'
                          : 'border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50'
                      }`}
                    >
                      <Upload className="h-4 w-4" />
                      <span>{uploadingSlip ? 'Uploading...' : formData.slipImg ? 'Slip Uploaded' : 'Upload Slip'}</span>
                    </label>
                    {formData.slipImg ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        {isSlipPreviewImage ? (
                          <img
                            src={formData.slipImg}
                            alt="Slip preview"
                            className="h-40 w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-32 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-600">
                            Slip uploaded
                          </div>
                        )}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="truncate text-[12px] text-slate-500">{formData.slipImg}</p>
                          <a
                            href={formData.slipImg}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[12px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </a>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className={labelClass}>Gross Weight (KG)</label>
                      <input
                        type="number"
                        name="grossWeight"
                        value={formData.grossWeight || ''}
                        onChange={handleChange}
                        className={`${inputClass} focus:ring-indigo-500`}
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className={labelClass}>Tare Weight (KG)</label>
                      <input
                        type="number"
                        name="tareWeight"
                        value={formData.tareWeight || ''}
                        onChange={handleChange}
                        className={`${inputClass} focus:ring-indigo-500`}
                        placeholder="0"
                        step="0.01"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={labelClass}>Net Weight (KG)</label>
                    <div className="relative">
                      <Scale className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-indigo-400" />
                      <input
                        type="number"
                        name="netWeight"
                        value={formData.netWeight || ''}
                        readOnly
                        className={`${inputClass} bg-slate-100 pl-9 font-semibold text-emerald-700 focus:ring-indigo-500`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 bg-white px-4 py-3 md:flex-row">
            <div className="hidden text-[11px] text-gray-600 md:block md:text-xs">
              <kbd className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[10px]">Esc</kbd> to close
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-slate-50 md:flex-none md:px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[linear-gradient(135deg,#2563eb_0%,#4338ca_100%)] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-6"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
      {showVehicleForm ? (
        <AddVehiclePopup
          vehicle={null}
          defaultVehicleType="boulder"
          onClose={() => closeInlineVehicleForm(true)}
          onSave={fetchVehicles}
          onVehicleSaved={async (savedVehicle) => {
            if (!savedVehicle) return;
            setVehicles((prev) => [
              savedVehicle,
              ...prev.filter((item) => String(item._id) !== String(savedVehicle._id))
            ]);
            selectVehicle(savedVehicle);
            closeInlineVehicleForm(true);
          }}
        />
      ) : null}
    </div>
  );
}
