const mongoose = require("mongoose");
const Boulder = require("../models/Boulder");
const Expense = require("../models/Expense");
const MaterialUsed = require("../models/MaterialUsed");
const Party = require("../models/Party");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Receipt = require("../models/Receipt");
const Sales = require("../models/Sales");
const Stock = require("../models/Stock");

const toDateBoundary = (value, endOfDay = false) => {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;

  if (endOfDay) {
    parsed.setHours(23, 59, 59, 999);
  } else {
    parsed.setHours(0, 0, 0, 0);
  }

  return parsed;
};

const formatPurchaseNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return "-";
  return `PUR-${String(parsed).padStart(2, "0")}`;
};

const formatPaymentNumber = (value) => {
  const normalized = String(value || "").trim();
  if (!normalized) return "-";
  if (/^PAY-\d{4}-\d{2,}$/i.test(normalized)) return normalized.toUpperCase();
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return "-";
  return `PAY-${String(parsed).padStart(2, "0")}`;
};

const formatReceiptNumber = (value) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return "-";
  return `REC-${String(parsed).padStart(2, "0")}`;
};

const withinRange = (dateValue, fromDate, toDate) => {
  const date = dateValue ? new Date(dateValue) : null;
  if (!date || Number.isNaN(date.getTime())) return false;
  if (fromDate && date < fromDate) return false;
  if (toDate && date > toDate) return false;
  return true;
};

const toObjectId = (value) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) return null;
  return new mongoose.Types.ObjectId(value);
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatAmount = (value) => `Rs ${toNumber(value).toLocaleString("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})}`;

const getSaleTypeLabel = (value) => {
  const normalized = String(value || "").trim();
  if (normalized === "sale") return "Sale";
  if (normalized === "cash sale") return "Cash Sale";
  if (normalized === "credit sale") return "Credit Sale";
  return "Sale";
};

const getEntryDisplayType = (baseType, entryType = "") => {
  if (baseType === "sale") {
    return getSaleTypeLabel(entryType);
  }

  if (baseType === "purchase") {
    const normalized = String(entryType || "").trim().toLowerCase();
    if (normalized === "cash purchase") return "Cash Purchase";
    if (normalized === "credit purchase") return "Credit Purchase";
    return "Purchase";
  }
  if (baseType === "receipt") return "Receipt";
  if (baseType === "payment") return "Payment";
  if (baseType === "opening") return "Opening";
  if (baseType === "expense") return "Expense";
  if (baseType === "boulder") return "Boulder";
  if (baseType === "materialUsed") return "Material Used";
  if (baseType === "purchaseReturn") return "Purchase Return";
  if (baseType === "saleReturn") return "Sale Return";

  return String(baseType || "").trim() || "-";
};

const getSaleAmounts = (sale) => {
  const totalAmount = Math.max(0, toNumber(sale?.totalAmount));
  const paidAmount = Math.max(0, toNumber(sale?.paidAmount));
  const appliedAmount = Math.min(totalAmount, paidAmount);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const excessAmount = Math.max(0, paidAmount - totalAmount);

  return {
    totalAmount,
    paidAmount,
    appliedAmount,
    pendingAmount,
    excessAmount,
  };
};

const getPartyOpeningImpact = (party) => {
  const openingBalance = Math.abs(toNumber(party?.openingBalance));
  if (openingBalance <= 0) return 0;
  return party?.openingBalanceType === "payable" ? -openingBalance : openingBalance;
};

const buildSaleSummary = (sale) => {
  const parts = [];
  if (sale.vehicleNo) parts.push(`Vehicle ${sale.vehicleNo}`);
  if (sale.stoneSize) parts.push(`Material ${String(sale.stoneSize).toUpperCase()}`);
  parts.push(`Type ${getSaleTypeLabel(sale.type)}`);
  const amounts = getSaleAmounts(sale);
  if (amounts.paidAmount > 0) parts.push(`Paid ${formatAmount(amounts.paidAmount)}`);
  if (amounts.pendingAmount > 0) parts.push(`Due ${formatAmount(amounts.pendingAmount)}`);
  if (amounts.excessAmount > 0) parts.push(`Excess ${formatAmount(amounts.excessAmount)}`);
  return parts.join(" | ");
};

