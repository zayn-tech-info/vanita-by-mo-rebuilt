import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { getConvexErrorMessage } from "../../lib/convexError";
import { Tag, Plus, Loader2, X, Copy, Check } from "lucide-react";
import { toast } from "react-toastify";

const typeOptions = [
  { value: "percent", label: "Percentage off" },
  { value: "fixed", label: "Fixed amount off ($)" },
];

const emptyForm = {
  code: "",
  type: "percent",
  value: "",
  expiresAt: "",
  maxUses: "",
  minPurchase: "",
};

export function AdminRedeemCodes() {
  const codes = useQuery(api.redeemCodes.list) ?? [];
  const createCode = useMutation(api.redeemCodes.create);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const userId = localStorage.getItem("userId");

  const openCreate = () => {
    setFormData(emptyForm);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "code") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = formData.code?.trim();
    const value = formData.type === "percent" ? Number(formData.value) : Number(formData.value);
    const maxUses = Number(formData.maxUses) || 1;
    const minPurchase = formData.minPurchase ? Number(formData.minPurchase) : undefined;

    if (!code) {
      toast.error("Enter a code");
      return;
    }
    if (value <= 0 || (formData.type === "percent" && value > 100)) {
      toast.error(formData.type === "percent" ? "Percentage must be 1–100" : "Amount must be greater than 0");
      return;
    }
    if (!formData.expiresAt) {
      toast.error("Select an expiry date");
      return;
    }

    const expiresAt = new Date(formData.expiresAt).getTime();
    if (expiresAt <= Date.now()) {
      toast.error("Expiry date must be in the future");
      return;
    }

    setLoading(true);
    try {
      await createCode({
        userId,
        code,
        type: formData.type,
        value,
        expiresAt,
        maxUses,
        minPurchase,
      });
      toast.success(`Code "${code}" created`);
      setShowModal(false);
      setFormData(emptyForm);
    } catch (err) {
      toast.error(getConvexErrorMessage(err, "Failed to create code"));
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatExpiry = (ts) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (ts) => ts < Date.now();
  const isExhausted = (row) => row.usedCount >= row.maxUses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-light text-stone-800 tracking-wide">
            Redeem codes
          </h1>
          <p className="text-sm text-stone-500 font-light mt-1">
            Create and manage discount codes for checkout
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium tracking-wide rounded-lg hover:bg-stone-800 transition-colors"
        >
          <Plus size={18} />
          Create code
        </button>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {codes.length === 0 ? (
          <div className="text-center py-16">
            <Tag size={40} className="mx-auto text-stone-300 mb-3" />
            <p className="text-sm text-stone-500 font-light mb-4">
              No redeem codes yet
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm rounded-lg hover:bg-stone-800"
            >
              <Plus size={16} />
              Create your first code
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50/80">
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                    Value
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                    Uses
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-stone-500 tracking-wider uppercase w-20">
                    Copy
                  </th>
                </tr>
              </thead>
              <tbody>
                {codes.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-stone-100 hover:bg-stone-50/50"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-stone-800">
                        {row.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600 capitalize">
                      {row.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-700">
                      {row.type === "percent"
                        ? `${row.value}%`
                        : `$${row.value.toFixed(2)}`}
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      <span className={isExhausted(row) ? "text-amber-600" : ""}>
                        {row.usedCount} / {row.maxUses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-600">
                      <span
                        className={
                          isExpired(row.expiresAt) ? "text-red-600" : ""
                        }
                      >
                        {formatExpiry(row.expiresAt)}
                        {isExpired(row.expiresAt) && " (expired)"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => copyCode(row.code)}
                        className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded"
                        title="Copy code"
                      >
                        {copiedCode === row.code ? (
                          <Check size={16} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-lg font-medium text-stone-800 tracking-wide">
                Create redeem code
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. SAVE10"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                  maxLength={32}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Discount type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                >
                  {typeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Value {formData.type === "percent" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  min={formData.type === "percent" ? 1 : 0.01}
                  max={formData.type === "percent" ? 100 : undefined}
                  step={formData.type === "percent" ? 1 : 0.01}
                  placeholder={formData.type === "percent" ? "10" : "5.00"}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Max uses
                </label>
                <input
                  type="number"
                  name="maxUses"
                  value={formData.maxUses}
                  onChange={handleChange}
                  min={1}
                  placeholder="1"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Expires at
                </label>
                <input
                  type="datetime-local"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                  Min. order (optional)
                </label>
                <input
                  type="number"
                  name="minPurchase"
                  value={formData.minPurchase}
                  onChange={handleChange}
                  min={0}
                  step={0.01}
                  placeholder="0"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-800 focus:border-amber-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-stone-200 text-stone-700 text-sm font-medium rounded-lg hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  Create code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
