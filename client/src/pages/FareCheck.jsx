import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ShieldAlert, BadgeIndianRupee, Siren } from "lucide-react";
import {
  evaluateFareCheck,
  reportFareCheck,
} from "../services/fareCheck.service";

const transportOptions = [
  { label: "Petrol Auto", value: "petrol-auto" },
  { label: "CNG Auto", value: "cng-auto" },
  { label: "E-Rickshaw", value: "e-rickshaw" },
  { label: "AC Bus", value: "bus-ac" },
  { label: "Non-AC Bus", value: "bus-non-ac" },
  { label: "Janrath", value: "janrath" },
  { label: "Train", value: "train" },
  { label: "Ropeway", value: "ropeway" },
];

const riskStyles = {
  low: "bg-emerald-100 text-emerald-800 border-emerald-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-rose-100 text-rose-800 border-rose-200",
};

function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function labelize(value) {
  return String(value || "")
    .split("-")
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

export default function FareCheck() {
  const [form, setForm] = useState({
    fromLocation: "",
    toLocation: "",
    transportType: "e-rickshaw",
    quotedFare: "",
    distanceKm: "",
    people: 1,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportPayload, setReportPayload] = useState({
    reason: "overcharge",
    notes: "",
  });

  const riskClass = useMemo(
    () => riskStyles[result?.riskLevel] || riskStyles.low,
    [result?.riskLevel]
  );

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitFareCheck = async (event) => {
    event.preventDefault();

    if (!form.fromLocation.trim() || !form.toLocation.trim()) {
      toast.error("Please fill both pickup and destination.");
      return;
    }

    if (form.quotedFare === "" || Number(form.quotedFare) < 0) {
      toast.error("Please enter a valid quoted fare.");
      return;
    }

    try {
      setLoading(true);
      const response = await evaluateFareCheck({
        fromLocation: form.fromLocation.trim(),
        toLocation: form.toLocation.trim(),
        transportType: form.transportType,
        quotedFare: Number(form.quotedFare),
        distanceKm: form.distanceKm === "" ? null : Number(form.distanceKm),
        people: Number(form.people || 1),
      });

      setResult(response.data);
      setReportSent(false);
      toast.success(response.message || "Fare evaluated successfully.");
    } catch (error) {
      toast.error(error?.message || "Unable to evaluate fare right now.");
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!result?.fareCheckId || reportSent) return;

    try {
      setReporting(true);
      const response = await reportFareCheck({
        fareCheckId: result.fareCheckId,
        reason: reportPayload.reason,
        notes: reportPayload.notes.trim(),
      });
      setReportSent(true);
      toast.success(response.message || "Report submitted.");
    } catch (error) {
      toast.error(error?.message || "Unable to submit report right now.");
    } finally {
      setReporting(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 pt-26 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Fare Check</h1>
          <p className="text-slate-600 mt-2">
            Compare quoted fare with expected range and quickly flag risky rides.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={submitFareCheck}
            className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4"
          >
            <div>
              <label className="text-sm font-medium text-slate-700">
                Pickup location
              </label>
              <input
                name="fromLocation"
                value={form.fromLocation}
                onChange={onInputChange}
                placeholder="e.g., Godowlia"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Destination
              </label>
              <input
                name="toLocation"
                value={form.toLocation}
                onChange={onInputChange}
                placeholder="e.g., Assi Ghat"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Transport type
                </label>
                <select
                  name="transportType"
                  value={form.transportType}
                  onChange={onInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {transportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  People
                </label>
                <input
                  name="people"
                  type="number"
                  min="1"
                  max="20"
                  value={form.people}
                  onChange={onInputChange}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Quoted fare (INR)
                </label>
                <input
                  name="quotedFare"
                  type="number"
                  min="0"
                  value={form.quotedFare}
                  onChange={onInputChange}
                  placeholder="e.g., 180"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Distance (km, optional)
                </label>
                <input
                  name="distanceKm"
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.distanceKm}
                  onChange={onInputChange}
                  placeholder="e.g., 4.2"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white py-2.5 font-medium disabled:opacity-60"
            >
              <BadgeIndianRupee className="h-4 w-4" />
              {loading ? "Checking..." : "Check Fare"}
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            {result ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-slate-900">
                    {result.routeLabel}
                  </p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm border font-medium ${riskClass}`}
                  >
                    {labelize(result.riskLevel)} Risk
                  </span>
                </div>

                <p className="text-sm text-slate-600">
                  {labelize(result.transportType)} | Confidence:{" "}
                  <span className="font-semibold">
                    {labelize(result.confidence)}
                  </span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Quoted fare</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {formatCurrency(result.quotedFare)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Expected range</p>
                    <p className="text-xl font-semibold text-slate-900">
                      {formatCurrency(result.expectedFareMin)} -{" "}
                      {formatCurrency(result.expectedFareMax)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Overcharge amount</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {formatCurrency(result.overchargeAmount)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <p className="text-xs text-slate-500">Overcharge %</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {Number(result.overchargePercent || 0).toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                  <p className="text-sm font-medium text-teal-900 inline-flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" />
                    Recommendation
                  </p>
                  <p className="text-sm text-teal-800 mt-1">
                    {result.recommendation}
                  </p>
                  <p className="text-xs text-teal-800 mt-2">
                    Source: {labelize(result.dataSource)}{" "}
                    {result.sampleSize ? `(${result.sampleSize} samples)` : ""}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3 space-y-2">
                  <p className="text-sm font-medium text-slate-900 inline-flex items-center gap-2">
                    <Siren className="h-4 w-4" />
                    Report this quote
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={reportPayload.reason}
                      onChange={(event) =>
                        setReportPayload((prev) => ({
                          ...prev,
                          reason: event.target.value,
                        }))
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="overcharge">Overcharge</option>
                      <option value="misbehavior">Misbehavior</option>
                      <option value="route-manipulation">
                        Route manipulation
                      </option>
                      <option value="other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={submitReport}
                      disabled={reporting || reportSent}
                      className="rounded-lg bg-slate-900 text-white px-3 py-2 disabled:opacity-50"
                    >
                      {reportSent
                        ? "Reported"
                        : reporting
                          ? "Submitting..."
                          : "Submit Report"}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={reportPayload.notes}
                    onChange={(event) =>
                      setReportPayload((prev) => ({
                        ...prev,
                        notes: event.target.value,
                      }))
                    }
                    placeholder="Optional details..."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    No fare evaluated yet
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    Fill the form and check if the quote looks fair.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