const buildPurchaseSummary = (purchase) => (
  Array.isArray(purchase?.items)
    ? purchase.items
        .map((item) => {
          const productName = String(item?.productName || "").trim();
          const quantity = toNumber(item?.quantity);
          return productName ? `${productName}${quantity > 0 ? ` x ${quantity}` : ""}` : "";
        })
        .filter(Boolean)
        .join(", ")
    : ""
);

const buildSaleMaterialSummary = (sale) => {
  const materialType = String(sale?.stoneSize || "").trim().toLowerCase();
  const quantity = toNumber(sale?.materialWeight, toNumber(sale?.netWeight));
  const quantityLabel = quantity > 0 ? `${quantity} kg` : "";

  return [materialType, quantityLabel]
    .filter(Boolean)
    .join(" / ") || "-";
};

const buildLedgerRowsForParty = ({ party, sales, purchases, receipts, payments, fromDate, toDate }) => {
  const openingImpact = getPartyOpeningImpact(party);
  const openingDate = party?.createdAt || new Date(0);
  const rows = [];

  if (!fromDate && openingImpact !== 0) {
    rows.push({
      type: "opening",
      displayType: getEntryDisplayType("opening"),
      refId: `opening-${party._id}`,
      partyId: party._id,
      partyName: party.name || "-",
      date: openingDate,
      entryCreatedAt: openingDate,
      refNumber: "OPENING",
      itemSummary: "Opening balance",
      note: "",
      method: "",
      quantity: 0,
      amount: Math.abs(openingImpact),
      impact: openingImpact,
    });
  }

  rows.push(
    ...sales
      .filter((item) => String(item.partyId?._id || item.partyId) === String(party._id))
      .filter((item) => withinRange(item.saleDate || item.createdAt, fromDate, toDate))
      .map((item) => {
        const saleAmounts = getSaleAmounts(item);
        const saleImpact = item.type === "cash sale" ? 0 : saleAmounts.totalAmount;

        return {
          type: "sale",
          displayType: getEntryDisplayType("sale", item.type),
          refId: item._id,
          partyId: party._id,
          partyName: party.name || "-",
          date: item.saleDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          refNumber: item.invoiceNumber || "-",
          itemSummary: buildSaleSummary(item),
          note: item.type === "cash sale" ? "Cash sale does not create receivable." : "",
          method: item.vehicleNo || "-",
          quantity: toNumber(item.materialWeight, toNumber(item.netWeight)),
          amount: saleAmounts.totalAmount,
          impact: saleImpact,
        };
      }),
    ...purchases
      .filter((item) => String(item.party?._id || item.party) === String(party._id))
      .filter((item) => withinRange(item.purchaseDate || item.createdAt, fromDate, toDate))
      .map((item) => ({
        type: "purchase",
        displayType: getEntryDisplayType("purchase", item.type),
        refId: item._id,
        partyId: party._id,
        partyName: party.name || "-",
        date: item.purchaseDate || item.createdAt,
        entryCreatedAt: item.createdAt,
        refNumber: formatPurchaseNumber(item.purchaseNumber),
        itemSummary: buildPurchaseSummary(item),
        note: String(item.notes || "").trim(),
        method: item.supplierInvoice || "-",
        quantity: Array.isArray(item.items)
          ? item.items.reduce((sum, row) => sum + toNumber(row.quantity), 0)
          : 0,
        amount: toNumber(item.totalAmount),
        impact: -toNumber(item.totalAmount),
      })),
    ...receipts
      .filter((item) => String(item.party?._id || item.party) === String(party._id))
      .filter((item) => withinRange(item.receiptDate || item.createdAt, fromDate, toDate))
      .map((item) => ({
        type: "receipt",
        displayType: getEntryDisplayType("receipt"),
        refId: item._id,
        partyId: party._id,
        partyName: party.name || "-",
        date: item.receiptDate || item.createdAt,
        entryCreatedAt: item.createdAt,
        refNumber: formatReceiptNumber(item.receiptNumber),
        itemSummary: item.refType === "sale" ? "Against sale" : "",
        note: String(item.notes || "").trim(),
        method: item.method || "-",
        quantity: 0,
        amount: toNumber(item.amount),
        impact: -toNumber(item.amount),
      })),
    ...payments
      .filter((item) => String(item.party?._id || item.party) === String(party._id))
      .filter((item) => withinRange(item.paymentDate || item.createdAt, fromDate, toDate))
      .map((item) => ({
        type: "payment",
        displayType: getEntryDisplayType("payment"),
        refId: item._id,
        partyId: party._id,
        partyName: party.name || "-",
        date: item.paymentDate || item.createdAt,
        entryCreatedAt: item.createdAt,
        refNumber: formatPaymentNumber(item.paymentNumber),
        itemSummary: item.refType === "purchase" ? "Against purchase" : "",
        note: String(item.notes || "").trim(),
        method: item.method || "-",
        quantity: 0,
        amount: toNumber(item.amount),
        impact: toNumber(item.amount),
      }))
  );

  const sortedRows = rows.sort((firstRow, secondRow) => {
    const firstTime = new Date(firstRow.entryCreatedAt || firstRow.date).getTime() || 0;
    const secondTime = new Date(secondRow.entryCreatedAt || secondRow.date).getTime() || 0;
    if (firstTime !== secondTime) return firstTime - secondTime;
    return String(firstRow.refId || "").localeCompare(String(secondRow.refId || ""));
  });

  let runningBalance = 0;

  return sortedRows.map((row) => {
    runningBalance += toNumber(row.impact);
    return {
      ...row,
      runningBalance,
    };
  });
};

