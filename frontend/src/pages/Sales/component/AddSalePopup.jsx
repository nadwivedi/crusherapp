import { useEffect, useRef, useState, useCallback } from 'react';
import { Building2, CalendarDays, Package, Truck, Camera, Upload, Loader2, Eye, AlertCircle, Check, X } from 'lucide-react';
import apiClient from '../../../utils/api';
import { handlePopupFormKeyDown } from '../../../utils/popupFormKeyboard';
import { useFloatingDropdownPosition } from '../../../utils/useFloatingDropdownPosition';
import DocumentScannerPreview from '../../../components/DocumentScannerPreview';

export default function AddSalePopup({
  showForm,
  editingId,
  loading,
  isCashParty,
  formData,
  currentItem,
  products,
  popupFieldClass,
  popupLabelClass,
  leadgerSectionRef,
  leadgerInputRef,
  vehicleSectionRef,
  vehicleInputRef,
  materialSectionRef,
  materialInputRef,
  basisSectionRef,
  basisInputRef,
  productSectionRef,
  productInputRef,
  leadgerQuery,
  vehicleQuery,
  materialQuery,
  productQuery,
  leadgerListIndex,
  vehicleListIndex,
  materialListIndex,
  basisListIndex,
  productListIndex,
  filteredLeadgers,
  filteredVehicles,
  filteredMaterialTypes,
  filteredProducts,
  isLeadgerSectionActive,
  isVehicleSectionActive,
  isMaterialSectionActive,
  isBasisSectionActive,
  isProductSectionActive,
  setCurrentItem,
  setIsLeadgerSectionActive,
  setIsVehicleSectionActive,
  setIsMaterialSectionActive,
  setIsBasisSectionActive,
  setIsProductSectionActive,
  setLeadgerListIndex,
  setVehicleListIndex,
  setMaterialListIndex,
  setBasisListIndex,
  setProductListIndex,
  getLeadgerDisplayName,
  getVehicleDisplayName,
  getMaterialDisplayName,
  getProductDisplayName,
  handleCancel,
  handleSubmit,
  handleInputChange,
  saleTypePreview,
  pendingAmountPreview,
  excessAmountPreview,
  handleLeadgerFocus,
  handleLeadgerInputChange,
  handleLeadgerInputKeyDown,
  handleVehicleFocus,
  handleVehicleInputChange,
  handleVehicleInputKeyDown,
  handleMaterialFocus,
  handleMaterialInputChange,
  handleMaterialInputKeyDown,
  handleBasisFocus,
  handleBasisInputKeyDown,
  getSaleBasisDisplayName,
  selectPricingMode,
  onOpenNewVehicle,
  onOpenNewParty,
  handleProductFocus,
  handleProductInputChange,
  handleProductInputKeyDown,
  onOpenNewProduct,
  handleSelectEnterMoveNext,
  handleAddItem,
  handleRemoveItem,
  selectLeadger,
  selectVehicle,
  selectProduct,
  onOcrFill,
  ocrVehicleMismatch,
  setOcrVehicleMismatch
}) {
  const localProductInputRef = useRef(null);
  const paidAmountInputRef = useRef(null);
  const ocrFileInputRef = useRef(null);
  const ocrCameraInputRef = useRef(null);
  const [isItemEntryClosed, setIsItemEntryClosed] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrMode, setOcrMode] = useState(''); // 'camera' | 'upload'
  const [scannerFile, setScannerFile] = useState(null);
  const isSlipPreviewImage = /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(String(formData?.slipImg || ''));

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
    if (!file || !onOcrFill) return;
    setIsOcrLoading(true);
    try {
      const slipImg = await uploadSlipFile(file);
      onOcrFill({ slipImg });
      const fd = new FormData();
      fd.append('image', file);
      const baseURL = String(apiClient.defaults.baseURL || '/api').replace(/\/+$/, '');
      const response = await fetch(`${baseURL}/ocr/extract-sale`, {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: 'OCR failed' }));
        throw new Error(err.message || 'OCR failed');
      }
      const data = await response.json();
      onOcrFill({ ...data, slipImg });
    } catch (err) {
      console.error('OCR error:', err);
      alert(`Scan failed: ${err.message}`);
    } finally {
      setIsOcrLoading(false);
      setOcrMode('');
    }
  }, [onOcrFill, uploadSlipFile]);

  const handleOcrFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setScannerFile(file);
  }, []);

  const handleOcrCameraChange = useCallback((e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) setScannerFile(file);
  }, []);
  const inputClass = "w-full rounded-lg border border-slate-400 bg-white px-2.5 py-1.5 text-[13px] text-gray-800 transition placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2";
  const labelClass = "mb-1 block text-[11px] font-semibold text-gray-700 md:text-xs";
  const currentItemTotal = Math.max(0, Number(currentItem.quantity || 0) * Number(currentItem.unitPrice || 0));
  const resolvedProductInputRef = productInputRef || localProductInputRef;
  const leadgerDropdownStyle = useFloatingDropdownPosition(leadgerSectionRef, isLeadgerSectionActive, [filteredLeadgers.length, leadgerListIndex]);
  const vehicleDropdownStyle = useFloatingDropdownPosition(vehicleSectionRef, isVehicleSectionActive, [filteredVehicles.length, vehicleListIndex]);
  const materialDropdownStyle = useFloatingDropdownPosition(materialSectionRef, isMaterialSectionActive, [filteredMaterialTypes.length, materialListIndex]);
  const productDropdownStyle = useFloatingDropdownPosition(productSectionRef, isProductSectionActive, [filteredProducts.length, productListIndex]);
  const resolveItemUnit = (item) => {
    const itemUnit = String(item?.unit || '').trim();
    if (itemUnit) return itemUnit;

    const matchingProduct = products.find((product) => String(product?._id) === String(item?.product || ''));
    return String(matchingProduct?.unit || '').trim() || '-';
  };
  const currentItemUnit = String(currentItem.unit || '').trim() || '-';

  useEffect(() => {
    if (showForm) {
      setIsItemEntryClosed(false);
    }
  }, [showForm, editingId]);

  if (!showForm) return null;

  const closeItemEntryRow = () => {
    selectProduct(null);
    setCurrentItem((prev) => ({
      ...prev,
      quantity: '',
      unitPrice: ''
    }));
    setIsProductSectionActive(false);
    setIsItemEntryClosed(true);
  };

  const closeItemEntryAndFocusPaidAmount = () => {
    closeItemEntryRow();
    requestAnimationFrame(() => {
      if (isCashParty) {
        const submitButton = resolvedProductInputRef.current
          ?.closest('form')
          ?.querySelector('button[type="submit"]:not([disabled])');
        submitButton?.focus();
        return;
      }
      paidAmountInputRef.current?.focus();
      paidAmountInputRef.current?.select?.();
    });
  };

  const reopenItemEntryFromPaidAmount = () => {
    setIsItemEntryClosed(false);
    setIsProductSectionActive(true);
    setProductListIndex(filteredProducts.length > 0 ? 0 : -1);
    requestAnimationFrame(() => {
      resolvedProductInputRef.current?.focus();
      resolvedProductInputRef.current?.select?.();
    });
  };

  const handlePaidAmountEnterSubmit = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-[2px] md:items-center md:p-6" onClick={handleCancel}>
      <div className="relative flex h-[100dvh] max-h-[100dvh] w-full max-w-[30rem] md:max-w-[50rem] flex-col overflow-hidden rounded-none border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.28)] md:h-auto md:max-h-[88vh] md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="bg-[linear-gradient(135deg,#2563eb_0%,#4338ca_55%,#7c3aed_100%)] px-4 py-3 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold md:text-lg">
              {editingId ? 'Edit Sale Entry' : 'Add New Sale'}
            </h2>
            <div className="flex items-center gap-2">
              {onOcrFill && (
                <>
                  {/* Camera capture input — opens device camera directly */}
                  <input
                    ref={ocrCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleOcrCameraChange}
                    tabIndex={-1}
                  />
                  {/* File/gallery upload input */}
                  <input
                    ref={ocrFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleOcrFileChange}
                    tabIndex={-1}
                  />

                  {/* Scan Slip — camera */}
                  <button
                    type="button"
                    onClick={() => { setOcrMode('camera'); ocrCameraInputRef.current?.click(); }}
                    disabled={isOcrLoading}
                    title="Open camera and capture slip photo"
                    className="flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/15 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOcrLoading && ocrMode === 'camera'
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Camera className="h-3.5 w-3.5" />}
                    {isOcrLoading && ocrMode === 'camera' ? 'Scanning...' : 'Scan Slip'}
                  </button>

                  {/* Upload Slip — file picker */}
                  <button
                    type="button"
                    onClick={() => { setOcrMode('upload'); ocrFileInputRef.current?.click(); }}
                    disabled={isOcrLoading}
                    title="Upload slip image from your device"
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-400/50 bg-emerald-500/20 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isOcrLoading && ocrMode === 'upload'
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Upload className="h-3.5 w-3.5" />}
                    {isOcrLoading && ocrMode === 'upload' ? 'Uploading...' : 'Upload Slip'}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleCancel}
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
              {ocrMode === 'camera' ? 'Reading captured photo...' : 'Reading uploaded slip...'}
            </p>
            <p className="text-xs text-slate-500">Extracting data with AI</p>
          </div>
        )}

        {scannerFile && (
          <DocumentScannerPreview
            file={scannerFile}
            onCancel={() => setScannerFile(null)}
            onConfirm={async (processedFile) => {
              setScannerFile(null);
              await sendImageToOcr(processedFile);
            }}
          />
        )}

        <form id="sales-form" onSubmit={handleSubmit} onKeyDown={(e) => handlePopupFormKeyDown(e, handleCancel)} className="flex flex-1 flex-col overflow-hidden bg-white">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-800 md:text-base">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">1</span>
                    Sale Details
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                  <div className={`grid grid-cols-1 gap-3 ${formData?.slipImg ? 'md:grid-cols-2 xl:grid-cols-5' : 'md:grid-cols-3'}`}>
                    <div className="space-y-1">
                      <label className={labelClass}>Invoice Date</label>
                      <div className="relative">
                        <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400 pointer-events-none" />
                        <input
                          type="date"
                          name="saleDate"
                          value={formData.saleDate}
                          onChange={handleInputChange}
                          onKeyDown={handleSelectEnterMoveNext}
                          autoFocus
                          className={`${inputClass} pl-9 focus:ring-indigo-500`}
                        />
                      </div>
                    </div>

                    {formData?.slipImg && (
                      <>
                        <div className="space-y-1">
                          <label className={labelClass}>Entry Time</label>
                          <input
                            type="time"
                            name="entryTime"
                            value={formData.entryTime || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Exit Time</label>
                          <input
                            type="time"
                            name="exitTime"
                            value={formData.exitTime || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-1">
                      <label className={labelClass}>Material Type</label>
                      <div
                        ref={materialSectionRef}
                        className="relative"
                        onFocusCapture={handleMaterialFocus}
                        onBlurCapture={(event) => {
                          const nextFocused = event.relatedTarget;
                          if (materialSectionRef.current && nextFocused instanceof Node && materialSectionRef.current.contains(nextFocused)) return;
                          const selectedMaterial = filteredMaterialTypes.find((item) => String(item.value) === String(formData.materialType))
                            || (formData.materialType ? { value: formData.materialType, label: materialQuery } : null);
                          setIsMaterialSectionActive(false);
                          if (selectedMaterial) {
                            handleMaterialInputChange({ target: { value: getMaterialDisplayName(selectedMaterial) } });
                          }
                        }}
                      >
                        <div className="relative">
                          <input
                            ref={materialInputRef}
                            type="text"
                            value={materialQuery}
                            onChange={handleMaterialInputChange}
                            onKeyDown={handleMaterialInputKeyDown}
                            className={`${inputClass} pr-10 focus:ring-indigo-500`}
                            placeholder="Type to search material..."
                            autoComplete="off"
                          />
                        </div>

                        {isMaterialSectionActive && materialDropdownStyle && (
                          <div
                            className="fixed z-[80] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                            style={materialDropdownStyle}
                            onClick={(event) => event.stopPropagation()}
                          >
                            <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2">
                              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Material List</span>
                              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm">
                                {filteredMaterialTypes.length}
                              </span>
                            </div>
                            <div className="overflow-y-auto py-1" style={{ maxHeight: materialDropdownStyle.maxHeight }}>
                              {filteredMaterialTypes.length === 0 ? (
                                <div className="px-3 py-3 text-center text-[13px] text-slate-500">
                                  No matching materials found.
                                </div>
                              ) : (
                                filteredMaterialTypes.map((material, index) => {
                                  const isActive = index === materialListIndex;
                                  const isSelected = String(formData.materialType || '') === String(material.value);

                                  return (
                                    <button
                                      key={material.value}
                                      type="button"
                                      onMouseDown={(event) => event.preventDefault()}
                                      onMouseEnter={() => setMaterialListIndex(index)}
                                      onClick={() => {
                                        handleMaterialInputChange({ target: { value: getMaterialDisplayName(material) } });
                                        setIsMaterialSectionActive(false);
                                      }}
                                      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                                        isActive
                                          ? 'bg-yellow-200 text-amber-950'
                                          : isSelected
                                          ? 'bg-yellow-50 text-amber-800'
                                          : 'text-slate-700 hover:bg-amber-50'
                                      }`}
                                    >
                                      <span className="truncate font-medium">{getMaterialDisplayName(material)}</span>
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
                    </div>

                    <div className="space-y-1">
                      <div className="relative mb-1 min-h-[16px]">
                        <label className={`${labelClass} absolute left-0 top-0`}>Sale Basis</label>
                      </div>
                      <div
                        ref={basisSectionRef}
                        className="relative"
                        onBlurCapture={(event) => {
                          const nextFocused = event.relatedTarget;
                          if (basisSectionRef.current && nextFocused instanceof Node && basisSectionRef.current.contains(nextFocused)) return;
                          setIsBasisSectionActive(false);
                        }}
                      >
                        <div className="relative">
                          <input
                            ref={basisInputRef}
                            type="text"
                            value={getSaleBasisDisplayName(formData.pricingMode || 'per_ton')}
                            onFocus={handleBasisFocus}
                            onClick={handleBasisFocus}
                            onKeyDown={handleBasisInputKeyDown}
                            readOnly
                            className={`${inputClass} cursor-pointer pr-10 focus:ring-indigo-500`}
                          />
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.51a.75.75 0 0 1-1.08 0l-4.25-4.51a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
                            </svg>
                          </span>
                        </div>

                        {isBasisSectionActive && (
                          <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-[0_20px_45px_rgba(15,23,42,0.16)]">
                            <div className="max-h-48 overflow-y-auto py-1.5">
                              {[
                                { value: 'per_ton', label: 'Per Ton' },
                                { value: 'per_cubic_meter', label: 'Per Cubic Meter' }
                              ].map((option, index) => {
                                const isActive = index === basisListIndex;
                                const isSelected = String(formData.pricingMode || 'per_ton') === String(option.value);

                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setBasisListIndex(index)}
                                    onClick={() => {
                                      selectPricingMode(option.value);
                                      setIsBasisSectionActive(false);
                                    }}
                                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                                      isActive
                                        ? 'bg-yellow-200 text-amber-950'
                                        : isSelected
                                        ? 'bg-yellow-50 text-amber-800'
                                        : 'text-slate-700 hover:bg-amber-50'
                                    }`}
                                  >
                                    <span className="truncate font-medium">{option.label}</span>
                                    {isSelected && (
                                      <span className="shrink-0 rounded-full border border-amber-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                        Selected
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <div className="relative mb-1 min-h-[16px]">
                      <label className="flex items-center gap-1.5 pr-24 text-[11px] font-semibold text-gray-700 md:text-xs">
                        <Truck className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Vehicle No</span>
                      </label>
                      {isVehicleSectionActive && (
                        <button
                          type="button"
                          onClick={onOpenNewVehicle}
                          className="absolute right-0 -top-2 inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[9px] text-indigo-700">Ctrl</span>
                          New Vehicle
                        </button>
                      )}
                    </div>
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
                        <input
                          ref={vehicleInputRef}
                          type="text"
                          name="vehicleNo"
                          value={vehicleQuery}
                          onChange={handleVehicleInputChange}
                          onKeyDown={handleVehicleInputKeyDown}
                          autoComplete="off"
                          className={`${inputClass} focus:ring-indigo-500`}
                          placeholder="Type to search vehicle..."
                        />
                      </div>

                      {ocrVehicleMismatch && (
                        <div className="mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                          <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                              <div className="flex-1">
                                <p className="text-[12px] font-bold text-amber-900">Vehicle Mismatch Confirmation</p>
                                <p className="text-[11px] text-amber-700">OCR read "<span className="font-bold underlineDecoration">{ocrVehicleMismatch.ocrValue}</span>" but we matched "<span className="font-bold">{ocrVehicleMismatch.matchedValue}</span>" from your list based on the last 4 digits.</p>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center justify-end gap-2">
                              <span className="text-[10px] font-medium text-amber-600">Which one is correct?</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleVehicleInputChange({ target: { value: ocrVehicleMismatch.ocrValue } });
                                  setOcrVehicleMismatch(null);
                                }}
                                className="flex items-center gap-1.5 rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-amber-700 transition hover:bg-amber-100"
                              >
                                <X className="h-3 w-3" />
                                {ocrVehicleMismatch.ocrValue}
                              </button>
                              <button
                                type="button"
                                onClick={() => setOcrVehicleMismatch(null)}
                                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-bold text-white transition hover:bg-amber-700 shadow-sm"
                              >
                                <Check className="h-3 w-3" />
                                {ocrVehicleMismatch.matchedValue}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

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
                                <p>No matching vehicles found.</p>
                                <button
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={onOpenNewVehicle}
                                  className="mt-2 inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                  Create New Vehicle
                                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-indigo-700">Ctrl</span>
                                </button>
                              </div>
                            ) : (
                              filteredVehicles.map((vehicle, index) => {
                                const isActive = index === vehicleListIndex;
                                const isSelected = String(formData.vehicleNo || '') === String(getVehicleDisplayName(vehicle));

                                return (
                                  <button
                                    key={vehicle._id}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setVehicleListIndex(index)}
                                    onClick={() => {
                                      selectVehicle(vehicle);
                                      setIsVehicleSectionActive(false);
                                    }}
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
                  </div>

                  <div className="relative space-y-1">
                    <div className="relative mb-1 min-h-[16px]">
                      <label className="block pr-24 text-[11px] font-semibold text-gray-700 md:text-xs">Party Name</label>
                      {isLeadgerSectionActive && (
                        <button
                          type="button"
                          onClick={onOpenNewParty}
                          className="absolute right-0 -top-2 inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2 py-1 text-[10px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
                        >
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-mono text-[9px] text-indigo-700">Ctrl</span>
                          New Party
                        </button>
                      )}
                    </div>
                    <div
                      ref={leadgerSectionRef}
                      className="relative"
                      onFocusCapture={handleLeadgerFocus}
                      onBlurCapture={(event) => {
                        const nextFocused = event.relatedTarget;
                        if (leadgerSectionRef.current && nextFocused instanceof Node && leadgerSectionRef.current.contains(nextFocused)) return;
                        setIsLeadgerSectionActive(false);
                      }}
                    >
                        <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400 pointer-events-none" />
                        <input
                          ref={leadgerInputRef}
                          type="text"
                          value={leadgerQuery}
                          onChange={handleLeadgerInputChange}
                          onKeyDown={handleLeadgerInputKeyDown}
                          className={`${inputClass} pl-9 focus:ring-indigo-500`}
                          placeholder="Type to search party..."
                          autoComplete="off"
                        />
                      </div>

                      {isLeadgerSectionActive && leadgerDropdownStyle && (
                        <div
                          className="fixed z-[80] overflow-hidden rounded-xl border border-amber-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]"
                          style={leadgerDropdownStyle}
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex items-center justify-between border-b border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 px-3 py-2">
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Party List</span>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm">
                              {filteredLeadgers.length}
                            </span>
                          </div>
                          <div className="overflow-y-auto py-1" style={{ maxHeight: leadgerDropdownStyle.maxHeight }}>
                            {filteredLeadgers.length === 0 ? (
                              <div className="px-3 py-3 text-center text-[13px] text-slate-500">
                                <p>No matching parties found.</p>
                                <button
                                  type="button"
                                  onMouseDown={(event) => event.preventDefault()}
                                  onClick={onOpenNewParty}
                                  className="mt-2 inline-flex items-center gap-2 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[12px] font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                  Create New Party
                                  <span className="rounded bg-white px-1.5 py-0.5 font-mono text-[10px] text-indigo-600">Ctrl</span>
                                </button>
                              </div>
                            ) : (
                              filteredLeadgers.map((leadger, index) => {
                                const isActive = index === leadgerListIndex;
                                const isSelected = String(formData.party || '') === String(leadger._id);

                                return (
                                  <button
                                    key={leadger._id}
                                    type="button"
                                    onMouseDown={(event) => event.preventDefault()}
                                    onMouseEnter={() => setLeadgerListIndex(index)}
                                    onClick={() => selectLeadger(leadger)}
                                    className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition ${
                                      isActive
                                        ? 'bg-yellow-200 text-amber-950'
                                        : isSelected
                                        ? 'bg-yellow-50 text-amber-800'
                                        : 'text-slate-700 hover:bg-amber-50'
                                    }`}
                                  >
                                    <span className="truncate font-medium">{getLeadgerDisplayName(leadger)}</span>
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
                  </div>

                  </div>

                  {formData.pricingMode === 'per_ton' ? (
                    <>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <label className={labelClass}>Gross Weight (KG)</label>
                          <input
                            type="number"
                            name="grossWeight"
                            value={formData.grossWeight || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
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
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                            placeholder="0"
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Net Weight (KG)</label>
                          <input
                            type="number"
                            name="netWeight"
                            value={formData.netWeight || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} bg-gray-50 font-semibold text-emerald-700 focus:ring-indigo-500`}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            readOnly
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <label className={labelClass}>Rate Per Ton</label>
                          <input
                            type="number"
                            name="rate"
                            value={formData.rate || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Total Amount</label>
                          <input
                            type="number"
                            name="totalAmount"
                            value={formData.totalAmount || 0}
                            readOnly
                            className={`${inputClass} bg-slate-100 font-semibold text-emerald-700 focus:ring-indigo-500`}
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-1">
                          <label className={labelClass}>Cubic Meter Qty (M3)</label>
                          <input
                            type="number"
                            name="cubicMeterQty"
                            value={formData.cubicMeterQty || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Rate Per M3</label>
                          <input
                            type="number"
                            name="rate"
                            value={formData.rate || ''}
                            onChange={handleInputChange}
                            onKeyDown={handleSelectEnterMoveNext}
                            className={`${inputClass} focus:ring-indigo-500`}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className={labelClass}>Total Amount</label>
                          <input
                            type="number"
                            name="totalAmount"
                            value={formData.totalAmount || 0}
                            readOnly
                            className={`${inputClass} bg-slate-100 font-semibold text-emerald-700 focus:ring-indigo-500`}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-800">
                        Total amount is calculated from `cubic meter qty x rate per m3`. Weight fields are not needed for per cubic meter sales.
                      </div>
                    </>
                  )}

                  <div className="space-y-1">
                    <label className={labelClass}>Paid Amount</label>
                    <input
                      ref={paidAmountInputRef}
                      type="number"
                      name="paidAmount"
                      value={formData.paidAmount || ''}
                      onChange={handleInputChange}
                      onKeyDown={handlePaidAmountEnterSubmit}
                      className={`${inputClass} focus:ring-indigo-500`}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800">{saleTypePreview || 'Credit Sale'}</p>
                      <p className="mt-1">Pending: Rs {Number(pendingAmountPreview || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      {Number(excessAmountPreview || 0) > 0 ? (
                        <p className="mt-1 text-sky-700">Extra receipt for old dues: Rs {Number(excessAmountPreview || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      ) : null}
                    </div>
                  </div>

                  {formData?.slipImg ? (
                    <div className="space-y-1">
                      <label className={labelClass}>Slip Image</label>
                      <div className="rounded-xl border border-slate-200 bg-white p-2">
                        {isSlipPreviewImage ? (
                          <img
                            src={formData.slipImg}
                            alt="Slip preview"
                            className="h-36 w-full rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-28 items-center justify-center rounded-lg bg-slate-100 text-sm font-medium text-slate-600">
                            Slip ready to save
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
                    </div>
                  ) : null}
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
                onClick={handleCancel}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-slate-50 md:flex-none md:px-5"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="sales-form"
                disabled={loading}
                className="flex-1 rounded-lg bg-[linear-gradient(135deg,#2563eb_0%,#4338ca_100%)] px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50 md:flex-none md:px-6"
              >
                {loading ? 'Saving...' : editingId ? 'Update Sale' : 'Save Sale'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
