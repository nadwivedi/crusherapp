import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarDays, Plus, Search, Truck } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'react-toastify';
import apiClient from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { getSmartVehicleMatch, normalizeVehicleValue } from '../../utils/vehicleMatching';
import AddPartyPopup from '../Party/component/AddPartyPopup';
import AddProductPopup from '../Products/component/AddProductPopup';
import AddVehiclePopup from '../Vehicle/component/AddVehiclePopup';
import AddSalePopup from './component/AddSalePopup';

const isCompleteVehicleNumber = (value) => normalizeVehicleValue(value).length >= 9;

const MATERIAL_TYPE_OPTIONS = [
  { value: '60mm', label: '60mm' },
  { value: '40mm', label: '40mm' },
  { value: '20mm', label: '20mm' },
  { value: '10mm', label: '10mm' },
  { value: '6mm', label: '6mm' },
  { value: '4mm', label: '4mm' },
  { value: 'wmm', label: 'WMM' },
  { value: 'gsb', label: 'GSB' },
  { value: 'dust', label: 'Dust' }
];

const formatDateForInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toISOString().split('T')[0];
};

const formatTimeForInput = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const combineSaleDateTime = (dateValue, timeValue) => {
  const date = dateValue instanceof Date ? new Date(dateValue) : new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;

  const normalizedTime = String(timeValue || '').trim();
  if (!normalizedTime) return date;

  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);
  if (!timeMatch) return date;

  const [, hourText, minuteText] = timeMatch;
  date.setHours(Number(hourText), Number(minuteText), 0, 0);
  return date;
};

const parseSaleDate = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) return null;

  const yyyymmddMatch = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const ddmmyyyyMatch = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);

  let dayText;
  let monthText;
  let yearText;

  if (yyyymmddMatch) {
    [, yearText, monthText, dayText] = yyyymmddMatch;
  } else if (ddmmyyyyMatch) {
    [, dayText, monthText, yearText] = ddmmyyyyMatch;
  } else {
    return null;
  }

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime())
    || date.getFullYear() !== year
    || date.getMonth() !== month - 1
    || date.getDate() !== day
  ) {
    return null;
  }

  return date;
};

const getInitialFormData = () => ({
  saleDate: formatDateForInput(),
  entryTime: '',
  exitTime: '',
  party: '',
  vehicleId: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  vehicleNo: '',
  materialType: '',
  tareWeight: '',
  grossWeight: '',
  netWeight: '',
  rate: '',
  totalAmount: 0,
  paidAmount: '',
  slipImg: '',
  notes: '',
  items: []
});

const getInitialPartyFormData = (type = 'customer') => ({
  type,
  name: '',
  mobile: '',
  email: '',
  address: '',
  state: '',
  pincode: '',
  openingBalance: '',
  openingBalanceType: type === 'supplier' ? 'payable' : 'receivable',
  tenMmRate: '',
  twentyMmRate: '',
  fortyMmRate: '',
  wmmRate: '',
  gsbRate: '',
  dustRate: '',
  boulderRatePerTon: ''
});

const toTitleCase = (value) => String(value || '')
  .toLowerCase()
  .replace(/\b[a-z]/g, (char) => char.toUpperCase());

const getSalePriceInputValue = (product) => String(Number(product?.salePrice || 0));
const calculateSaleTotalAmount = (netWeight, ratePerTon) => {
  const numericNetWeight = Number(netWeight || 0);
  const numericRate = Number(ratePerTon || 0);
  if (!Number.isFinite(numericNetWeight) || !Number.isFinite(numericRate)) return 0;
  return (numericNetWeight / 1000) * numericRate;
};

const getCrusherMaterialRate = (user, materialType) => {
  const rates = user?.materialRates || {};

  if (materialType === '10mm') return Number(rates.tenMmRate || 0);
  if (materialType === '20mm') return Number(rates.twentyMmRate || 0);
  if (materialType === '40mm') return Number(rates.fortyMmRate || 0);
  if (materialType === '60mm') return Number(rates.sixtyMmRate || 0);
  if (materialType === '6mm') return Number(rates.sixMmRate || 0);
  if (materialType === '4mm') return Number(rates.fourMmRate || 0);
  if (materialType === 'wmm') return Number(rates.wmmRate || 0);
  if (materialType === 'gsb') return Number(rates.gsbRate || 0);
  if (materialType === 'dust') return Number(rates.dustRate || 0);
  return 0;
};

const deriveSaleType = (totalAmountValue, paidAmountValue) => {
  const totalAmount = Math.max(0, Number(totalAmountValue || 0));
  const paidAmount = Math.max(0, Number(paidAmountValue || 0));

  if (paidAmount <= 0) return 'credit sale';
  if (paidAmount === totalAmount) return 'cash sale';
  return 'sale';
};

const formatSaleTypeLabel = (value) => {
  if (value === 'sale') return 'Sale';
  if (value === 'cash sale') return 'Cash Sale';
  return 'Credit Sale';
};

const getMaterialBadgeClass = (value) => {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === '60mm') return 'border border-rose-200 bg-rose-50 text-rose-700';
  if (normalized === '40mm') return 'border border-violet-200 bg-violet-50 text-violet-700';
  if (normalized === '20mm') return 'border border-emerald-200 bg-emerald-50 text-emerald-700';
  if (normalized === '10mm') return 'border border-sky-200 bg-sky-50 text-sky-700';
  if (normalized === '6mm') return 'border border-cyan-200 bg-cyan-50 text-cyan-700';
  if (normalized === '4mm') return 'border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700';
  if (normalized === 'wmm') return 'border border-amber-200 bg-amber-50 text-amber-700';
  if (normalized === 'gsb') return 'border border-lime-200 bg-lime-50 text-lime-700';
  if (normalized === 'dust') return 'border border-slate-200 bg-slate-100 text-slate-700';

  return 'border border-orange-200 bg-orange-50 text-orange-700';
};

const sortVehiclesByTypePreference = (vehicles, preferredType) => [...vehicles].sort((a, b) => {
  const aPreferred = a?.vehicleType === preferredType ? 0 : 1;
  const bPreferred = b?.vehicleType === preferredType ? 0 : 1;
  if (aPreferred !== bPreferred) return aPreferred - bPreferred;

  return String(a?.vehicleNo || '').localeCompare(String(b?.vehicleNo || ''));
});

const SALES_RANGE_OPTIONS = [
  { value: '3d', label: 'Last 3 Days' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'currentYear', label: 'Current Year' },
  { value: 'lifetime', label: 'Lifetime' }
];

const isWithinRange = (value, range) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  if (range === '3d') {
    start.setDate(today.getDate() - 2);
    return date >= start && date <= today;
  }
  if (range === '7d') {
    start.setDate(today.getDate() - 6);
    return date >= start && date <= today;
  }
  if (range === '30d') {
    start.setDate(today.getDate() - 29);
    return date >= start && date <= today;
  }
  if (range === '90d') {
    start.setDate(today.getDate() - 89);
    return date >= start && date <= today;
  }
  if (range === 'currentYear') {
    const yearStart = new Date(today.getFullYear(), 0, 1);
    yearStart.setHours(0, 0, 0, 0);
    return date >= yearStart && date <= today;
  }

  return true;
};