const buildOutstandingResponse = (parties, ledgerRows) => {
  const partyOutstanding = parties.map((party) => {
    const partyRows = ledgerRows.filter((row) => String(row.partyId) === String(party._id));
    const closingBalance = partyRows.length > 0
      ? toNumber(partyRows[partyRows.length - 1].runningBalance)
      : getPartyOpeningImpact(party);

    return {
      partyId: party._id,
      partyName: party.name || "-",
      receivable: closingBalance > 0 ? closingBalance : 0,
      payable: closingBalance < 0 ? Math.abs(closingBalance) : 0,
      netBalance: closingBalance,
    };
  });

  return {
    partyOutstanding,
    totalReceivable: partyOutstanding.reduce((sum, row) => sum + toNumber(row.receivable), 0),
    totalPayable: partyOutstanding.reduce((sum, row) => sum + toNumber(row.payable), 0),
  };
};

const buildSummary = (entries) => entries.reduce((acc, entry) => {
  const amount = Number(entry.amount || 0);
  const inAmount = Number(entry.inAmount || 0);
  const outAmount = Number(entry.outAmount || 0);

  acc.entryCount += 1;
  acc.totalInward += inAmount;
  acc.totalOutward += outAmount;

  if (entry.type === "sale") acc.sales += amount;
  if (entry.type === "purchase") acc.purchases += amount;
  if (entry.type === "receipt") acc.receipts += amount;
  if (entry.type === "payment") acc.payments += amount;
  if (entry.type === "expense") acc.expenses += amount;
  if (entry.type === "purchaseReturn") acc.purchaseReturns += amount;
  if (entry.type === "saleReturn") acc.saleReturns += amount;

  return acc;
}, {
  entryCount: 0,
  totalInward: 0,
  totalOutward: 0,
  sales: 0,
  purchases: 0,
  receipts: 0,
  payments: 0,
  expenses: 0,
  purchaseReturns: 0,
  saleReturns: 0,
});

const getPartyLedgerData = async ({ partyId, fromDate, toDate }) => {
  const partyFilter = partyId ? { _id: partyId } : {};

  const [parties, sales, purchases, receipts, payments] = await Promise.all([
    Party.find(partyFilter).sort({ name: 1 }),
    Sales.find(partyId ? { partyId } : {}).populate("partyId", "name").sort({ saleDate: 1, createdAt: 1 }),
    Purchase.find(partyId ? { party: partyId } : {}).populate("party", "name").sort({ purchaseDate: 1, createdAt: 1 }),
    Receipt.find(partyId ? { party: partyId } : {}).populate("party", "name").sort({ receiptDate: 1, createdAt: 1 }),
    Payment.find(partyId ? { party: partyId } : {}).populate("party", "name").sort({ paymentDate: 1, createdAt: 1 }),
  ]);

  const ledgerRows = parties.flatMap((party) => buildLedgerRowsForParty({
    party,
    sales,
    purchases,
    receipts,
    payments,
    fromDate,
    toDate,
  }));

  return {
    parties,
    ledgerRows,
  };
};

