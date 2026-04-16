import React, { useState, useEffect } from 'react';
import { Printer, FileText, Wallet2, CheckCircle2, Calendar, User, DollarSign, LayoutGrid, LayoutList } from 'lucide-react';
import api from '../../api/axios';
import { formatCurrency, formatDateLocal } from '../../utils/formatters';
import '../../styles/pages/Print/PrintPage.css';

const PrintPage = () => {
    const [selectedType, setSelectedType] = useState(''); // 'settlements' or 'utangs'
    const [selectedStatus, setSelectedStatus] = useState(''); // 'paid' or 'pending'
    const [selectedMonth, setSelectedMonth] = useState(''); // 'YYYY-MM' format
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

    useEffect(() => {
        if (selectedType && selectedStatus) {
            fetchData();
        }
    }, [selectedType, selectedStatus, selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (selectedType === 'settlements') {
                const response = await api.get('/bills');
                const bills = response.data?.data || response.data?.bills || [];
                
                console.log('Fetched bills:', bills.length);
                console.log('Sample bill:', bills[0]);
                
                // Filter by status
                let filtered = bills.filter(bill => bill.status === selectedStatus);
                
                console.log('Filtered by status:', filtered.length);
                
                // Filter by month if selected - ALWAYS use due_date for settlements
                if (selectedMonth) {
                    filtered = filtered.filter(bill => {
                        const billDate = bill.due_date; // Always use due_date for month filtering
                        if (!billDate) return false;
                        const billMonth = billDate.substring(0, 7); // Get YYYY-MM
                        return billMonth === selectedMonth;
                    });
                    console.log('Filtered by month:', filtered.length);
                }
                
                setData(filtered);
                
                // Extract available months for filtering - ALWAYS from due_date
                if (!selectedMonth) {
                    const months = new Set();
                    bills.forEach(bill => {
                        if (bill.due_date) {
                            months.add(bill.due_date.substring(0, 7));
                        }
                    });
                    const monthsArray = Array.from(months).sort().reverse();
                    console.log('Available months:', monthsArray);
                    setAvailableMonths(monthsArray);
                }
            } else if (selectedType === 'utangs') {
                const response = await api.get('/debts', {
                    params: { status: selectedStatus }
                });
                const debts = response.data?.debts || [];
                
                console.log('Fetched debts:', debts.length);
                console.log('Sample debt:', debts[0]);
                
                // Filter by month if selected
                let filtered = debts;
                if (selectedMonth) {
                    filtered = debts.filter(debt => {
                        // For utangs: use created_at for pending, paid_at for paid
                        const debtDate = selectedStatus === 'paid' ? debt.paid_at : debt.created_at;
                        if (!debtDate) return false;
                        const debtMonth = debtDate.substring(0, 7);
                        return debtMonth === selectedMonth;
                    });
                    console.log('Filtered debts by month:', filtered.length);
                }
                
                setData(filtered);
                
                // Extract available months
                if (!selectedMonth) {
                    const months = new Set();
                    debts.forEach(debt => {
                        // For utangs: use created_at for pending, paid_at for paid
                        const dateField = selectedStatus === 'paid' ? debt.paid_at : debt.created_at;
                        if (dateField) {
                            months.add(dateField.substring(0, 7));
                        }
                    });
                    const monthsArray = Array.from(months).sort().reverse();
                    console.log('Available debt months:', monthsArray);
                    setAvailableMonths(monthsArray);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectItem = (id) => {
        setSelectedItems(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedItems.length === data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(data.map(item => item.id));
        }
    };

    const handlePrint = () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item to print');
            return;
        }
        
        // Check if mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile) {
            // For mobile, show a message about saving as PDF
            const confirmPrint = window.confirm(
                'On mobile, use your browser\'s "Save as PDF" or "Print to PDF" option to save a copy.\n\nProceed to print?'
            );
            if (!confirmPrint) return;
        }
        
        window.print();
    };

    const getMonthName = (monthStr) => {
        if (!monthStr) return '';
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    const selectedData = data.filter(item => selectedItems.includes(item.id));

    return (
        <div className="print-page">
            {/* Screen View - Selection Interface */}
            <div className="screen-only">
                <div className="print-header">
                    <div className="print-header-content">
                        <div className="print-title-section">
                            <div className="print-icon-wrapper">
                                <Printer size={32} />
                            </div>
                            <div>
                                <h1 className="print-title">Print Records</h1>
                                <p className="print-subtitle">Select and print detailed payment records</p>
                            </div>
                        </div>
                        {selectedType && selectedStatus && (
                            <button 
                                onClick={handlePrint}
                                disabled={selectedItems.length === 0}
                                className="print-button"
                            >
                                <Printer size={18} />
                                Print Selected ({selectedItems.length})
                            </button>
                        )}
                    </div>
                    
                    {/* Mobile Print Instructions */}
                    <div className="mobile-print-info">
                        <div className="info-icon">ℹ️</div>
                        <div className="info-content">
                            <p className="info-title">Mobile Users</p>
                            <p className="info-text">
                                On mobile, use your browser's "Save as PDF" or "Print to PDF" option to save a digital copy.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="print-content">
                    {/* Step 1: Select Type */}
                    <div className="selection-section">
                        <h2 className="section-title">Step 1: Select Record Type</h2>
                        <div className="type-cards grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    setSelectedType('settlements');
                                    setSelectedStatus('');
                                    setData([]);
                                    setSelectedItems([]);
                                }}
                                className={`type-card ${selectedType === 'settlements' ? 'type-card-active' : ''}`}
                            >
                                <div className="type-card-icon settlements">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="type-card-title">Settlements</h3>
                                <p className="type-card-description">Bills and payment records</p>
                            </button>

                            <button
                                onClick={() => {
                                    setSelectedType('utangs');
                                    setSelectedStatus('');
                                    setData([]);
                                    setSelectedItems([]);
                                }}
                                className={`type-card ${selectedType === 'utangs' ? 'type-card-active' : ''}`}
                            >
                                <div className="type-card-icon utangs">
                                    <Wallet2 size={32} />
                                </div>
                                <h3 className="type-card-title">Utangs</h3>
                                <p className="type-card-description">Debt and collection records</p>
                            </button>
                        </div>
                    </div>

                    {/* Step 2: Select Status */}
                    {selectedType && (
                        <div className="selection-section">
                            <h2 className="section-title">Step 2: Select Status</h2>
                            <div className="status-buttons grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedStatus('paid');
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`status-button ${selectedStatus === 'paid' ? 'status-button-active' : ''}`}
                                >
                                    <CheckCircle2 size={20} />
                                    Paid / Settled
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedStatus('pending');
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`status-button ${selectedStatus === 'pending' ? 'status-button-active' : ''}`}
                                >
                                    <Calendar size={20} />
                                    Pending / Due
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Select Month (for both Settlements and Utangs) */}
                    {selectedType && selectedStatus && (
                        <div className="selection-section">
                            <h2 className="section-title">Step 3: Filter by Month (Optional)</h2>
                            <div className="month-filter">
                                <button
                                    onClick={() => {
                                        setSelectedMonth('');
                                        setSelectedItems([]);
                                    }}
                                    className={`month-button ${selectedMonth === '' ? 'month-button-active' : ''}`}
                                >
                                    All Months
                                </button>
                                {availableMonths.map(month => (
                                    <button
                                        key={month}
                                        onClick={() => {
                                            setSelectedMonth(month);
                                            setSelectedItems([]);
                                        }}
                                        className={`month-button ${selectedMonth === month ? 'month-button-active' : ''}`}
                                    >
                                        {getMonthName(month)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 4: Select Items */}
                    {selectedType && selectedStatus && (
                        <div className="selection-section">
                            <div className="items-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="section-title mb-0">Step 4: Select Items to Print</h2>
                                <div className="flex items-center gap-2">
                                    {/* View Mode Toggle */}
                                    <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-green-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="List View"
                                        >
                                            <LayoutList size={18} />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-green-900 text-white' : 'text-gray-400 hover:text-gray-600'}`}
                                            title="Grid View"
                                        >
                                            <LayoutGrid size={18} />
                                        </button>
                                    </div>
                                    {data.length > 0 && (
                                        <button onClick={toggleSelectAll} className="select-all-button whitespace-nowrap">
                                            {selectedItems.length === data.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {loading ? (
                                <div className="loading-state">
                                    <div className="spinner"></div>
                                    <p>Loading records...</p>
                                </div>
                            ) : data.length === 0 ? (
                                <div className="empty-state">
                                    <FileText size={48} />
                                    <p>No records found</p>
                                </div>
                            ) : (
                                <div className={viewMode === 'grid' ? 'items-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'items-list'}>
                                    {data.map(item => (
                                        <div
                                            key={item.id}
                                            onClick={() => toggleSelectItem(item.id)}
                                            className={`item-card ${selectedItems.includes(item.id) ? 'item-card-selected' : ''}`}
                                        >
                                            <div className="item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => {}}
                                                />
                                            </div>
                                            <div className="item-details flex-1 min-w-0">
                                                <h4 className="item-title truncate">
                                                    {selectedType === 'settlements' ? item.details || item.name : item.description}
                                                </h4>
                                                <div className="item-meta flex-wrap">
                                                    {selectedType === 'settlements' && item.person_in_charge && (
                                                        <span className="item-meta-tag">
                                                            <User size={12} />
                                                            <span className="truncate">{item.person_in_charge.first_name} {item.person_in_charge.last_name}</span>
                                                        </span>
                                                    )}
                                                    {selectedType === 'utangs' && item.person_in_charge && (
                                                        <span className="item-meta-tag">
                                                            <User size={12} />
                                                            <span className="truncate">{item.person_in_charge.first_name} {item.person_in_charge.last_name}</span>
                                                        </span>
                                                    )}
                                                    <span className="item-meta-tag">
                                                        <Calendar size={12} />
                                                        <span className="truncate">
                                                            {(() => {
                                                                if (selectedType === 'settlements') {
                                                                    if (selectedStatus === 'paid') {
                                                                        const paymentDate = item.proof_of_payments?.[0]?.created_at;
                                                                        return paymentDate ? formatDateLocal(paymentDate) : 'No Date';
                                                                    } else {
                                                                        return item.due_date ? formatDateLocal(item.due_date) : 'No Date';
                                                                    }
                                                                } else {
                                                                    const dateValue = selectedStatus === 'paid' ? item.paid_at : item.created_at;
                                                                    return dateValue ? formatDateLocal(dateValue) : 'No Date';
                                                                }
                                                            })()}
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="item-amount whitespace-nowrap">
                                                {formatCurrency(item.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Print View - Professional Document */}
            <div className="print-only">
                <div className="print-document">

                    {/* Top colour band */}
                    <div className="doc-top-band"></div>

                    {/* Document Header */}
                    <div className="document-header">
                        <div className="doc-header-table">
                            <div className="doc-header-left">
                                <img
                                    src="/src/assets/REMINDear-Logo.png"
                                    alt="REMINDear"
                                    className="doc-logo-img"
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div className="doc-header-center">
                                <div className="document-title">Remindear</div>
                                <div className="document-subtitle">
                                    {selectedType === 'settlements' ? 'Settlement Records Report' : 'Utang Records Report'}
                                </div>
                                <div className="doc-status-line">
                                    {selectedStatus === 'paid' ? 'Paid / Settled' : 'Pending / Due'}
                                    {selectedMonth && ` — ${getMonthName(selectedMonth)}`}
                                </div>
                            </div>
                            <div className="doc-header-right">
                                <div className="doc-date-label">Generated On</div>
                                <div className="doc-date-value">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
                                <div className="doc-ref">Ref # RPT-{Date.now()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="doc-section-heading">Summary</div>
                    <div className="doc-summary-cards">
                        <div className="doc-card doc-card-total">
                            <div className="doc-card-label">Total Records</div>
                            <div className="doc-card-value">{selectedData.length}</div>
                            <div className="doc-card-sub">records</div>
                        </div>
                        <div className="doc-card doc-card-amount">
                            <div className="doc-card-label">Total Amount</div>
                            <div className="doc-card-value">{formatCurrency(selectedData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))}</div>
                            <div className="doc-card-sub">all selected</div>
                        </div>
                        <div className="doc-card doc-card-type">
                            <div className="doc-card-label">Record Type</div>
                            <div className="doc-card-value" style={{ fontSize: '11pt' }}>{selectedType === 'settlements' ? 'Settlements' : 'Utangs'}</div>
                            <div className="doc-card-sub">{selectedStatus === 'paid' ? 'Paid / Settled' : 'Pending / Due'}</div>
                        </div>
                        <div className="doc-card doc-card-date">
                            <div className="doc-card-label">Period</div>
                            <div className="doc-card-value" style={{ fontSize: '11pt' }}>{selectedMonth ? getMonthName(selectedMonth) : 'All Months'}</div>
                            <div className="doc-card-sub">filter applied</div>
                        </div>
                    </div>

                    {/* Records Table */}
                    <div className="doc-section-heading">Records</div>
                    <table className="doc-table">
                        <thead>
                            <tr>
                                <th className="doc-th" style={{ width: '4%' }}>#</th>
                                <th className="doc-th" style={{ width: '26%' }}>
                                    {selectedType === 'settlements' ? 'Bill Details' : 'Description'}
                                </th>
                                {selectedType === 'settlements' && <th className="doc-th" style={{ width: '14%' }}>Category</th>}
                                <th className="doc-th" style={{ width: '16%' }}>Person In Charge</th>
                                <th className="doc-th" style={{ width: '12%' }}>
                                    {selectedStatus === 'paid' ? 'Date Paid' : 'Due Date'}
                                </th>
                                <th className="doc-th doc-th-r" style={{ width: '13%' }}>Amount</th>
                                <th className="doc-th doc-th-c" style={{ width: '10%' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedData.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="doc-no-data">No records selected for this report.</td>
                                </tr>
                            ) : (
                                selectedData.map((item, index) => {
                                    const dateValue = (() => {
                                        if (selectedType === 'settlements') {
                                            return selectedStatus === 'paid'
                                                ? item.proof_of_payments?.[0]?.created_at
                                                : item.due_date;
                                        }
                                        return selectedStatus === 'paid' ? item.paid_at : item.created_at;
                                    })();

                                    return (
                                        <tr key={item.id} className={index % 2 === 0 ? 'doc-tr-odd' : 'doc-tr-even'}>
                                            <td className="doc-td doc-td-c">{index + 1}</td>
                                            <td className="doc-td">
                                                {selectedType === 'settlements' ? (item.details || item.name || '—') : (item.description || '—')}
                                            </td>
                                            {selectedType === 'settlements' && (
                                                <td className="doc-td">{item.category?.name || '—'}</td>
                                            )}
                                            <td className="doc-td">
                                                {item.person_in_charge
                                                    ? `${item.person_in_charge.first_name} ${item.person_in_charge.last_name}`
                                                    : '—'}
                                            </td>
                                            <td className="doc-td">
                                                {dateValue ? formatDateLocal(dateValue) : '—'}
                                            </td>
                                            <td className="doc-td doc-td-r">{formatCurrency(item.amount)}</td>
                                            <td className="doc-td doc-td-c">
                                                <span className={selectedStatus === 'paid' ? 'doc-pill doc-pill-paid' : 'doc-pill doc-pill-unpaid'}>
                                                    {selectedStatus === 'paid' ? 'Paid' : 'Pending'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                        {selectedData.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={selectedType === 'settlements' ? 5 : 4} className="doc-tfoot-label">TOTAL</td>
                                    <td className="doc-tfoot-amount">
                                        {formatCurrency(selectedData.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0))}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>

                    {/* Proof Images (paid only) */}
                    {selectedStatus === 'paid' && selectedData.some(item =>
                        (selectedType === 'settlements' && item.proof_of_payments?.[0]?.file_path) ||
                        (selectedType === 'utangs' && item.proof_image_path)
                    ) && (
                        <>
                            <div className="doc-section-heading">Payment Proofs</div>
                            <div className="doc-proofs-grid">
                                {selectedData.map((item, index) => {
                                    const imgSrc = selectedType === 'settlements'
                                        ? item.proof_of_payments?.[0]?.file_path
                                        : item.proof_image_path;
                                    if (!imgSrc) return null;
                                    return (
                                        <div key={item.id} className="doc-proof-card">
                                            <div className="doc-proof-label">
                                                #{index + 1} — {selectedType === 'settlements' ? (item.details || item.name) : item.description}
                                            </div>
                                            <img src={imgSrc} alt="Payment Proof" className="doc-proof-img" />
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Signatures */}
                    <div className="doc-hr"></div>
                    <div className="doc-footer-note">Generated by REMINDear System &nbsp;•&nbsp; {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                    <div className="doc-sig-row">
                        <div className="doc-sig-cell">
                            <div className="doc-sig-space"></div>
                            <div className="doc-sig-line"></div>
                            <div className="doc-sig-label">Prepared by</div>
                            <div className="doc-sig-sub">Authorized User</div>
                        </div>
                        <div className="doc-sig-cell">
                            <div className="doc-sig-space"></div>
                            <div className="doc-sig-line"></div>
                            <div className="doc-sig-label">Approved by</div>
                            <div className="doc-sig-sub">Authorized Signatory</div>
                        </div>
                    </div>

                    {/* Bottom band */}
                    <div className="doc-bottom-band"></div>
                    <div className="doc-disclaimer">This is a system-generated document from REMINDear. Please verify all information before official use.</div>
                </div>
            </div>
        </div>
    );
};

export default PrintPage;