export default function Sales({ modalOnly = false, onModalFinish = null }) {
  const toastOptions = { autoClose: 1200 };
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageSales = user?.role !== 'employee' && (user?.role === 'owner' || user?.permissions?.edit);
  const canCreateSales = user?.role === 'owner' || user?.permissions?.add;
  const initialFormData = getInitialFormData();
  const initialCurrentItem = {
    product: '',
    productName: '',
    unit: 'ton',
    quantity: '',
    unitPrice: ''
  };

  const [sales, setSales] = useState([]);
  const [leadgers, setLeadgers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([
    { _id: '1', name: '60mm', unit: 'ton', salePrice: 0 },
    { _id: '2', name: '40mm', unit: 'ton', salePrice: 0 },
    { _id: '3', name: '20mm', unit: 'ton', salePrice: 0 },
    { _id: '4', name: '10mm', unit: 'ton', salePrice: 0 },
    { _id: '5', name: '6mm', unit: 'ton', salePrice: 0 },
    { _id: '6', name: '4mm', unit: 'ton', salePrice: 0 },
    { _id: '7', name: 'wmm', unit: 'ton', salePrice: 0 },
    { _id: '8', name: 'gsb', unit: 'ton', salePrice: 0 },
    { _id: '9', name: 'dust', unit: 'ton', salePrice: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [chartRange, setChartRange] = useState('30d');
  const [tableRange, setTableRange] = useState('lifetime');
  const [formData, setFormData] = useState(initialFormData);
  const [currentItem, setCurrentItem] = useState(initialCurrentItem);
  const [showPartyForm, setShowPartyForm] = useState(false);
  const [partyFormData, setPartyFormData] = useState(getInitialPartyFormData());
  const [partyPopupLoading, setPartyPopupLoading] = useState(false);
  const [partyPopupError, setPartyPopupError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [leadgerQuery, setLeadgerQuery] = useState('');
  const [leadgerListIndex, setLeadgerListIndex] = useState(-1);
  const [isLeadgerSectionActive, setIsLeadgerSectionActive] = useState(false);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleListIndex, setVehicleListIndex] = useState(-1);
  const [isVehicleSectionActive, setIsVehicleSectionActive] = useState(false);
  const [materialQuery, setMaterialQuery] = useState('');
  const [materialListIndex, setMaterialListIndex] = useState(-1);
  const [isMaterialSectionActive, setIsMaterialSectionActive] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [productListIndex, setProductListIndex] = useState(-1);
  const [isProductSectionActive, setIsProductSectionActive] = useState(false);
  const [ocrVehicleMismatch, setOcrVehicleMismatch] = useState(null);
  const leadgerSectionRef = useRef(null);
  const leadgerInputRef = useRef(null);
  const vehicleSectionRef = useRef(null);
  const vehicleInputRef = useRef(null);
  const materialSectionRef = useRef(null);
  const materialInputRef = useRef(null);
  const productSectionRef = useRef(null);
  const productInputRef = useRef(null);

  useEffect(() => {
    fetchSales();
    fetchLeadgers();
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (location.state?.openShortcut !== 'sale' || showForm) return;

    handleOpenForm();
    navigate(location.pathname, { replace: true, state: {} });
  }, [location.pathname, location.state, navigate, showForm]);

  useEffect(() => {
    if (!modalOnly || showForm) return;
    handleOpenForm();
  }, [modalOnly, showForm]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tagName = event.target?.tagName?.toLowerCase();
      const isTypingTarget = tagName === 'input' || tagName === 'textarea' || tagName === 'select' || event.target?.isContentEditable;
      const key = event.key?.toLowerCase();
      const isSaleShortcut = event.altKey && key === 's';
      const isF1Shortcut = key === 'f1';
      if (event.defaultPrevented || event.ctrlKey || event.metaKey) return;
      if (isTypingTarget || showForm) return;
      if (!isSaleShortcut && !isF1Shortcut) return;

      event.preventDefault();
      handleOpenForm();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showForm]);

  const getSaleInvoicePdfUrl = (saleId) => {
    const baseUrl = String(apiClient.defaults.baseURL || '/api').replace(/\/+$/, '');
    return `${baseUrl}/sales/${saleId}/invoice-pdf`;
  };

  const handleOpenInvoicePdf = (saleId) => {
    if (!saleId) return;
    window.open(getSaleInvoicePdfUrl(saleId), '_blank', 'noopener,noreferrer');
  };

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sales');
      setSales(Array.isArray(response) ? response : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Error fetching sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadgers = async () => {
    try {
      const response = await apiClient.get('/parties');
      const partyList = Array.isArray(response) ? response : [];
      setLeadgers(partyList);
      return partyList;
    } catch (err) {
      console.error('Error fetching leadgers:', err);
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles');
      const vehicleList = Array.isArray(response) ? response : [];
      setVehicles(sortVehiclesByTypePreference(vehicleList, 'sales'));
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  };

  const getLeadgerDisplayName = (leadger) => {
    const name = String(leadger?.name || '').trim();

    if (name) return name;
    return 'Party Name';
  };

  const resolveLeadgerNameById = (leadgerId) => {
    const resolvedId = typeof leadgerId === 'object' ? leadgerId?._id : leadgerId;
    if (!resolvedId) return '';
    const matching = leadgers.find((leadger) => String(leadger._id) === String(resolvedId));
    return matching ? getLeadgerDisplayName(matching) : '';
  };

  const normalizeText = (value) => String(value || '').trim().toLowerCase();

  const getVehicleDisplayName = (vehicle) => String(vehicle?.vehicleNo || '').trim();
  const getMaterialDisplayName = (material) => String(material?.label || '').trim();
  const getVehiclePartyId = (vehicle) => (
    typeof vehicle?.partyId === 'object'
      ? vehicle?.partyId?._id || ''
      : vehicle?.partyId || ''
  );

  const getMatchingLeadgers = (queryValue) => {
    const normalized = normalizeText(queryValue);
    if (!normalized) return leadgers;

    const startsWith = leadgers.filter((leadger) => normalizeText(getLeadgerDisplayName(leadger)).startsWith(normalized));
    const includes = leadgers.filter((leadger) => (
      !normalizeText(getLeadgerDisplayName(leadger)).startsWith(normalized)
      && normalizeText(getLeadgerDisplayName(leadger)).includes(normalized)
    ));

    return [...startsWith, ...includes];
  };

  const selectedLeadgerName = useMemo(() => resolveLeadgerNameById(formData.party), [formData.party, leadgers]);

  const filteredLeadgers = useMemo(() => {
    const normalizedQuery = normalizeText(leadgerQuery);
    const normalizedSelectedName = normalizeText(selectedLeadgerName);

    if (
      isLeadgerSectionActive
      && normalizedQuery
      && normalizedQuery === normalizedSelectedName
    ) {
      return leadgers;
    }

    return getMatchingLeadgers(leadgerQuery);
  }, [leadgers, leadgerQuery, isLeadgerSectionActive, selectedLeadgerName]);

  const selectedLeadger = useMemo(
    () => leadgers.find((leadger) => String(leadger._id) === String(formData.party || '')) || null,
    [leadgers, formData.party]
  );
  const filteredVehicles = useMemo(() => {
    const normalizedQuery = normalizeText(vehicleQuery);
    const normalizedSelectedVehicle = normalizeText(formData.vehicleNo);
    const exactVehicle = vehicles.find((vehicle) => (
      normalizeVehicleValue(getVehicleDisplayName(vehicle)) === normalizeVehicleValue(vehicleQuery)
    )) || null;
    const isCompleteTypedVehicle = isCompleteVehicleNumber(vehicleQuery);

    if (isCompleteTypedVehicle && !exactVehicle) {
      return [];
    }

    if (
      isVehicleSectionActive
      && normalizedQuery
      && normalizedQuery === normalizedSelectedVehicle
      && exactVehicle
    ) {
      return vehicles;
    }

    if (!normalizedQuery) return vehicles;

    const startsWith = vehicles.filter((vehicle) => normalizeText(getVehicleDisplayName(vehicle)).startsWith(normalizedQuery));
    const includes = vehicles.filter((vehicle) => (
      !normalizeText(getVehicleDisplayName(vehicle)).startsWith(normalizedQuery)
      && normalizeText(getVehicleDisplayName(vehicle)).includes(normalizedQuery)
    ));

    return [...startsWith, ...includes];
  }, [vehicles, vehicleQuery, isVehicleSectionActive, formData.vehicleNo]);
  const filteredMaterialTypes = useMemo(() => {
    const normalizedQuery = normalizeText(materialQuery);
    const selectedMaterial = MATERIAL_TYPE_OPTIONS.find((item) => item.value === formData.materialType) || null;
    const normalizedSelectedMaterial = normalizeText(getMaterialDisplayName(selectedMaterial));

    if (
      isMaterialSectionActive
      && normalizedQuery
      && normalizedQuery === normalizedSelectedMaterial
    ) {
      return MATERIAL_TYPE_OPTIONS;
    }

    if (!normalizedQuery) return MATERIAL_TYPE_OPTIONS;

    const startsWith = MATERIAL_TYPE_OPTIONS.filter((item) => normalizeText(getMaterialDisplayName(item)).startsWith(normalizedQuery));
    const includes = MATERIAL_TYPE_OPTIONS.filter((item) => (
      !normalizeText(getMaterialDisplayName(item)).startsWith(normalizedQuery)
      && normalizeText(getMaterialDisplayName(item)).includes(normalizedQuery)
    ));

    return [...startsWith, ...includes];
  }, [materialQuery, isMaterialSectionActive, formData.materialType]);
  const isCashParty = String(selectedLeadger?.type || '').trim().toLowerCase() === 'cash-in-hand';
  const paidAmount = Math.max(0, Number(formData.paidAmount || 0));
  const totalAmountValue = Math.max(0, Number(formData.totalAmount || 0));
  const saleTypePreview = formatSaleTypeLabel(deriveSaleType(totalAmountValue, paidAmount));
  const pendingAmountPreview = Math.max(0, totalAmountValue - paidAmount);
  const excessAmountPreview = Math.max(0, paidAmount - totalAmountValue);

  useEffect(() => {
    if (!showForm) return;

    if (filteredLeadgers.length === 0) {
      setLeadgerListIndex(-1);
      return;
    }

    const shouldHighlightSelectedLeadger = (
      isLeadgerSectionActive
      && normalizeText(leadgerQuery)
      && normalizeText(leadgerQuery) === normalizeText(selectedLeadgerName)
      && formData.party
    );

    if (shouldHighlightSelectedLeadger) {
      const selectedIndex = filteredLeadgers.findIndex((item) => String(item._id) === String(formData.party));
      setLeadgerListIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    setLeadgerListIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filteredLeadgers.length) return filteredLeadgers.length - 1;
      return prev;
    });
  }, [showForm, filteredLeadgers, isLeadgerSectionActive, leadgerQuery, selectedLeadgerName, formData.party]);

  useEffect(() => {
    if (!showForm) return;

    if (filteredVehicles.length === 0) {
      setVehicleListIndex(-1);
      return;
    }

    const shouldHighlightSelectedVehicle = (
      isVehicleSectionActive
      && normalizeText(vehicleQuery)
      && normalizeText(vehicleQuery) === normalizeText(formData.vehicleNo)
      && formData.vehicleNo
    );

    if (shouldHighlightSelectedVehicle) {
      const selectedIndex = filteredVehicles.findIndex((item) => normalizeText(getVehicleDisplayName(item)) === normalizeText(formData.vehicleNo));
      setVehicleListIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    setVehicleListIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filteredVehicles.length) return filteredVehicles.length - 1;
      return prev;
    });
  }, [showForm, filteredVehicles, isVehicleSectionActive, vehicleQuery, formData.vehicleNo]);

  useEffect(() => {
    if (!showForm) return;

    if (filteredMaterialTypes.length === 0) {
      setMaterialListIndex(-1);
      return;
    }

    const selectedMaterial = MATERIAL_TYPE_OPTIONS.find((item) => item.value === formData.materialType) || null;
    const shouldHighlightSelectedMaterial = (
      isMaterialSectionActive
      && normalizeText(materialQuery)
      && normalizeText(materialQuery) === normalizeText(getMaterialDisplayName(selectedMaterial))
      && formData.materialType
    );

    if (shouldHighlightSelectedMaterial) {
      const selectedIndex = filteredMaterialTypes.findIndex((item) => String(item.value) === String(formData.materialType));
      setMaterialListIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    setMaterialListIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filteredMaterialTypes.length) return filteredMaterialTypes.length - 1;
      return prev;
    });
  }, [showForm, filteredMaterialTypes, isMaterialSectionActive, materialQuery, formData.materialType]);

  const handleLeadgerFocus = () => {
    setIsLeadgerSectionActive(true);
  };

  const handleVehicleFocus = () => {
    setIsVehicleSectionActive(true);
  };

  const handleMaterialFocus = () => {
    setIsMaterialSectionActive(true);
  };

  useEffect(() => {
    if (!showForm || editingId || !isCashParty) return;

    setFormData((prev) => {
      const nextPaidAmount = Number(prev.totalAmount || 0);
      if (
        Number(prev.paidAmount || 0) === nextPaidAmount
        && prev.dueDate === ''
      ) {
        return prev;
      }

      return {
        ...prev,
        paidAmount: nextPaidAmount,
        dueDate: ''
      };
    });
  }, [showForm, editingId, isCashParty, formData.totalAmount]);

  const findExactLeadger = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return leadgers.find((leadger) => normalizeText(getLeadgerDisplayName(leadger)) === normalized) || null;
  };

  const findBestLeadgerMatch = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return leadgers.find((leadger) => normalizeText(getLeadgerDisplayName(leadger)).startsWith(normalized))
      || leadgers.find((leadger) => normalizeText(getLeadgerDisplayName(leadger)).includes(normalized))
      || null;
  };

  const findExactVehicle = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return vehicles.find((vehicle) => normalizeText(getVehicleDisplayName(vehicle)) === normalized) || null;
  };

  const findBestVehicleMatch = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    if (isCompleteVehicleNumber(value)) return null;
    return vehicles.find((vehicle) => normalizeText(getVehicleDisplayName(vehicle)).startsWith(normalized))
      || vehicles.find((vehicle) => normalizeText(getVehicleDisplayName(vehicle)).includes(normalized))
      || null;
  };

  const findExactMaterialType = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return MATERIAL_TYPE_OPTIONS.find((item) => normalizeText(getMaterialDisplayName(item)) === normalized) || null;
  };

  const findBestMaterialTypeMatch = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return MATERIAL_TYPE_OPTIONS.find((item) => normalizeText(getMaterialDisplayName(item)).startsWith(normalized))
      || MATERIAL_TYPE_OPTIONS.find((item) => normalizeText(getMaterialDisplayName(item)).includes(normalized))
      || null;
  };

  const selectLeadger = (leadger) => {
    if (!leadger) {
      setLeadgerQuery('');
      setFormData((prev) => ({
        ...prev,
        party: '',
        customerName: '',
        customerPhone: '',
        customerAddress: ''
      }));
      setLeadgerListIndex(-1);
      return;
    }

    const leadgerName = getLeadgerDisplayName(leadger);
    setLeadgerQuery(leadgerName);
    setFormData((prev) => ({
      ...prev,
      party: leadger._id,
      customerName: leadgerName,
      customerPhone: '',
      customerAddress: ''
    }));

    const selectedIndex = filteredLeadgers.findIndex((item) => String(item._id) === String(leadger._id));
    setLeadgerListIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const handleLeadgerInputChange = (e) => {
    const value = e.target.value;
    setLeadgerQuery(value);

    if (!normalizeText(value)) {
      selectLeadger(null);
      return;
    }

    const exactLeadger = findExactLeadger(value);
    if (exactLeadger) {
      setFormData((prev) => ({
        ...prev,
        party: exactLeadger._id,
        customerName: getLeadgerDisplayName(exactLeadger),
        customerPhone: '',
        customerAddress: ''
      }));
      const exactIndex = getMatchingLeadgers(value).findIndex((item) => String(item._id) === String(exactLeadger._id));
      setLeadgerListIndex(exactIndex >= 0 ? exactIndex : 0);
      return;
    }

    const matches = getMatchingLeadgers(value);
    const firstMatch = matches[0] || null;
    setFormData((prev) => ({
      ...prev,
      party: firstMatch?._id || '',
      customerName: firstMatch ? getLeadgerDisplayName(firstMatch) : '',
      customerPhone: '',
      customerAddress: ''
    }));
    setLeadgerListIndex(firstMatch ? 0 : -1);
  };

  const selectVehicle = (vehicle, partyOptions = leadgers) => {
    if (!vehicle) {
      setVehicleQuery('');
      setOcrVehicleMismatch(null);
      setFormData((prev) => ({
        ...prev,
        vehicleId: '',
        vehicleNo: '',
        tareWeight: '',
        netWeight: prev.grossWeight ? Number(prev.grossWeight || 0) : '',
        totalAmount: calculateSaleTotalAmount(prev.netWeight ? Number(prev.netWeight || 0) : '', prev.rate)
      }));
      setVehicleListIndex(-1);
      return;
    }

    setOcrVehicleMismatch(null);
    const vehicleNumber = getVehicleDisplayName(vehicle);
    const unladenWeight = vehicle?.unladenWeight ?? '';
    const linkedPartyId = getVehiclePartyId(vehicle);
    const linkedParty = linkedPartyId
      ? partyOptions.find((party) => String(party._id) === String(linkedPartyId))
      : null;

    setVehicleQuery(vehicleNumber);
    setFormData((prev) => {
      const nextState = {
        ...prev,
        vehicleId: vehicle._id,
        vehicleNo: vehicleNumber,
        tareWeight: unladenWeight
      };

      const numericTareWeight = Number(unladenWeight || 0);
      const numericGrossWeight = Number(prev.grossWeight || 0);
      nextState.netWeight = numericGrossWeight - numericTareWeight;
      nextState.totalAmount = calculateSaleTotalAmount(nextState.netWeight, prev.rate);

      if (linkedParty) {
        const partyName = getLeadgerDisplayName(linkedParty);
        nextState.party = linkedParty._id;
        nextState.customerName = partyName;
        nextState.customerPhone = '';
        nextState.customerAddress = '';
      }

      return nextState;
    });

    if (linkedParty) {
      const partyName = getLeadgerDisplayName(linkedParty);
      setLeadgerQuery(partyName);
      const selectedPartyIndex = partyOptions.findIndex((item) => String(item._id) === String(linkedParty._id));
      setLeadgerListIndex(selectedPartyIndex >= 0 ? selectedPartyIndex : 0);
    }

    const selectedIndex = filteredVehicles.findIndex((item) => String(item._id) === String(vehicle._id));
    setVehicleListIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const ensureVehicleExists = async () => {
    const normalizedVehicleNo = normalizeVehicleValue(formData.vehicleNo);
    const partyId = String(formData.party || '').trim();

    if (!normalizedVehicleNo || !partyId) {
      return formData.vehicleId || '';
    }

    const matchedVehicle = vehicles.find((vehicle) => (
      normalizeVehicleValue(getVehicleDisplayName(vehicle)) === normalizedVehicleNo
    )) || null;

    if (matchedVehicle?._id) {
      if (String(formData.vehicleId || '') !== String(matchedVehicle._id)) {
        selectVehicle(matchedVehicle);
      }
      return matchedVehicle._id;
    }

    const createdVehicle = await apiClient.post('/vehicles', {
      partyId,
      vehicleNo: String(formData.vehicleNo || '').trim().toUpperCase(),
      unladenWeight: Number(formData.tareWeight || 0),
      vehicleType: 'sales'
    });

    if (createdVehicle?._id) {
      setVehicles((prev) => sortVehiclesByTypePreference([
        createdVehicle,
        ...prev.filter((item) => String(item._id) !== String(createdVehicle._id))
      ], 'sales'));
      selectVehicle(createdVehicle);
      return createdVehicle._id;
    }

    return formData.vehicleId || '';
  };

  const handleVehicleInputChange = (e) => {
    const value = String(e.target.value || '').toUpperCase();
    setVehicleQuery(value);
    setOcrVehicleMismatch(null);

    if (!normalizeText(value)) {
      selectVehicle(null);
      return;
    }

    const exactVehicle = findExactVehicle(value);
    if (exactVehicle) {
      selectVehicle(exactVehicle);
      return;
    }

    const firstMatch = findBestVehicleMatch(value);
    setFormData((prev) => ({
      ...prev,
      vehicleId: firstMatch?._id || '',
      vehicleNo: firstMatch ? getVehicleDisplayName(firstMatch) : value
    }));
    setVehicleListIndex(firstMatch ? 0 : -1);
  };

  const selectMaterialType = (material) => {
    if (!material) {
      setMaterialQuery('');
      setFormData((prev) => ({
        ...prev,
        materialType: '',
        rate: '',
        totalAmount: calculateSaleTotalAmount(prev.netWeight, '')
      }));
      setMaterialListIndex(-1);
      return;
    }

    setMaterialQuery(getMaterialDisplayName(material));
    const configuredRate = getCrusherMaterialRate(user, material.value);
    setFormData((prev) => ({
      ...prev,
      materialType: material.value,
      rate: configuredRate > 0 ? String(configuredRate) : '',
      totalAmount: calculateSaleTotalAmount(prev.netWeight, configuredRate)
    }));

    const selectedIndex = filteredMaterialTypes.findIndex((item) => String(item.value) === String(material.value));
    setMaterialListIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const handleMaterialInputChange = (e) => {
    const value = String(e.target.value || '').toUpperCase();
    setMaterialQuery(value);

    if (!normalizeText(value)) {
      selectMaterialType(null);
      return;
    }

    const exactMaterial = findExactMaterialType(value);
    if (exactMaterial) {
      const configuredRate = getCrusherMaterialRate(user, exactMaterial.value);
      setFormData((prev) => ({
        ...prev,
        materialType: exactMaterial.value,
        rate: configuredRate > 0 ? String(configuredRate) : '',
        totalAmount: calculateSaleTotalAmount(prev.netWeight, configuredRate)
      }));
      const exactIndex = filteredMaterialTypes.findIndex((item) => String(item.value) === String(exactMaterial.value));
      setMaterialListIndex(exactIndex >= 0 ? exactIndex : 0);
      return;
    }

    const firstMatch = findBestMaterialTypeMatch(value);
    const configuredRate = firstMatch ? getCrusherMaterialRate(user, firstMatch.value) : 0;
    setFormData((prev) => ({
      ...prev,
      materialType: firstMatch?.value || '',
      rate: firstMatch ? (configuredRate > 0 ? String(configuredRate) : '') : prev.rate,
      totalAmount: firstMatch ? calculateSaleTotalAmount(prev.netWeight, configuredRate) : prev.totalAmount
    }));
    setMaterialListIndex(firstMatch ? 0 : -1);
  };

  const focusNextPopupField = (element) => {
    if (!(element instanceof HTMLElement)) return;
    const form = element.closest('form');
    if (!form) return;

    const fields = Array.from(form.querySelectorAll(
      'input:not([type="hidden"]):not([disabled]):not([readonly]), select:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
    )).filter((field) => {
      if (!(field instanceof HTMLElement)) return false;
      if (field.tabIndex === -1) return false;
      const style = window.getComputedStyle(field);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    const currentIndex = fields.indexOf(element);
    if (currentIndex === -1) return;

    const nextField = fields[currentIndex + 1];
    if (!(nextField instanceof HTMLElement)) return;
    nextField.focus();
    if (nextField instanceof HTMLInputElement && typeof nextField.select === 'function') {
      nextField.select();
    }
  };

  const handleSelectEnterMoveNext = (e) => {
    if (e.key !== 'Enter' || e.shiftKey) return;
    e.preventDefault();
    e.stopPropagation();
    focusNextPopupField(e.currentTarget);
  };

  const openInlinePartyForm = () => {
    setPartyFormData((prev) => ({
      ...getInitialPartyFormData('customer'),
      name: toTitleCase(leadgerQuery || prev.name || '')
    }));
    setPartyPopupError('');
    setIsLeadgerSectionActive(false);
    setShowPartyForm(true);
  };

  const closeInlinePartyForm = (shouldRefocusLeadger = true) => {
    setShowPartyForm(false);
    setPartyFormData(getInitialPartyFormData('customer'));
    setPartyPopupError('');

    if (!shouldRefocusLeadger) return;

    requestAnimationFrame(() => {
      leadgerInputRef.current?.focus();
      leadgerInputRef.current?.select?.();
    });
  };

  const handlePartyPopupChange = (e) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setPartyFormData((prev) => ({ ...prev, [name]: toTitleCase(value) }));
      return;
    }

    if (name === 'mobile') {
      const normalized = String(value || '').replace(/\D/g, '').slice(0, 10);
      setPartyFormData((prev) => ({ ...prev, [name]: normalized }));
      return;
    }

    if (name === 'pincode') {
      const normalized = String(value || '').replace(/\D/g, '').slice(0, 6);
      setPartyFormData((prev) => ({ ...prev, [name]: normalized }));
      return;
    }
    if (name === 'openingBalance') {
      setPartyFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (['tenMmRate', 'twentyMmRate', 'fortyMmRate', 'wmmRate', 'gsbRate', 'dustRate', 'boulderRatePerTon'].includes(name)) {
      setPartyFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    if (name === 'type') {
      setPartyFormData((prev) => ({
        ...prev,
        [name]: value,
        openingBalanceType: prev.openingBalance ? prev.openingBalanceType : (value === 'supplier' ? 'payable' : 'receivable')
      }));
      return;
    }

    setPartyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openInlineProductForm = () => {
    setIsProductSectionActive(false);
    setShowProductForm(true);
  };

  const openInlineVehicleForm = () => {
    setIsVehicleSectionActive(false);
    setShowVehicleForm(true);
  };

  const closeInlineProductForm = (shouldRefocusProduct = true) => {
    setShowProductForm(false);

    if (!shouldRefocusProduct) return;

    requestAnimationFrame(() => {
      productInputRef.current?.focus();
      productInputRef.current?.select?.();
    });
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

  const handleLeadgerInputKeyDown = (e) => {
    const key = e.key?.toLowerCase();
    const isMoveDownKey = key === 'arrowdown';
    const isMoveUpKey = key === 'arrowup';

    if (key === 'control' && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      openInlinePartyForm();
      return;
    }

    if (isMoveDownKey) {
      e.preventDefault();
      e.stopPropagation();
      if (filteredLeadgers.length === 0) return;
      setLeadgerListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, filteredLeadgers.length - 1);
      });
      return;
    }

    if (isMoveUpKey) {
      e.preventDefault();
      e.stopPropagation();
      if (filteredLeadgers.length === 0) return;
      setLeadgerListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.max(prev - 1, 0);
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      const activeLeadger = leadgerListIndex >= 0 ? filteredLeadgers[leadgerListIndex] : null;
      const matchedLeadger = activeLeadger || findExactLeadger(leadgerQuery) || findBestLeadgerMatch(leadgerQuery);
      if (matchedLeadger) {
        selectLeadger(matchedLeadger);
      }
      setIsLeadgerSectionActive(false);
      focusNextPopupField(e.currentTarget);
    }
  };

  const handleVehicleInputKeyDown = (e) => {
    const key = e.key?.toLowerCase();

    if (key === 'control' && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      openInlineVehicleForm();
      return;
    }

    if (key === 'arrowdown') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredVehicles.length === 0) return;
      setVehicleListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, filteredVehicles.length - 1);
      });
      return;
    }

    if (key === 'arrowup') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredVehicles.length === 0) return;
      setVehicleListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.max(prev - 1, 0);
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      const activeVehicle = vehicleListIndex >= 0 ? filteredVehicles[vehicleListIndex] : null;
      const matchedVehicle = activeVehicle || findExactVehicle(vehicleQuery) || findBestVehicleMatch(vehicleQuery);
      if (matchedVehicle) {
        selectVehicle(matchedVehicle);
      } else {
        setFormData((prev) => ({
          ...prev,
          vehicleNo: String(vehicleQuery || '').toUpperCase()
        }));
      }
      setIsVehicleSectionActive(false);
      focusNextPopupField(e.currentTarget);
    }
  };

  const handleMaterialInputKeyDown = (e) => {
    const key = e.key?.toLowerCase();

    if (key === 'arrowdown') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredMaterialTypes.length === 0) return;
      setMaterialListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, filteredMaterialTypes.length - 1);
      });
      return;
    }

    if (key === 'arrowup') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredMaterialTypes.length === 0) return;
      setMaterialListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.max(prev - 1, 0);
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      const activeMaterial = materialListIndex >= 0 ? filteredMaterialTypes[materialListIndex] : null;
      const matchedMaterial = activeMaterial || findExactMaterialType(materialQuery) || findBestMaterialTypeMatch(materialQuery);
      if (matchedMaterial) {
        selectMaterialType(matchedMaterial);
      }
      setIsMaterialSectionActive(false);
      focusNextPopupField(e.currentTarget);
      return;
    }

    if (e.key === 'Escape' && isMaterialSectionActive) {
      e.preventDefault();
      e.stopPropagation();
      const selectedMaterial = MATERIAL_TYPE_OPTIONS.find((item) => item.value === formData.materialType) || null;
      setMaterialQuery(getMaterialDisplayName(selectedMaterial));
      setIsMaterialSectionActive(false);
    }
  };

  const getProductDisplayName = (product) => String(product?.name || '').trim() || 'Product';

  const resolveProductNameById = (productId) => {
    const resolvedId = typeof productId === 'object' ? productId?._id : productId;
    if (!resolvedId) return '';
    const matching = products.find((product) => String(product._id) === String(resolvedId));
    return matching ? getProductDisplayName(matching) : '';
  };

  const getMatchingProducts = (queryValue) => {
    const normalized = normalizeText(queryValue);
    if (!normalized) return products;

    const startsWith = products.filter((product) => normalizeText(getProductDisplayName(product)).startsWith(normalized));
    const includes = products.filter((product) => (
      !normalizeText(getProductDisplayName(product)).startsWith(normalized)
      && normalizeText(getProductDisplayName(product)).includes(normalized)
    ));

    return [...startsWith, ...includes];
  };

  const selectedProductName = useMemo(() => {
    const resolvedName = resolveProductNameById(currentItem.product);
    return resolvedName || currentItem.productName || '';
  }, [currentItem.product, currentItem.productName, products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeText(productQuery);
    const normalizedSelectedName = normalizeText(selectedProductName);

    if (
      isProductSectionActive
      && normalizedQuery
      && normalizedQuery === normalizedSelectedName
    ) {
      return products;
    }

    return getMatchingProducts(productQuery);
  }, [products, productQuery, isProductSectionActive, selectedProductName]);

  useEffect(() => {
    if (!showForm) return;

    if (filteredProducts.length === 0) {
      setProductListIndex(-1);
      return;
    }

    const shouldHighlightSelectedProduct = (
      isProductSectionActive
      && normalizeText(productQuery)
      && normalizeText(productQuery) === normalizeText(selectedProductName)
      && currentItem.product
    );

    if (shouldHighlightSelectedProduct) {
      const selectedIndex = filteredProducts.findIndex((item) => String(item._id) === String(currentItem.product));
      setProductListIndex(selectedIndex >= 0 ? selectedIndex : 0);
      return;
    }

    setProductListIndex((prev) => {
      if (prev < 0) return 0;
      if (prev >= filteredProducts.length) return filteredProducts.length - 1;
      return prev;
    });
  }, [showForm, filteredProducts, isProductSectionActive, productQuery, selectedProductName, currentItem.product]);

  const findExactProduct = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return products.find((product) => normalizeText(getProductDisplayName(product)) === normalized) || null;
  };

  const findBestProductMatch = (value) => {
    const normalized = normalizeText(value);
    if (!normalized) return null;
    return products.find((product) => normalizeText(getProductDisplayName(product)).startsWith(normalized))
      || products.find((product) => normalizeText(getProductDisplayName(product)).includes(normalized))
      || null;
  };

  const selectProduct = (product) => {
    if (!product) {
      setProductQuery('');
      setCurrentItem((prev) => ({
        ...prev,
        product: '',
        productName: '',
        unit: 'ton',
        unitPrice: ''
      }));
      setProductListIndex(-1);
      return;
    }

    const productName = getProductDisplayName(product);
    setProductQuery(productName);
    setCurrentItem((prev) => ({
      ...prev,
      product: product._id,
      productName,
      unit: 'ton',
      unitPrice: getSalePriceInputValue(product)
    }));

    const selectedIndex = filteredProducts.findIndex((item) => String(item._id) === String(product._id));
    setProductListIndex(selectedIndex >= 0 ? selectedIndex : 0);
  };

  const handleProductFocus = () => {
    setIsProductSectionActive(true);
  };

  const handleProductInputChange = (e) => {
    const value = e.target.value;
    setProductQuery(value);

    if (!normalizeText(value)) {
      selectProduct(null);
      return;
    }

    const exactProduct = findExactProduct(value);
    if (exactProduct) {
      setCurrentItem((prev) => ({
        ...prev,
        product: exactProduct._id,
        productName: getProductDisplayName(exactProduct),
        unit: 'ton',
        unitPrice: getSalePriceInputValue(exactProduct)
      }));
      const exactIndex = getMatchingProducts(value).findIndex((item) => String(item._id) === String(exactProduct._id));
      setProductListIndex(exactIndex >= 0 ? exactIndex : 0);
      return;
    }

    const matches = getMatchingProducts(value);
    const firstMatch = matches[0] || null;
    setCurrentItem((prev) => ({
      ...prev,
      product: firstMatch?._id || '',
      productName: firstMatch ? getProductDisplayName(firstMatch) : '',
      unit: 'ton',
      unitPrice: firstMatch ? getSalePriceInputValue(firstMatch) : ''
    }));
    setProductListIndex(firstMatch ? 0 : -1);
  };

  const handleProductInputKeyDown = (e, endItemList) => {
    const key = e.key?.toLowerCase();
    const lastOptionIndex = filteredProducts.length;

    if (key === 'control' && !e.altKey && !e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      openInlineProductForm();
      return;
    }

    if (key === 'arrowdown') {
      e.preventDefault();
      e.stopPropagation();
      setProductListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.min(prev + 1, lastOptionIndex);
      });
      return;
    }

    if (key === 'arrowup') {
      e.preventDefault();
      e.stopPropagation();
      if (filteredProducts.length === 0) return;
      setProductListIndex((prev) => {
        if (prev < 0) return 0;
        return Math.max(prev - 1, 0);
      });
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();

      if (productListIndex === lastOptionIndex) {
        setIsProductSectionActive(false);
        endItemList?.();
        return;
      }

      const activeProduct = productListIndex >= 0 ? filteredProducts[productListIndex] : null;
      const matchedProduct = activeProduct || findExactProduct(productQuery) || findBestProductMatch(productQuery);
      if (matchedProduct) {
        selectProduct(matchedProduct);
      }
      setIsProductSectionActive(false);
      focusNextPopupField(e.currentTarget);
    }
  };

  const handleAddItem = () => {
    if (!currentItem.product || !currentItem.quantity || !currentItem.unitPrice) {
      setError('Product, quantity and price are required');
      return false;
    }

    const product = products.find(p => p._id === currentItem.product);
    if (!product || product.currentStock < currentItem.quantity) {
      setError(`Insufficient stock for ${product?.name}`);
      return false;
    }

    const taxAmount = 0;
    const total = currentItem.unitPrice * currentItem.quantity;

    const newItem = {
      ...currentItem,
      productName: product?.name,
      unit: String(product?.unit || currentItem.unit || '').trim(),
      quantity: parseFloat(currentItem.quantity),
      unitPrice: parseFloat(currentItem.unitPrice),
      taxAmount,
      discount: 0,
      total
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });

    setCurrentItem(initialCurrentItem);
    setProductQuery('');
    setProductListIndex(-1);
    setIsProductSectionActive(false);

    calculateTotals([...formData.items, newItem]);
    setError('');
    return true;
  };

  const handleRemoveItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
    calculateTotals(newItems);
  };

  const calculateTotals = (items) => {
    let subtotal = 0;
    let totalTax = 0;

    items.forEach(item => {
      subtotal += item.unitPrice * item.quantity;
      totalTax += item.taxAmount || 0;
    });

    const total = subtotal + totalTax;

    setFormData(prev => ({
      ...prev,
      subtotal,
      taxAmount: totalTax,
      totalAmount: total
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
      if (name === 'customerPhone') {
        const normalizedPhone = String(value || '').replace(/\D/g, '').slice(0, 10);
        setFormData({ ...formData, customerPhone: normalizedPhone });
        return;
      }
      if (name === 'vehicleNo') {
        setFormData({ ...formData, vehicleId: '', vehicleNo: String(value || '').toUpperCase() });
        return;
      }
    if (name === 'materialType') {
      const selectedMaterial = MATERIAL_TYPE_OPTIONS.find((item) => item.value === value) || null;
      const configuredRate = getCrusherMaterialRate(user, value);
      setFormData({
        ...formData,
        materialType: value,
        rate: configuredRate > 0 ? String(configuredRate) : '',
        totalAmount: calculateSaleTotalAmount(formData.netWeight, configuredRate)
      });
      setMaterialQuery(getMaterialDisplayName(selectedMaterial));
      return;
    }
    if (name === 'saleDate') {
      setFormData({ ...formData, saleDate: value });
      return;
    }
    if (name === 'saleTime') {
      setFormData({ ...formData, saleTime: value });
      return;
    }
    if (name === 'tareWeight' || name === 'grossWeight') {
      const tareWeight = name === 'tareWeight' ? Number(value || 0) : Number(formData.tareWeight || 0);
      const grossWeight = name === 'grossWeight' ? Number(value || 0) : Number(formData.grossWeight || 0);
      const netWeight = grossWeight - tareWeight;
      const totalAmount = calculateSaleTotalAmount(netWeight, formData.rate);
      setFormData({ ...formData, [name]: value, netWeight, totalAmount });
      return;
    }
    if (name === 'rate') {
      const totalAmount = calculateSaleTotalAmount(formData.netWeight, value);
      setFormData({ ...formData, rate: value, totalAmount });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleProductCreated = (createdProduct) => {
    if (!createdProduct?._id) return;

    setProducts((prev) => [
      createdProduct,
      ...prev.filter((item) => String(item._id) !== String(createdProduct._id))
    ]);
    selectProduct(createdProduct);
    setError('');
    setShowProductForm(false);
    toast.success('Stock item created successfully', toastOptions);

    requestAnimationFrame(() => {
      focusNextPopupField(productInputRef.current);
    });
  };

  const handlePartyPopupSubmit = async (e) => {
    e.preventDefault();

    if (!String(partyFormData.name || '').trim()) {
      setPartyPopupError('Party name is required');
      return;
    }

    if (!['supplier', 'customer', 'cash-in-hand'].includes(partyFormData.type)) {
      setPartyPopupError('Party type is required');
      return;
    }

    try {
      setPartyPopupLoading(true);

      const payload = {
        type: String(partyFormData.type || '').trim(),
        name: String(partyFormData.name || '').trim(),
        mobile: String(partyFormData.mobile || '').trim(),
        email: String(partyFormData.email || '').trim(),
          address: String(partyFormData.address || '').trim(),
          state: String(partyFormData.state || '').trim(),
          pincode: String(partyFormData.pincode || '').trim(),
          openingBalance: Number(partyFormData.openingBalance || 0),
          openingBalanceType: String(partyFormData.openingBalanceType || 'receivable'),
          tenMmRate: Number(partyFormData.tenMmRate || 0),
          twentyMmRate: Number(partyFormData.twentyMmRate || 0),
          fortyMmRate: Number(partyFormData.fortyMmRate || 0),
          wmmRate: Number(partyFormData.wmmRate || 0),
          gsbRate: Number(partyFormData.gsbRate || 0),
          dustRate: Number(partyFormData.dustRate || 0),
          boulderRatePerTon: Number(partyFormData.boulderRatePerTon || 0)
        };

      const response = await apiClient.post('/parties', payload);
      const createdParty = response || null;

      if (!createdParty?._id) {
        throw new Error('Party created but response was incomplete');
      }

      setLeadgers((prev) => [
        createdParty,
        ...prev.filter((item) => String(item._id) !== String(createdParty._id))
      ]);
      selectLeadger(createdParty);
      setError('');
      setPartyPopupError('');
      setShowPartyForm(false);
      setPartyFormData(getInitialPartyFormData('customer'));
      toast.success('Party created successfully', toastOptions);

      requestAnimationFrame(() => {
        focusNextPopupField(leadgerInputRef.current);
      });
    } catch (err) {
      setPartyPopupError(err.message || 'Error creating party');
    } finally {
      setPartyPopupLoading(false);
    }
  };


  const handleOcrFill = (data) => {
    if (!data) return;

    const { vehicleNo: ocrRaw, materialType, grossWeight, tareWeight, netWeight, saleDate, entryTime, exitTime } = data;
    const upperOcrRaw = String(ocrRaw || '').trim().toUpperCase();

    // Vehicle No
    if (upperOcrRaw) {
      const matchResult = getSmartVehicleMatch(upperOcrRaw, vehicles, getVehicleDisplayName);
      const { matchedVehicle, isMismatch, matchedValue } = matchResult;

      if (isMismatch) {
        setOcrVehicleMismatch({ ocrValue: upperOcrRaw, matchedValue });
      } else {
        setOcrVehicleMismatch(null);
      }

      if (matchedVehicle) {
        selectVehicle(matchedVehicle);
      } else {
        setVehicleQuery(upperOcrRaw);
        setFormData((prev) => {
          const tare = Number(tareWeight || prev.tareWeight || 0);
          const gross = Number(grossWeight || prev.grossWeight || 0);
          const net = Number(netWeight || gross - tare || 0);
          const total = calculateSaleTotalAmount(net, prev.rate);
          return {
            ...prev,
            vehicleId: '',
            vehicleNo: upperOcrRaw,
            tareWeight: tare || prev.tareWeight,
            grossWeight: gross || prev.grossWeight,
            netWeight: net || prev.netWeight,
            totalAmount: total,
          };
        });
      }
    }

    // Material Type
    if (materialType) {
      const normalizedMat = String(materialType).toLowerCase().trim();
      const matched = MATERIAL_TYPE_OPTIONS.find((opt) => opt.value === normalizedMat);
      if (matched) {
        setMaterialQuery(getMaterialDisplayName(matched));
        const configuredRate = getCrusherMaterialRate(user, matched.value);
        setFormData((prev) => ({
          ...prev,
          materialType: matched.value,
          rate: configuredRate > 0 ? String(configuredRate) : prev.rate,
          totalAmount: calculateSaleTotalAmount(
            Number(prev.netWeight || 0),
            configuredRate > 0 ? configuredRate : prev.rate
          )
        }));
      }
    }

    // Weights (only if vehicle wasn't already matched — vehicle match sets them)
    // 1. Try exact logic again here to avoid overwriting netWeight if vehicle was matched above
    const isMatchedInDb = !!vehicles.find(v => {
      const vNo = String(v.vehicleNo || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const ocrShort = upperOcrRaw.replace(/[^A-Z0-9]/g, '');
      return vNo === ocrShort || (ocrShort.length >= 4 && vNo.endsWith(ocrShort.slice(-4)));
    });

    if (!isMatchedInDb) {
      const tare = Number(tareWeight || 0);
      const gross = Number(grossWeight || 0);
      const net = Number(netWeight || 0) || (gross - tare);
      setFormData((prev) => {
        const total = calculateSaleTotalAmount(net, prev.rate);
        return {
          ...prev,
          tareWeight: tare > 0 ? tare : prev.tareWeight,
          grossWeight: gross > 0 ? gross : prev.grossWeight,
          netWeight: net > 0 ? net : prev.netWeight,
          totalAmount: total,
        };
      });
    }

    // Sale Date
    if (saleDate) {
      setFormData((prev) => ({ ...prev, saleDate }));
    }

    if (entryTime) {
      setFormData((prev) => ({ ...prev, entryTime }));
    }

    if (exitTime) {
      setFormData((prev) => ({ ...prev, exitTime }));
    }

    if (data?.slipImg) {
      setFormData((prev) => ({ ...prev, slipImg: data.slipImg }));
    }

    toast.success('Slip data extracted!', { autoClose: 1500 });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.party) {
      setError('Party name is required');
      return;
    }
    if (!formData.vehicleNo) {
      setError('Vehicle number is required');
      return;
    }
    if (!formData.materialType) {
      setError('Material type is required');
      return;
    }
    if (Number(formData.paidAmount || 0) < 0) {
      setError('Paid amount cannot be negative');
      return;
    }
    const parsedSaleDate = parseSaleDate(formData.saleDate);
    if (!parsedSaleDate) {
      setError('Please select a valid sale date');
      return;
    }
    const saleDateTime = combineSaleDateTime(parsedSaleDate, formData.saleTime);
    if (!saleDateTime) {
      setError('Please select a valid sale date and time');
      return;
    }

    try {
      setLoading(true);
      const ensuredVehicleId = await ensureVehicleExists();
      const submitData = {
        partyId: formData.party,
        vehicleId: ensuredVehicleId || formData.vehicleId || undefined,
        vehicleNo: String(formData.vehicleNo || '').trim().toUpperCase(),
        stoneSize: formData.materialType,
        entryTime: String(formData.entryTime || '').trim(),
        exitTime: String(formData.exitTime || '').trim(),
        tareWeight: Number(formData.tareWeight || 0),
        grossWeight: Number(formData.grossWeight || 0),
        netWeight: Number(formData.netWeight || 0),
        rate: Number(formData.rate || 0),
        totalAmount: Number(formData.totalAmount || 0),
        paidAmount: Number(formData.paidAmount || 0),
        slipImg: String(formData.slipImg || '').trim(),
        saleDate: saleDateTime.toISOString(),
        saleTime: formData.saleTime || ''
      };

      let savedSale;
      if (editingId) {
        savedSale = await apiClient.put(`/sales/${editingId}`, submitData);
      } else {
        savedSale = await apiClient.post('/sales', submitData);
      }
      toast.success(
        editingId ? 'Sale updated successfully' : 'Sale added successfully',
        toastOptions
      );
      fetchSales();
      setFormData(getInitialFormData());
      setCurrentItem(initialCurrentItem);
      setEditingId(null);
      setShowPartyForm(false);
      setShowProductForm(false);
      setLeadgerQuery('');
      setLeadgerListIndex(-1);
      setIsLeadgerSectionActive(false);
      setProductQuery('');
      setProductListIndex(-1);
      setIsProductSectionActive(false);
      setShowForm(false);
      setError('');
      if (modalOnly && typeof onModalFinish === 'function') {
        onModalFinish();
      }
    } catch (err) {
      const errorMessage = err.message || 'Error saving sale';
      setError(errorMessage);
      toast.error(errorMessage, toastOptions);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (sale) => {
    const normalizedPartyId = typeof (sale.partyId || sale.party) === 'object'
      ? (sale.partyId || sale.party)?._id || ''
      : (sale.partyId || sale.party || '');
    const resolvedLeadgerName = resolveLeadgerNameById(normalizedPartyId) || sale.customerName || '';

      setFormData({
        ...getInitialFormData(),
        ...sale,
      party: normalizedPartyId,
      vehicleId: typeof sale.vehicleId === 'object' ? sale.vehicleId?._id || '' : sale.vehicleId || '',
      saleDate: formatDateForInput(sale.saleDate),
      entryTime: sale.entryTime || formatTimeForInput(sale.saleDate),
      exitTime: sale.exitTime || formatTimeForInput(sale.saleDate),
      customerName: resolvedLeadgerName,
      customerPhone: String(sale.customerPhone || '').replace(/\D/g, '').slice(0, 10),
      customerAddress: sale.customerAddress || '',
        materialType: sale.materialType || sale.stoneSize || '',
        vehicleNo: sale.vehicleNo || '',
        tareWeight: sale.tareWeight || sale.vehicleWeight || '',
        grossWeight: sale.grossWeight || sale.netWeight || '',
        netWeight: sale.netWeight || sale.materialWeight || '',
        rate: sale.rate || '',
        totalAmount: sale.totalAmount || 0,
        paidAmount: sale.paidAmount ?? '',
        slipImg: sale.slipImg || ''
      });
      setLeadgerQuery(resolvedLeadgerName);
      setLeadgerListIndex(resolvedLeadgerName ? 0 : -1);
      setIsLeadgerSectionActive(false);
      setVehicleQuery(sale.vehicleNo || '');
      setVehicleListIndex(sale.vehicleNo ? 0 : -1);
      setIsVehicleSectionActive(false);
      const selectedMaterial = MATERIAL_TYPE_OPTIONS.find((item) => item.value === (sale.materialType || sale.stoneSize || '')) || null;
      setMaterialQuery(getMaterialDisplayName(selectedMaterial));
      setMaterialListIndex(selectedMaterial ? 0 : -1);
      setIsMaterialSectionActive(false);
      setProductQuery('');
      setProductListIndex(-1);
      setIsProductSectionActive(false);
    setEditingId(sale._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await apiClient.delete(`/sales/${id}`);
        toast.success('Sale deleted successfully', toastOptions);
        fetchSales();
      } catch (err) {
        setError(err.message || 'Error deleting sale');
      }
    }
  };

  const handleCancel = () => {
    setShowPartyForm(false);
    setShowProductForm(false);
    setShowVehicleForm(false);

    if (modalOnly && typeof onModalFinish === 'function') {
      onModalFinish();
      return;
    }

    setPartyFormData(getInitialPartyFormData('customer'));
    setPartyPopupError('');
    setShowForm(false);
    setEditingId(null);
      setFormData(getInitialFormData());
      setCurrentItem(initialCurrentItem);
      setLeadgerQuery('');
      setLeadgerListIndex(-1);
      setIsLeadgerSectionActive(false);
      setVehicleQuery('');
      setVehicleListIndex(-1);
      setIsVehicleSectionActive(false);
      setMaterialQuery('');
      setMaterialListIndex(-1);
      setIsMaterialSectionActive(false);
      setProductQuery('');
      setProductListIndex(-1);
      setIsProductSectionActive(false);
  };

  const handleOpenForm = () => {
    setEditingId(null);
    setShowPartyForm(false);
    setShowProductForm(false);
    setShowVehicleForm(false);
    setPartyFormData(getInitialPartyFormData('customer'));
    setPartyPopupError('');
      setFormData(getInitialFormData());
      setCurrentItem(initialCurrentItem);
      setLeadgerQuery('');
      setLeadgerListIndex(0);
      setIsLeadgerSectionActive(false);
      setVehicleQuery('');
      setVehicleListIndex(0);
      setIsVehicleSectionActive(false);
      setMaterialQuery('');
      setMaterialListIndex(0);
      setIsMaterialSectionActive(false);
      setProductQuery('');
      setProductListIndex(0);
      setIsProductSectionActive(false);
    setShowForm(true);
  };

  const chartSales = useMemo(
    () => sales.filter((sale) => isWithinRange(sale.saleDate, chartRange)),
    [sales, chartRange]
  );

  const visibleSales = useMemo(() => {
    const normalizedSearch = String(search || '').trim().toLowerCase();

    return sales.filter((sale) => {
      if (!isWithinRange(sale.saleDate, tableRange)) return false;

      if (!normalizedSearch) return true;

      const haystack = [
        sale.invoiceNumber,
        resolveLeadgerNameById(sale.partyId || sale.party) || sale.customerName,
        sale.vehicleNo,
        sale.materialType,
        sale.type,
        sale.notes,
        sale.saleDate
      ].join(' ').toLowerCase();

      return haystack.includes(normalizedSearch);
    });
  }, [sales, search, tableRange, leadgers]);

  const salesTrendData = useMemo(() => {
    const grouped = chartSales.reduce((acc, sale) => {
      const key = formatDateForInput(sale.saleDate);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + Number(sale.totalAmount || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, amount]) => ({
        date: new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        amount: Number(amount.toFixed(2))
      }));
  }, [chartSales]);

  const materialChartData = useMemo(() => {
    const grouped = chartSales.reduce((acc, sale) => {
      const label = String(sale.materialType || 'Other').toUpperCase();
      acc[label] = (acc[label] || 0) + Number(sale.totalAmount || 0);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([name, amount]) => ({ name, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6);
  }, [chartSales]);

  const chartTotalAmount = chartSales.reduce((sum, sale) => sum + Number(sale.totalAmount || 0), 0);
  const popupFieldClass = 'w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200';
  const popupLabelClass = 'mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600';
  const popupSectionClass = 'rounded-xl border-2 border-indigo-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 md:p-4';

  if (modalOnly) {
    return (
      <>
        {error && (
          <div className="fixed left-4 right-4 top-4 z-[60] rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 shadow-lg md:left-auto md:right-4 md:w-[26rem]">
            {error}
          </div>
        )}
        <AddSalePopup
          showForm={showForm}
          editingId={editingId}
          loading={loading}
          isCashParty={isCashParty}
          formData={formData}
          currentItem={currentItem}
          products={products}
          popupFieldClass={popupFieldClass}
          popupLabelClass={popupLabelClass}
          leadgerSectionRef={leadgerSectionRef}
            leadgerInputRef={leadgerInputRef}
            vehicleSectionRef={vehicleSectionRef}
            vehicleInputRef={vehicleInputRef}
            materialSectionRef={materialSectionRef}
            materialInputRef={materialInputRef}
            productSectionRef={productSectionRef}
            productInputRef={productInputRef}
            leadgerQuery={leadgerQuery}
            vehicleQuery={vehicleQuery}
            materialQuery={materialQuery}
            productQuery={productQuery}
            leadgerListIndex={leadgerListIndex}
            vehicleListIndex={vehicleListIndex}
            materialListIndex={materialListIndex}
            productListIndex={productListIndex}
            filteredLeadgers={filteredLeadgers}
            filteredVehicles={filteredVehicles}
            filteredMaterialTypes={filteredMaterialTypes}
            filteredProducts={filteredProducts}
            isLeadgerSectionActive={isLeadgerSectionActive}
            isVehicleSectionActive={isVehicleSectionActive}
            isMaterialSectionActive={isMaterialSectionActive}
            isProductSectionActive={isProductSectionActive}
            setCurrentItem={setCurrentItem}
            setIsLeadgerSectionActive={setIsLeadgerSectionActive}
            setIsVehicleSectionActive={setIsVehicleSectionActive}
            setIsMaterialSectionActive={setIsMaterialSectionActive}
            setIsProductSectionActive={setIsProductSectionActive}
            setLeadgerListIndex={setLeadgerListIndex}
            setVehicleListIndex={setVehicleListIndex}
            setMaterialListIndex={setMaterialListIndex}
            setProductListIndex={setProductListIndex}
            getLeadgerDisplayName={getLeadgerDisplayName}
            getVehicleDisplayName={getVehicleDisplayName}
            getMaterialDisplayName={getMaterialDisplayName}
            getProductDisplayName={getProductDisplayName}
          handleCancel={handleCancel}
          handleSubmit={handleSubmit}
          handleInputChange={handleInputChange}
          saleTypePreview={saleTypePreview}
          pendingAmountPreview={pendingAmountPreview}
          excessAmountPreview={excessAmountPreview}
          handleLeadgerFocus={handleLeadgerFocus}
          handleLeadgerInputChange={handleLeadgerInputChange}
            handleLeadgerInputKeyDown={handleLeadgerInputKeyDown}
              handleVehicleFocus={handleVehicleFocus}
              handleVehicleInputChange={handleVehicleInputChange}
              handleVehicleInputKeyDown={handleVehicleInputKeyDown}
              handleMaterialFocus={handleMaterialFocus}
              handleMaterialInputChange={handleMaterialInputChange}
              handleMaterialInputKeyDown={handleMaterialInputKeyDown}
            onOpenNewVehicle={openInlineVehicleForm}
            onOpenNewParty={openInlinePartyForm}
          handleProductFocus={handleProductFocus}
          handleProductInputChange={handleProductInputChange}
          handleProductInputKeyDown={handleProductInputKeyDown}
          onOpenNewProduct={openInlineProductForm}
          handleSelectEnterMoveNext={handleSelectEnterMoveNext}
          handleAddItem={handleAddItem}
          handleRemoveItem={handleRemoveItem}
          selectLeadger={selectLeadger}
          selectVehicle={selectVehicle}
          selectProduct={selectProduct}
          onOcrFill={handleOcrFill}
          ocrVehicleMismatch={ocrVehicleMismatch}
          setOcrVehicleMismatch={setOcrVehicleMismatch}
        />
        <AddPartyPopup
          showForm={showPartyForm}
          editingId={null}
          loading={partyPopupLoading}
          formData={partyFormData}
          error={partyPopupError}
          handleCloseForm={() => closeInlinePartyForm(true)}
          handleSubmit={handlePartyPopupSubmit}
          handleChange={handlePartyPopupChange}
        />
        <AddProductPopup
          showForm={showProductForm}
          initialName={productQuery}
          onClose={() => closeInlineProductForm(true)}
          onProductCreated={handleProductCreated}
        />
        {showVehicleForm && (
          <AddVehiclePopup
            vehicle={null}
            onClose={() => closeInlineVehicleForm(true)}
            onSave={fetchVehicles}
            onVehicleSaved={async (savedVehicle) => {
              if (!savedVehicle) return;
              setVehicles((prev) => [
                ...sortVehiclesByTypePreference([
                  savedVehicle,
                  ...prev.filter((item) => String(item._id) !== String(savedVehicle._id))
                ], 'sales')
              ]);
              const latestLeadgers = await fetchLeadgers();
              selectVehicle(savedVehicle, latestLeadgers);
              closeInlineVehicleForm(true);
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-stone-100">
      <div className="mx-auto max-w-[95%] px-4 py-6">

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-semibold text-rose-700 shadow-lg">
          {error}
        </div>
      )}

      <AddSalePopup
        showForm={showForm}
        editingId={editingId}
        loading={loading}
        isCashParty={isCashParty}
        formData={formData}
        currentItem={currentItem}
        products={products}
        popupFieldClass={popupFieldClass}
        popupLabelClass={popupLabelClass}
        popupSectionClass={popupSectionClass}
        leadgerSectionRef={leadgerSectionRef}
        leadgerInputRef={leadgerInputRef}
        vehicleSectionRef={vehicleSectionRef}
        vehicleInputRef={vehicleInputRef}
        materialSectionRef={materialSectionRef}
        materialInputRef={materialInputRef}
        productSectionRef={productSectionRef}
        productInputRef={productInputRef}
        leadgerQuery={leadgerQuery}
        vehicleQuery={vehicleQuery}
        materialQuery={materialQuery}
        productQuery={productQuery}
        leadgerListIndex={leadgerListIndex}
        vehicleListIndex={vehicleListIndex}
        materialListIndex={materialListIndex}
        productListIndex={productListIndex}
        filteredLeadgers={filteredLeadgers}
        filteredVehicles={filteredVehicles}
        filteredMaterialTypes={filteredMaterialTypes}
        filteredProducts={filteredProducts}
        isLeadgerSectionActive={isLeadgerSectionActive}
        isVehicleSectionActive={isVehicleSectionActive}
        isMaterialSectionActive={isMaterialSectionActive}
        isProductSectionActive={isProductSectionActive}
        setCurrentItem={setCurrentItem}
        setIsLeadgerSectionActive={setIsLeadgerSectionActive}
        setIsVehicleSectionActive={setIsVehicleSectionActive}
        setIsMaterialSectionActive={setIsMaterialSectionActive}
        setIsProductSectionActive={setIsProductSectionActive}
        setLeadgerListIndex={setLeadgerListIndex}
        setVehicleListIndex={setVehicleListIndex}
        setMaterialListIndex={setMaterialListIndex}
        setProductListIndex={setProductListIndex}
        getLeadgerDisplayName={getLeadgerDisplayName}
        getVehicleDisplayName={getVehicleDisplayName}
        getMaterialDisplayName={getMaterialDisplayName}
        getProductDisplayName={getProductDisplayName}
        handleCancel={handleCancel}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        saleTypePreview={saleTypePreview}
        pendingAmountPreview={pendingAmountPreview}
        excessAmountPreview={excessAmountPreview}
        handleLeadgerFocus={handleLeadgerFocus}
        handleLeadgerInputChange={handleLeadgerInputChange}
        handleLeadgerInputKeyDown={handleLeadgerInputKeyDown}
        handleVehicleFocus={handleVehicleFocus}
        handleVehicleInputChange={handleVehicleInputChange}
        handleVehicleInputKeyDown={handleVehicleInputKeyDown}
        handleMaterialFocus={handleMaterialFocus}
        handleMaterialInputChange={handleMaterialInputChange}
        handleMaterialInputKeyDown={handleMaterialInputKeyDown}
        onOpenNewVehicle={openInlineVehicleForm}
        onOpenNewParty={openInlinePartyForm}
        handleProductFocus={handleProductFocus}
        handleProductInputChange={handleProductInputChange}
        handleProductInputKeyDown={handleProductInputKeyDown}
        onOpenNewProduct={openInlineProductForm}
        handleSelectEnterMoveNext={handleSelectEnterMoveNext}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        selectLeadger={selectLeadger}
        selectVehicle={selectVehicle}
        selectProduct={selectProduct}
        onOcrFill={handleOcrFill}
        ocrVehicleMismatch={ocrVehicleMismatch}
        setOcrVehicleMismatch={setOcrVehicleMismatch}
      />
      <AddPartyPopup
        showForm={showPartyForm}
        editingId={null}
        loading={partyPopupLoading}
        formData={partyFormData}
        error={partyPopupError}
        handleCloseForm={() => closeInlinePartyForm(true)}
        handleSubmit={handlePartyPopupSubmit}
        handleChange={handlePartyPopupChange}
      />
      <AddProductPopup
        showForm={showProductForm}
        initialName={productQuery}
        onClose={() => closeInlineProductForm(true)}
        onProductCreated={handleProductCreated}
      />
      {showVehicleForm && (
        <AddVehiclePopup
          vehicle={null}
          onClose={() => closeInlineVehicleForm(true)}
          onSave={fetchVehicles}
        onVehicleSaved={async (savedVehicle) => {
          if (!savedVehicle) return;
          setVehicles((prev) => [
            ...sortVehiclesByTypePreference([
              savedVehicle,
              ...prev.filter((item) => String(item._id) !== String(savedVehicle._id))
            ], 'sales')
          ]);
          const latestLeadgers = await fetchLeadgers();
          selectVehicle(savedVehicle, latestLeadgers);
          closeInlineVehicleForm(true);
        }}
      />
      )}
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl">
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">Sales Charts</h2>
              <p className="text-sm text-slate-500">Review how sales move across time</p>
            </div>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <select
                value={chartRange}
                onChange={(e) => setChartRange(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 transition-all focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-52"
              >
                {SALES_RANGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-5 xl:grid-cols-[1.6fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Sales Flow</h3>
                <p className="text-xs text-slate-500">How sales value moves across the selected dates</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Total</p>
                <p className="text-lg font-black text-emerald-600">
                  Rs {chartTotalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesTrendData} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#475569' }} width={80} />
                  <Tooltip formatter={(value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                  <Area type="monotone" dataKey="amount" stroke="#0284c7" strokeWidth={3} fill="url(#salesTrendFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-black uppercase tracking-[0.16em] text-slate-700">Top Materials</h3>
              <p className="text-xs text-slate-500">Highest sale value by material in the selected range</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={materialChartData} layout="vertical" margin={{ top: 4, right: 8, left: 12, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#475569' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} width={110} />
                  <Tooltip formatter={(value) => `Rs ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`} />
                  <Bar dataKey="amount" fill="#0f766e" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-800">Sales Table</h2>
              <p className="text-sm text-slate-500">Search and review sale entries</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-400 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 transition-all focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-64"
                />
              </div>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={tableRange}
                  onChange={(e) => setTableRange(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-700 transition-all focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100 sm:w-52"
                >
                  {SALES_RANGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {canCreateSales && (
                <button
                  onClick={handleOpenForm}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
                >
                  <Plus className="h-4 w-4" />
                  New Sale
                </button>
              )}
            </div>
          </div>
        </div>

      {/* Sales List */}
      {loading && !showForm ? (
        <div className="px-6 py-10 text-center text-slate-500">Loading...</div>
      ) : visibleSales.length === 0 ? (
        <div className="px-6 py-16 text-center text-slate-500">
          No sales found. Create your first sale!
        </div>
      ) : (
        <div className="p-3 sm:p-5">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Date</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Vehicle/Party</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Material</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Entry/Exit</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Gross/Tare/Net</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Sale Type</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Total</th>
                  <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Slip</th>
                  {canManageSales && (
                    <th className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-white lg:px-4 lg:py-3 lg:text-[10px] xl:px-6 xl:py-4 xl:text-xs">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleSales.map((sale) => {
                  return (
                  <tr key={sale._id} className="transition-colors hover:bg-sky-50/50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-slate-700">
                          {new Date(sale.saleDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <button
                          type="button"
                          onClick={() => handleOpenInvoicePdf(sale._id)}
                          className="text-[10px] font-semibold leading-tight text-blue-700 underline underline-offset-2 transition hover:text-blue-900"
                        >
                          {sale.invoiceNumber}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 lg:text-[12px] xl:text-sm">{sale.vehicleNo || '-'}</p>
                          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                            {resolveLeadgerNameById(sale.partyId || sale.party) || sale.customerName || '-'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {(sale.materialType || sale.stoneSize) ? (
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${getMaterialBadgeClass(sale.materialType || sale.stoneSize)}`}>
                          {String(sale.materialType || sale.stoneSize).toUpperCase()}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs font-semibold text-slate-700">
                        <p className="text-emerald-600">{sale.entryTime || ''}</p>
                        <p className="text-rose-600">{sale.exitTime || ''}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="font-semibold text-slate-700">{sale.grossWeight ? `Gross : ${sale.grossWeight} kg` : '-'}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{sale.tareWeight ? `Tare : ${sale.tareWeight} kg` : '-'}</p>
                        </div>
                        <div>
                          {sale.netWeight ? (
                            <p className="font-semibold">
                              <span className="text-slate-900">Net : </span>
                              <span className="text-emerald-600">{sale.netWeight} kg</span>
                            </p>
                          ) : (
                            <p className="font-semibold text-slate-700">-</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                        sale.type === 'cash sale'
                          ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                          : sale.type === 'sale'
                            ? 'border border-amber-200 bg-amber-50 text-amber-700'
                            : 'border border-rose-200 bg-rose-50 text-rose-700'
                      }`}>
                        {formatSaleTypeLabel(sale.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">
                      Rs {Number(sale.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {sale.slipImg ? (
                        <a
                          href={sale.slipImg}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          View Slip
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    {canManageSales && (
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(sale)}
                            className="inline-flex items-center justify-center rounded-md border border-blue-200 bg-white px-3 py-1.5 text-[11px] font-medium text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sale._id)}
                            className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-3 py-1.5 text-[11px] font-medium text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                  );
                })}
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