const getStockLedgerData = async ({ productId, fromDate, toDate }) => {
  const stockFilter = productId ? { _id: productId } : {};
  const purchaseFilter = {};
  const materialUsedFilter = {};

  if (productId) {
    purchaseFilter["items.product"] = productId;
    materialUsedFilter.materialType = productId;
  }

  const [stocks, purchases, materialUsedEntries] = await Promise.all([
    Stock.find(stockFilter).sort({ name: 1 }),
    Purchase.find(purchaseFilter)
      .populate("party", "name")
      .populate("items.product", "name unit")
      .sort({ purchaseDate: 1, createdAt: 1 }),
    MaterialUsed.find(materialUsedFilter)
      .populate("vehicle", "vehicleNo vehicleNumber")
      .populate("materialType", "name unit")
      .sort({ usedDate: 1, createdAt: 1 }),
  ]);

  const ledgerRows = [
    ...purchases.flatMap((purchase) => (
      Array.isArray(purchase.items)
        ? purchase.items
            .filter((item) => !productId || String(item.product?._id || item.product) === String(productId))
            .filter(() => withinRange(purchase.purchaseDate || purchase.createdAt, fromDate, toDate))
            .map((item, index) => ({
              type: "purchase",
              displayType: getEntryDisplayType("purchase", purchase.type),
              refId: `${purchase._id}-${index}`,
              sourceRefId: purchase._id,
              productId: item.product?._id || item.product,
              productName: item.productName || item.product?.name || "-",
              unit: item.unit || item.product?.unit || "",
              partyName: purchase.party?.name || "-",
              date: purchase.purchaseDate || purchase.createdAt,
              entryCreatedAt: purchase.createdAt,
              refNumber: formatPurchaseNumber(purchase.purchaseNumber),
              inQty: toNumber(item.quantity),
              outQty: 0,
              rate: toNumber(item.unitPrice),
              amount: toNumber(item.total),
              note: String(purchase.notes || purchase.supplierInvoice || "").trim(),
            }))
        : []
    )),
    ...materialUsedEntries
      .filter((entry) => withinRange(entry.usedDate || entry.createdAt, fromDate, toDate))
      .map((entry) => ({
        type: "materialUsed",
        displayType: getEntryDisplayType("materialUsed"),
        refId: entry._id,
        sourceRefId: entry._id,
        productId: entry.materialType?._id || entry.materialType,
        productName: entry.materialTypeName || entry.materialType?.name || "-",
        unit: entry.unit || entry.materialType?.unit || "",
        partyName: entry.vehicleNo || entry.vehicle?.vehicleNo || entry.vehicle?.vehicleNumber || "-",
        date: entry.usedDate || entry.createdAt,
        entryCreatedAt: entry.createdAt,
        refNumber: entry.vehicleNo || entry.vehicle?.vehicleNo || entry.vehicle?.vehicleNumber || "-",
        inQty: 0,
        outQty: toNumber(entry.usedQty),
        rate: 0,
        amount: 0,
        note: String(entry.notes || "").trim(),
      })),
  ].sort((firstRow, secondRow) => {
    const firstTime = new Date(firstRow.entryCreatedAt || firstRow.date).getTime() || 0;
    const secondTime = new Date(secondRow.entryCreatedAt || secondRow.date).getTime() || 0;
    if (firstTime !== secondTime) return firstTime - secondTime;
    return String(firstRow.refId || "").localeCompare(String(secondRow.refId || ""));
  });

  const runningQtyByProduct = new Map();
  const ledger = ledgerRows.map((row) => {
    const key = String(row.productId || row.productName || "");
    const nextRunningQty = toNumber(runningQtyByProduct.get(key)) + toNumber(row.inQty) - toNumber(row.outQty);
    runningQtyByProduct.set(key, nextRunningQty);

    return {
      ...row,
      runningQty: nextRunningQty,
    };
  });

  const currentStock = stocks.map((stock) => ({
    productId: stock._id,
    productName: stock.name || "-",
    unit: stock.unit || "",
    currentStock: toNumber(stock.currentStock),
  }));

  return {
    ledger,
    currentStock,
  };
};

