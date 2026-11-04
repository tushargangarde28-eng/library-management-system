import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  ShieldCheck,
  Clock,
  IndianRupee,
  Calendar,
  Save,
  RotateCcw,
  RefreshCw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Info,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Toast from '../../components/common/Toast';
import { loanService } from '../../api/loanService';

export default function LoanPolicyPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentConfig, setCurrentConfig] = useState({
    borrowingLimit: 3,
    periodDays: 8,
    finePerDay: 5.0,
    updatedAt: null,
  });

  // Form state
  const [borrowingLimit, setBorrowingLimit] = useState('3');
  const [periodDays, setPeriodDays] = useState('8');
  const [finePerDay, setFinePerDay] = useState('5.00');

  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Fetch live configuration from Spring Boot GET /api/loan-configuration
  const fetchPolicy = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loanService.getLoanConfiguration();
      if (data) {
        setCurrentConfig(data);
        setBorrowingLimit(String(data.borrowingLimit ?? 3));
        setPeriodDays(String(data.periodDays ?? 8));
        setFinePerDay(Number(data.finePerDay ?? 5).toFixed(2));
      }
    } catch (err) {
      console.error('[LoanPolicyPage] Error fetching configuration:', err);
      showToast(err.message || 'Failed to fetch loan configuration from backend.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPolicy();
  }, [fetchPolicy]);

  // Quick Preset Helper
  const applyPreset = (limit, days, fine) => {
    setBorrowingLimit(String(limit));
    setPeriodDays(String(days));
    setFinePerDay(Number(fine).toFixed(2));
    setFormErrors({});
  };

  const validate = () => {
    const errors = {};
    const limitNum = Number(borrowingLimit);
    const daysNum = Number(periodDays);
    const fineNum = Number(finePerDay);

    if (isNaN(limitNum) || limitNum < 1 || !Number.isInteger(limitNum)) {
      errors.borrowingLimit = 'Borrowing limit must be an integer of at least 1 book.';
    }

    if (isNaN(daysNum) || daysNum < 1 || !Number.isInteger(daysNum)) {
      errors.periodDays = 'Loan period must be an integer of at least 1 day.';
    }

    if (isNaN(fineNum) || fineNum < 0) {
      errors.finePerDay = 'Fine per day must be a non-negative number (min ₹0.00).';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit update via PUT /api/loan-configuration
  const handleSavePolicy = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const updated = await loanService.updateLoanConfiguration({
        borrowingLimit: Number(borrowingLimit),
        periodDays: Number(periodDays),
        finePerDay: Number(finePerDay),
      });

      setCurrentConfig(updated);
      showToast('Loan configuration policy updated successfully in database!', 'success');
    } catch (err) {
      console.error('[LoanPolicyPage] Error updating configuration:', err);
      const msg = err.friendlyMessage || err.message || 'Failed to update loan configuration.';
      showToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculated preview values
  const previewDays = Number(periodDays) || 8;
  const previewFine = Number(finePerDay) || 5;
  const previewLimit = Number(borrowingLimit) || 3;

  const sampleToday = new Date();
  const sampleDueDate = new Date();
  sampleDueDate.setDate(sampleToday.getDate() + previewDays);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div
        className="glass-card page-header-card"
        style={{
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.25)',
              }}
            >
              <Sliders size={20} />
            </div>
            <h1 className="page-title" style={{ margin: 0 }}>
              Loan Policy & System Configuration
            </h1>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '3px 9px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Enterprise Rules
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
            Configure and audit global circulation constraints from backend REST endpoint{' '}
            <code style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '2px 6px', borderRadius: '4px' }}>
              GET / PUT /api/loan-configuration
            </code>
          </p>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={fetchPolicy}
            disabled={loading || saving}
            title="Reload live policy from database"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Reload Policy</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="responsive-kpi-grid">
        <StatCard
          title="Max Borrowing Quota"
          value={`${currentConfig.borrowingLimit} Books`}
          subtitle="Concurrent active book limit per patron"
          icon={BookOpen}
          color="primary"
          loading={loading}
          badgeText="Limit per Patron"
        />

        <StatCard
          title="Circulation Duration"
          value={`${currentConfig.periodDays} Days`}
          subtitle="Calendar days before an active loan triggers overdue"
          icon={Clock}
          color="info"
          loading={loading}
          badgeText="Due Window"
        />

        <StatCard
          title="Overdue Daily Penalty"
          value={`₹${Number(currentConfig.finePerDay || 0).toFixed(2)} / day`}
          subtitle="Late return penalty rate charged per calendar day"
          icon={IndianRupee}
          color="warning"
          loading={loading}
          badgeText="Daily Penalty"
        />

        <StatCard
          title="Last Policy Audit"
          value={
            currentConfig.updatedAt
              ? new Date(currentConfig.updatedAt).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Active'
          }
          subtitle={
            currentConfig.updatedAt
              ? `Timestamp: ${new Date(currentConfig.updatedAt).toLocaleTimeString()}`
              : 'Config ID #1 (Database Default)'
          }
          icon={Calendar}
          color="success"
          loading={loading}
          badgeText="Policy Record #1"
        />
      </div>

      {/* Main Grid: Policy Editor & Live Patron Impact Simulator */}
      <div className="loan-policy-grid">
        {/* Left Column: Policy Update Form */}
        <div className="glass-card" style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <FileCheck size={20} color="var(--primary)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Edit Circulation Policy
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '22px' }}>
            Modifying these parameters updates database constraints and dynamically governs all new book checkout operations.
          </p>

          {/* Quick Presets */}
          <div style={{ marginBottom: '22px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Policy Templates:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={() => applyPreset(3, 8, 5.0)}
              >
                Standard Campus (3 books, 8 days, ₹5)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={() => applyPreset(2, 5, 10.0)}
              >
                Strict / Exam Period (2 books, 5 days, ₹10)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={() => applyPreset(5, 14, 2.0)}
              >
                Semester Break (5 books, 14 days, ₹2)
              </button>
            </div>
          </div>

          <form onSubmit={handleSavePolicy} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Field 1: Borrowing Limit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Patron Borrowing Limit (Books)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema: min 1</span>
              </div>
              <div style={{ position: 'relative' }}>
                <BookOpen size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  value={borrowingLimit}
                  onChange={(e) => setBorrowingLimit(e.target.value)}
                  placeholder="e.g. 3"
                  required
                />
              </div>
              {formErrors.borrowingLimit && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {formErrors.borrowingLimit}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Patrons who have reached this threshold are rejected by the backend borrow rule.
              </span>
            </div>

            {/* Field 2: Period Days */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Standard Loan Period (Days)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema: min 1 day</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  value={periodDays}
                  onChange={(e) => setPeriodDays(e.target.value)}
                  placeholder="e.g. 8"
                  required
                />
              </div>
              {formErrors.periodDays && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {formErrors.periodDays}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                The official return due date is automatically set to <code>Issue Date + Period Days</code>.
              </span>
            </div>

            {/* Field 3: Fine Per Day */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Daily Overdue Fine Rate (₹ INR)
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Schema: min ₹0.00</span>
              </div>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="number"
                  min="0"
                  step="0.50"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  value={finePerDay}
                  onChange={(e) => setFinePerDay(e.target.value)}
                  placeholder="e.g. 5.00"
                  required
                />
              </div>
              {formErrors.finePerDay && (
                <span style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  {formErrors.finePerDay}
                </span>
              )}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Accrued fine is automatically calculated in the backend when the book is returned past the due date.
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ flex: '1 1 180px' }}
              >
                <Save size={16} />
                <span>{saving ? 'Updating Database...' : 'Apply & Save Policy'}</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setBorrowingLimit(String(currentConfig.borrowingLimit));
                  setPeriodDays(String(currentConfig.periodDays));
                  setFinePerDay(Number(currentConfig.finePerDay).toFixed(2));
                  setFormErrors({});
                }}
                disabled={saving}
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Patron Impact & Simulation Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="glass-card" style={{ padding: '24px 26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Sparkles size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Live Patron Experience Simulation
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', marginBottom: '18px', lineHeight: 1.5 }}>
              Preview how this policy configuration will be experienced by patrons during active borrowing:
            </p>

            {/* Simulated Checkout Slip */}
            <div
              style={{
                backgroundColor: '#090e1a',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed var(--border-subtle)', paddingBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>
                  SAMPLE LOAN SLIP
                </span>
                <span className="badge badge-active" style={{ fontSize: '0.7rem' }}>
                  ACTIVE POLICY PREVIEW
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Active Allocation:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{previewLimit} Books per Patron</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Issue Date:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {sampleToday.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Mandatory Return Date:</span>
                <strong style={{ color: '#34d399' }}>
                  {sampleDueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })} ({previewDays} Days)
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>If Returned 3 Days Late:</span>
                <strong style={{ color: '#f87171' }}>
                  ₹{(3 * previewFine).toFixed(2)} Penalty (3 × ₹{previewFine.toFixed(2)})
                </strong>
              </div>
            </div>

            {/* Database Constraints Checklist */}
            <div style={{ marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Database Schema Verification:
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Enforces <code>id = 1</code> singleton table constraint</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Enforces <code>borrowing_limit &gt; 0</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Enforces <code>period_days &gt; 0</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#a7f3d0' }}>
                <CheckCircle2 size={14} color="#10b981" />
                <span>Enforces <code>fine_per_day &gt;= 0.00</code></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