const getOutstanding = async (_req, res) => {
  try {
    const { parties, ledgerRows } = await getPartyLedgerData({
      partyId: null,
      fromDate: null,
      toDate: null,
    });

    return res.json(buildOutstandingResponse(parties, ledgerRows));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load outstanding summary",
      error: error.message,
    });
  }
};

const getPartyLedger = async (req, res) => {
  try {
    const partyId = toObjectId(req.query.partyId);
    const fromDate = toDateBoundary(req.query.fromDate);
    const toDate = toDateBoundary(req.query.toDate, true);

    const { ledgerRows } = await getPartyLedgerData({ partyId, fromDate, toDate });
    return res.json(ledgerRows);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load party ledger",
      error: error.message,
    });
  }
};

const getStockLedger = async (req, res) => {
  try {
    const productId = toObjectId(req.query.productId);
    const fromDate = toDateBoundary(req.query.fromDate);
    const toDate = toDateBoundary(req.query.toDate, true);

    const stockLedger = await getStockLedgerData({ productId, fromDate, toDate });
    return res.json(stockLedger);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load stock ledger",
      error: error.message,
    });
  }
};

const getPartyLedgerEntryDetail = async (req, res) => {
  try {
    const type = String(req.query.type || "").trim().toLowerCase();
    const refId = req.query.refId;

    if (!refId || !mongoose.Types.ObjectId.isValid(refId)) {
      return res.status(400).json({ message: "Valid refId is required" });
    }

    if (type === "sale") {
      const sale = await Sales.findById(refId).populate("partyId", "name");
      if (!sale) return res.status(404).json({ message: "Sale not found" });

      return res.json({
        title: "Sale Voucher",
        refNumber: sale.invoiceNumber || "-",
        partyName: sale.partyId?.name || "-",
        amount: toNumber(sale.totalAmount),
        quantity: toNumber(sale.materialWeight, toNumber(sale.netWeight)),
        method: sale.vehicleNo || "-",
        date: sale.saleDate || sale.createdAt,
        accountName: sale.partyId?.name || "-",
        linkedReference: sale.vehicleNo || "",
        notes: "",
        fields: [
          { label: "Invoice Date", value: sale.saleDate || sale.createdAt },
          { label: "Sale Type", value: getSaleTypeLabel(sale.type) },
          { label: "Paid Amount", value: formatAmount(getSaleAmounts(sale).paidAmount) },
          { label: "Pending Amount", value: formatAmount(getSaleAmounts(sale).pendingAmount) },
          { label: "Vehicle No", value: sale.vehicleNo || "-" },
          { label: "Material Type", value: sale.stoneSize || "-" },
          { label: "Gross Weight", value: toNumber(sale.netWeight) || "-" },
          { label: "Tare Weight", value: toNumber(sale.vehicleWeight) || "-" },
          { label: "Net Weight", value: toNumber(sale.materialWeight) || "-" },
          { label: "Rate Per Ton", value: toNumber(sale.rate) || "-" },
        ],
        items: [],
      });
    }

    if (type === "purchase") {
      const purchase = await Purchase.findById(refId)
        .populate("party", "name")
        .populate("items.product", "name unit");

      if (!purchase) return res.status(404).json({ message: "Purchase not found" });

      return res.json({
        title: "Purchase Voucher",
        refNumber: formatPurchaseNumber(purchase.purchaseNumber),
        partyName: purchase.party?.name || "-",
        amount: toNumber(purchase.totalAmount),
        quantity: Array.isArray(purchase.items)
          ? purchase.items.reduce((sum, row) => sum + toNumber(row.quantity), 0)
          : 0,
        method: purchase.supplierInvoice || "-",
        date: purchase.purchaseDate || purchase.createdAt,
        accountName: purchase.party?.name || "-",
        linkedReference: purchase.supplierInvoice || "",
        notes: String(purchase.notes || "").trim(),
        fields: [
          { label: "Purchase Date", value: purchase.purchaseDate || purchase.createdAt },
          { label: "Supplier Invoice", value: purchase.supplierInvoice || "-" },
          { label: "Invoice Link", value: purchase.invoiceLink || "-" },
        ],
        items: Array.isArray(purchase.items)
          ? purchase.items.map((item, index) => ({
              id: `${purchase._id}-${index}`,
              productName: item.productName || item.product?.name || "Item",
              quantity: toNumber(item.quantity),
              unitPrice: toNumber(item.unitPrice),
              total: toNumber(item.total),
              unit: item.unit || item.product?.unit || "",
            }))
          : [],
      });
    }

    if (type === "receipt") {
      const receipt = await Receipt.findById(refId).populate("party", "name");
      if (!receipt) return res.status(404).json({ message: "Receipt not found" });

      const linkedSale = receipt.refType === "sale" && receipt.refId
        ? await Sales.findById(receipt.refId).select("invoiceNumber")
        : null;

      return res.json({
        title: "Receipt Voucher",
        refNumber: formatReceiptNumber(receipt.receiptNumber),
        partyName: receipt.party?.name || "-",
        amount: toNumber(receipt.amount),
        quantity: 0,
        method: receipt.method || "-",
        date: receipt.receiptDate || receipt.createdAt,
        accountName: receipt.party?.name || "-",
        linkedReference: linkedSale?.invoiceNumber || "",
        notes: String(receipt.notes || "").trim(),
        fields: [
          { label: "Receipt Date", value: receipt.receiptDate || receipt.createdAt },
          { label: "Method", value: receipt.method || "-" },
          { label: "Reference Type", value: receipt.refType || "-" },
        ],
        items: [],
      });
    }

    if (type === "payment") {
      const payment = await Payment.findById(refId).populate("party", "name");
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      const linkedPurchase = payment.refType === "purchase" && payment.refId
        ? await Purchase.findById(payment.refId).select("purchaseNumber")
        : null;

      return res.json({
        title: "Payment Voucher",
        refNumber: formatPaymentNumber(payment.paymentNumber),
        partyName: payment.party?.name || "-",
        amount: toNumber(payment.amount),
        quantity: 0,
        method: payment.method || "-",
        date: payment.paymentDate || payment.createdAt,
        accountName: payment.party?.name || "-",
        linkedReference: linkedPurchase ? formatPurchaseNumber(linkedPurchase.purchaseNumber) : "",
        notes: String(payment.notes || "").trim(),
        fields: [
          { label: "Payment Date", value: payment.paymentDate || payment.createdAt },
          { label: "Method", value: payment.method || "-" },
          { label: "Reference Type", value: payment.refType || "-" },
        ],
        items: [],
      });
    }

    return res.status(400).json({ message: "Voucher detail is not supported for this type yet" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load voucher detail",
      error: error.message,
    });
  }
};

const getDayBook = async (req, res) => {
  try {
    const fromDate = toDateBoundary(req.query.fromDate);
    const toDate = toDateBoundary(req.query.toDate, true);

    const [
      sales,
      purchases,
      payments,
      receipts,
      expenses,
      boulders,
      materialUsedEntries,
    ] = await Promise.all([
      Sales.find().populate("partyId", "name").sort({ saleDate: -1, createdAt: -1 }),
      Purchase.find().populate("party", "name").sort({ purchaseDate: -1, createdAt: -1 }),
      Payment.find().populate("party", "name").sort({ paymentDate: -1, createdAt: -1 }),
      Receipt.find().populate("party", "name").sort({ receiptDate: -1, createdAt: -1 }),
      Expense.find().populate("party", "name").populate("expenseGroup", "name").sort({ expenseDate: -1, createdAt: -1 }),
      Boulder.find().sort({ boulderDate: -1, createdAt: -1 }),
      MaterialUsed.find().populate("vehicle", "vehicleNo vehicleNumber").populate("materialType", "name").sort({ usedDate: -1, createdAt: -1 }),
    ]);

    const entries = [
      ...sales
        .filter((item) => withinRange(item.saleDate || item.createdAt, fromDate, toDate))
        .map((item) => {
          const saleAmounts = getSaleAmounts(item);
          const saleCashIn = item.type === "cash sale" ? saleAmounts.appliedAmount : 0;

          return {
          type: "sale",
          displayType: getEntryDisplayType("sale", item.type),
          refId: item._id,
            date: item.saleDate || item.createdAt,
            entryCreatedAt: item.createdAt,
            voucherNumber: item.invoiceNumber || "-",
            partyName: item.partyId?.name || "-",
            materialSummary: buildSaleMaterialSummary(item),
            method: [
              getSaleTypeLabel(item.type),
              item.vehicleNo ? `Vehicle ${item.vehicleNo}` : "",
              item.stoneSize ? `Material ${String(item.stoneSize).toUpperCase()}` : "",
            ].filter(Boolean).join(" | ") || "-",
            amount: saleAmounts.totalAmount,
            inAmount: saleCashIn,
            outAmount: 0,
          };
        }),
      ...purchases
        .filter((item) => withinRange(item.purchaseDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "purchase",
          displayType: getEntryDisplayType("purchase", item.type),
          refId: item._id,
          date: item.purchaseDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: formatPurchaseNumber(item.purchaseNumber),
          partyName: item.party?.name || "-",
          method: item.supplierInvoice || "-",
          amount: Number(item.totalAmount || 0),
          inAmount: 0,
          outAmount: Number(item.totalAmount || 0),
        })),
      ...payments
        .filter((item) => withinRange(item.paymentDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "payment",
          displayType: getEntryDisplayType("payment"),
          refId: item._id,
          date: item.paymentDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: formatPaymentNumber(item.paymentNumber),
          partyName: item.party?.name || "-",
          method: item.method || "-",
          amount: Number(item.amount || 0),
          inAmount: 0,
          outAmount: Number(item.amount || 0),
        })),
      ...receipts
        .filter((item) => withinRange(item.receiptDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "receipt",
          displayType: getEntryDisplayType("receipt"),
          refId: item._id,
          date: item.receiptDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: formatReceiptNumber(item.receiptNumber),
          partyName: item.party?.name || "-",
          method: item.method || "-",
          amount: Number(item.amount || 0),
          inAmount: Number(item.amount || 0),
          outAmount: 0,
        })),
      ...expenses
        .filter((item) => withinRange(item.expenseDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "expense",
          displayType: getEntryDisplayType("expense"),
          refId: item._id,
          date: item.expenseDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: item.expenseNumber || "-",
          partyName: item.party?.name || item.expenseGroup?.name || "-",
          method: item.method || "-",
          amount: Number(item.amount || 0),
          inAmount: 0,
          outAmount: Number(item.amount || 0),
        })),
      ...boulders
        .filter((item) => withinRange(item.boulderDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "boulder",
          displayType: getEntryDisplayType("boulder"),
          refId: item._id,
          date: item.boulderDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: item.vehicleNo || "-",
          partyName: item.vehicleNo || "-",
          method: `Gross ${Number(item.grossWeight || 0)} | Tare ${Number(item.tareWeight || 0)} | Net ${Number(item.netWeight || 0)}`,
          amount: 0,
          inAmount: 0,
          outAmount: 0,
        })),
      ...materialUsedEntries
        .filter((item) => withinRange(item.usedDate || item.createdAt, fromDate, toDate))
        .map((item) => ({
          type: "materialUsed",
          displayType: getEntryDisplayType("materialUsed"),
          refId: item._id,
          date: item.usedDate || item.createdAt,
          entryCreatedAt: item.createdAt,
          voucherNumber: item.vehicleNo || item.vehicle?.vehicleNo || item.vehicle?.vehicleNumber || "-",
          partyName: item.materialTypeName || item.materialType?.name || "-",
          method: `${Number(item.usedQty || 0)} ${item.unit || ""}`.trim() || "-",
          amount: 0,
          inAmount: 0,
          outAmount: 0,
        })),
    ].sort((a, b) => {
      const aTime = new Date(a.entryCreatedAt || a.date).getTime() || 0;
      const bTime = new Date(b.entryCreatedAt || b.date).getTime() || 0;
      return bTime - aTime;
    });

    return res.json({
      summary: buildSummary(entries),
      entries,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load day book",
      error: error.message,
    });
  }
};

module.exports = {
  getDayBook,
  getOutstanding,
  getPartyLedger,
  getPartyLedgerEntryDetail,
  getStockLedger,
};
